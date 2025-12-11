import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes, filters, and interceptors FIRST
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.enableCors();
  app.use(morgan('dev'));
  // Swagger configuration - MUST come after global setup
  const config = new DocumentBuilder()
    .setTitle('Restaurant POS - Order Service API')
    .setDescription('API documentation for Order Management Microservice')
    .setVersion('1.0')
    .addTag('orders', 'Order management endpoints')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {   
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Order Service API Docs',
  });

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`🚀 Order service running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
  console.log(`🏥 Health check at http://localhost:${port}/health`);
}
bootstrap();
