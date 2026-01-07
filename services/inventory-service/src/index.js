/* Inventory Service - Internal API for stock consumption */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Joi = require('joi');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const { connectDb } = require('./config/database');
const InventoryLedger = require('./models/inventoryLedger.model');
const RawMaterial = require('./models/rawMaterial.model');

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: 'Too many requests to inventory-service, please retry shortly.',
  }),
);

const INTERNAL_TOKEN = process.env.INVENTORY_INTERNAL_TOKEN;

const recipeComponentSchema = Joi.object({
  rawMaterialId: Joi.string().required(),
  rawMaterialName: Joi.string().required(),
  quantityPerUnit: Joi.number().positive().required(),
  unit: Joi.string().required(),
});

const itemSchema = Joi.object({
  menuItemId: Joi.string().required(),
  menuItemName: Joi.string().required(),
  quantityOrdered: Joi.number().positive().required(),
  recipeSnapshot: Joi.array().items(recipeComponentSchema).min(1).required(),
});

const consumptionSchema = Joi.object({
  orderId: Joi.string().required(),
  restaurantId: Joi.string().required(),
  outletId: Joi.string().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
});

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Inventory Service Internal API',
    version: '1.0.0',
    description:
      'Private inventory consumption endpoints used by order-service (Petpooja-style).',
  },
  tags: [{ name: 'internal', description: 'Internal-only endpoints' }],
  paths: {
    '/internal/inventory/consume': {
      post: {
        tags: ['internal'],
        summary: 'Consume inventory for a completed order',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConsumptionRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Consumption recorded (idempotent safe)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    ledgerEntryIds: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    totalRawMaterials: { type: 'number' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation or business rule failure',
          },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
  components: {
    schemas: {
      RecipeComponent: {
        type: 'object',
        required: ['rawMaterialId', 'rawMaterialName', 'quantityPerUnit', 'unit'],
        properties: {
          rawMaterialId: { type: 'string' },
          rawMaterialName: { type: 'string' },
          quantityPerUnit: { type: 'number', format: 'float' },
          unit: { type: 'string' },
        },
      },
      InventoryItem: {
        type: 'object',
        required: ['menuItemId', 'menuItemName', 'quantityOrdered', 'recipeSnapshot'],
        properties: {
          menuItemId: { type: 'string' },
          menuItemName: { type: 'string' },
          quantityOrdered: { type: 'number', format: 'float' },
          recipeSnapshot: {
            type: 'array',
            items: { $ref: '#/components/schemas/RecipeComponent' },
          },
        },
      },
      ConsumptionRequest: {
        type: 'object',
        required: ['orderId', 'restaurantId', 'outletId', 'items'],
        properties: {
          orderId: { type: 'string' },
          restaurantId: { type: 'string' },
          outletId: { type: 'string' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/InventoryItem' },
          },
        },
      },
    },
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const validateInternalAuth = (req, res, next) => {
  if (INTERNAL_TOKEN && req.headers['x-internal-token'] !== INTERNAL_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized internal access' });
  }
  return next();
};

app.post('/internal/inventory/consume', validateInternalAuth, async (req, res) => {
  const { error, value } = consumptionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.details.map((d) => d.message),
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, restaurantId, outletId, items } = value;

    // Idempotency: if ledger already created for this order, return success
    const existingLedger = await InventoryLedger.findOne({
      referenceType: 'ORDER',
      referenceId: orderId,
      transactionType: 'SALE_CONSUMPTION',
    })
      .session(session)
      .exec();

    if (existingLedger) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({
        status: 'ok',
        idempotent: true,
        message: 'Consumption already recorded',
      });
    }

    const ledgerDocs = [];

    for (const item of items) {
      for (const component of item.recipeSnapshot) {
        const consumedQty = item.quantityOrdered * component.quantityPerUnit;
        if (!Number.isFinite(consumedQty) || consumedQty <= 0) {
          throw new Error(
            `Invalid consumption quantity for raw material ${component.rawMaterialId}`,
          );
        }

        const rawMaterial = await RawMaterial.findOne({
          _id: component.rawMaterialId,
        })
          .session(session)
          .exec();

        if (!rawMaterial) {
          throw new Error(
            `Raw material ${component.rawMaterialId} not found or inactive`,
          );
        }

        if (rawMaterial.isActive === false) {
          throw new Error(`Raw material ${rawMaterial.name} is inactive`);
        }

        if (
          rawMaterial.baseUnit &&
          rawMaterial.baseUnit !== component.unit
        ) {
          throw new Error(
            `Unit mismatch for ${rawMaterial.name}. Expected ${rawMaterial.baseUnit}, got ${component.unit}`,
          );
        }

        ledgerDocs.push({
          rawMaterialId: component.rawMaterialId,
          rawMaterialName: component.rawMaterialName || rawMaterial.name,
          restaurantId,
          outletId,
          transactionType: 'SALE_CONSUMPTION',
          quantityChange: -consumedQty,
          unit: rawMaterial.baseUnit || component.unit,
          referenceType: 'ORDER',
          referenceId: orderId,
          remarks: 'Auto consumption on order completion',
        });
      }
    }

    const createdLedgers = await InventoryLedger.insertMany(ledgerDocs, {
      session,
    });

    await session.commitTransaction();
    session.endSession();

    const ledgerEntryIds = createdLedgers.map((doc) => doc._id.toString());
    const totalRawMaterials = ledgerDocs.length;

    console.info('[inventory-service] consumption recorded', {
      orderId,
      totalRawMaterials,
      ledgerEntryIds,
    });

    return res.status(200).json({
      status: 'ok',
      ledgerEntryIds,
      totalRawMaterials,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error('[inventory-service] consumption failed', {
      message: err.message,
    });

    return res.status(400).json({
      message: err.message || 'Inventory consumption failed',
    });
  }
});

const start = async () => {
  await connectDb();
  const port = process.env.PORT || 3005;
  app.listen(port, () => {
    console.log(`[inventory-service] listening on ${port}`);
  });
};

start().catch((err) => {
  console.error('[inventory-service] startup failed', err);
  process.exit(1);
});

