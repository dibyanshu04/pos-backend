import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
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
  app.enableCors({
    origin: true, // reflect request origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Restaurant POS - Restaurant Service API')
    .setDescription('API documentation for Restaurant Management Microservice')
    .setVersion('1.0')
    .addTag('restaurants', 'Restaurant management endpoints')
    .addTag('outlets', 'Outlet management endpoints')
    .addTag('onboarding', 'Restaurant onboarding endpoints')
    .addTag('subscriptions', 'Subscription management endpoints')
    .addBearerAuth() // If you have authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Restaurant Service API Docs',
  });

  const port = process.env.PORT || 3005;
  await app.listen(port, '0.0.0.0');

  // Server Startup Logs
  console.log('🚀 ======================================== 🚀');
  console.log('🏪 Restaurant Service Started Successfully!');
  console.log('🚀 ======================================== 🚀');
  console.log(`📍 Server running on: http://localhost:${port}`);
  console.log(`📚 Swagger Documentation: http://localhost:${port}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${port}/health`);
  console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
  console.log('⏰ Started at:', new Date().toISOString());
  console.log('🚀 ======================================== 🚀');

  // Log available endpoints
  setTimeout(() => {
    logAvailableEndpoints();
  }, 1000);
}

// Function to log available endpoints
function logAvailableEndpoints() {
  console.log('\n📋 Available API Endpoints:');
  console.log('├── 🏪 RESTAURANTS');
  console.log('│   ├── POST   /api/restaurants/restaurants');
  console.log('│   ├── GET    /api/restaurants/restaurants');
  console.log('│   ├── GET    /api/restaurants/restaurants/:id');
  console.log('│   ├── GET    /api/restaurants/restaurants/slug/:slug');
  console.log('│   ├── PUT    /api/restaurants/restaurants/:id');
  console.log('│   ├── DELETE /api/restaurants/restaurants/:id');
  console.log('│   └── GET    /api/restaurants/restaurants/search/filter');

  console.log('├── 🏢 OUTLETS');
  console.log('│   ├── POST   /api/restaurants/outlets');
  console.log('│   ├── GET    /api/restaurants/outlets');
  console.log('│   ├── GET    /api/restaurants/outlets/:id');
  console.log('│   ├── PUT    /api/restaurants/outlets/:id');
  console.log('│   └── DELETE /api/restaurants/outlets/:id');

  console.log('├── 🎯 ONBOARDING');
  console.log('│   ├── POST   /api/restaurants/onboarding/restaurant');
  console.log(
    '│   ├── PUT    /api/restaurants/onboarding/restaurant/:id/complete',
  );
  console.log(
    '│   └── GET    /api/restaurants/onboarding/restaurant/:id/status',
  );

  console.log('├── 💳 SUBSCRIPTIONS');
  console.log('│   ├── POST   /api/restaurants/subscriptions/plans');
  console.log('│   ├── GET    /api/restaurants/subscriptions/plans');
  console.log('│   ├── POST   /api/restaurants/subscriptions');
  console.log('│   └── GET    /api/restaurants/subscriptions/restaurant/:id');

  console.log('├── 📊 HEALTH & INFO');
  console.log('│   ├── GET    /health');
  console.log('│   ├── GET    /info');
  console.log('│   └── GET    /');

  console.log('└── 📚 DOCUMENTATION');
  console.log('    └── GET    /api-docs');
  console.log('\n💡 Tip: Visit Swagger docs for interactive API testing');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start Restaurant Service:', error);
  process.exit(1);
});
