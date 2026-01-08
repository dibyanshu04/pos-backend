import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.use(morgan('dev'));

  const config = new DocumentBuilder()
    .setTitle('Restaurant POS - Inventory Service API')
    .setDescription(
      'Internal inventory endpoints (Petpooja-style consumption & cost snapshot)',
    )
    .setVersion('1.0')
    .addTag('internal', 'Internal-only inventory endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3005;
  const host = process.env.HOST || 'http://localhost';
  const docsUrl = `${host}:${port}/api-docs`;
  const nodeEnv = process.env.NODE_ENV || 'local';

  if (!process.env.INVENTORY_INTERNAL_TOKEN) {
    console.warn(
      '[inventory-service] INVENTORY_INTERNAL_TOKEN is not set; internal endpoints will be open.',
    );
  }

  await app.listen(port, '0.0.0.0');
  console.log(`📦 Inventory Service running on port ${port} (env=${nodeEnv})`);
  console.log(`📚 Inventory Service Swagger: ${docsUrl}`);
  console.log(
    `🌐 API Gateway will route: http://localhost:3000/api/inventory/* (if configured)`,
  );
}

bootstrap();