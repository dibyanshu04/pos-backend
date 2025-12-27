import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/exceptions/filters/global-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';
import morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global setup
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.enableCors({
    origin: true, // reflect request origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });
  app.setGlobalPrefix('menu');
  app.use(morgan('dev'));

  // Swagger setup for Menu Service
  const config = new DocumentBuilder()
    .setTitle('Restaurant POS - Menu Service API')
    .setDescription('API documentation for Menu Management Microservice')
    .setVersion('1.0')
    .addTag('menus', 'Menu management endpoints')
    .addTag('menu-items', 'Menu items management endpoints')
    .addTag('variants', 'Variant management endpoints')
    .addTag('addons', 'Addon management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3004;
  await app.listen(port);

  console.log(`🍽️  Menu Service running on port ${port}`);
  console.log(`📚 Menu Service Swagger: http://localhost:${port}/api-docs`);
  console.log(
    `🌐 API Gateway will route: http://localhost:3000/api/menu/* `,
  );
}
bootstrap();
