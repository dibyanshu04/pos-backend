// src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Menu Service is running!';
  }

  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'menu-service',
    };
  }

  getServiceInfo(): {
    name: string;
    version: string;
    description: string;
    endpoints: string[];
  } {
    return {
      name: 'Menu Service',
      version: '1.0.0',
      description: 'Microservice for managing restaurant orders',
      endpoints: [
        'GET / - Service info',
        'GET /health - Health check',
        'POST /menu - Create new order',
        'GET /menu - Get all menu',
        'GET /menu/:id - Get specific order',
        'PUT /menu/:id - Update order',
        'DELETE /menu/:id - Delete order',
      ],
    };
  }
}
