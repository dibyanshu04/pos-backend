"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const morgan = require("morgan");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
    });
    app.use(morgan('dev'));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Restaurant POS - Inventory Service API')
        .setDescription('Internal inventory endpoints (Petpooja-style consumption & cost snapshot)')
        .setVersion('1.0')
        .addTag('internal', 'Internal-only inventory endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT || 3005;
    const host = process.env.HOST || 'http://localhost';
    const docsUrl = `${host}:${port}/api-docs`;
    const nodeEnv = process.env.NODE_ENV || 'local';
    if (!process.env.INVENTORY_INTERNAL_TOKEN) {
        console.warn('[inventory-service] INVENTORY_INTERNAL_TOKEN is not set; internal endpoints will be open.');
    }
    await app.listen(port, '0.0.0.0');
    console.log(`📦 Inventory Service running on port ${port} (env=${nodeEnv})`);
    console.log(`📚 Inventory Service Swagger: ${docsUrl}`);
    console.log(`🌐 API Gateway will route: http://localhost:3000/api/inventory/* (if configured)`);
}
bootstrap();
//# sourceMappingURL=main.js.map