import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import morgan from 'morgan';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exceptions/filters/global-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global setup
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.use(morgan('dev'));

  // Swagger setup for Inventory Service
  const config = new DocumentBuilder()
    .setTitle('Restaurant POS - Inventory Service API')
    .setDescription(
      'API documentation for Inventory Management (Raw Materials, Petpooja-style)',
    )
    .setVersion('1.0')
    .addTag('raw-materials', 'Raw material master data and costing')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3010;
  await app.listen(port, '0.0.0.0');

  console.log(`📦 Inventory Service running on port ${port}`);
  console.log(`📚 Inventory Service Swagger: http://localhost:${port}/api-docs`);
}

bootstrap();

