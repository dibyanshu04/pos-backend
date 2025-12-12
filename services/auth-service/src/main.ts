import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';88
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SuccessResponseInterceptor } from './common/interceptors/success-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global setup
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

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Restaurant POS - Auth Service API')
    .setDescription(
      'Authentication and Authorization Microservice for Restaurant POS Platform', 
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('roles', 'Role and permission management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Auth Service API Docs',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  const baseUrl = process.env.BASE_URL || `http://localhost`;
  // Server Startup Logs
  console.log('🔐 ======================================== 🔐');
  console.log('🚀 Auth Service Started Successfully!');
  console.log('🔐 ======================================== 🔐');
  console.log(`📍 Server running on: ${baseUrl}:${port}`);
  console.log(`📚 Swagger Documentation: ${baseUrl}:${port}/api-docs`);
  console.log(`🏥 Health Check: ${baseUrl}:${port}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('🔐 ======================================== 🔐');

  // Log available endpoints
  setTimeout(() => {
    logAvailableEndpoints();
  }, 1000);
}

function logAvailableEndpoints() {
  console.log('\n📋 Available API Endpoints:');
  console.log('├── 🔐 AUTHENTICATION');
  console.log('│   ├── POST   /api/auth/login');
  console.log('│   ├── POST   /api/auth/register/platform');
  console.log('│   ├── POST   /api/auth/register/restaurant');
  console.log('│   ├── POST   /api/auth/refresh');
  console.log('│   ├── POST   /api/auth/password/forgot');
  console.log('│   ├── POST   /api/auth/password/reset');
  console.log('│   ├── PUT    /api/auth/password/change');
  console.log('│   ├── GET    /api/auth/profile');
  console.log('│   └── GET    /api/auth/validate-token');

  console.log('├── 👥 USERS');
  console.log('│   ├── GET    /api/users/profile');
  console.log('│   ├── GET    /api/users/:id');
  console.log('│   ├── PUT    /api/users/:id/status');
  console.log('│   ├── PUT    /api/users/:id/restaurant-access');
  console.log('│   ├── GET    /api/users');
  console.log('│   └── GET    /api/users/restaurant/:restaurantId/staff');

  console.log('├── 🎯 ROLES & PERMISSIONS');
  console.log('│   ├── GET    /api/roles');
  console.log('│   ├── GET    /api/roles/platform');
  console.log('│   ├── GET    /api/roles/restaurant');
  console.log('│   ├── GET    /api/roles/:id');
  console.log('│   ├── POST   /api/roles');
  console.log('│   ├── PUT    /api/roles/:id');
  console.log('│   ├── GET    /api/roles/permissions/platform');
  console.log('│   └── GET    /api/roles/permissions/restaurant');

  console.log('├── 📊 HEALTH & INFO');
  console.log('│   ├── GET    /health');
  console.log('│   ├── GET    /info');
  console.log('│   └── GET    /');

  console.log('└── 📚 DOCUMENTATION');
  console.log('    └── GET    /api-docs');
  console.log(
    '\n💡 Tip: Use Swagger docs for interactive API testing and token generation',
  );
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Auth Service:', error);
  process.exit(1);
});
