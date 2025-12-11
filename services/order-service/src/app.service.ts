// src/app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Order Service is running!';
  }

  getHealth(): { status: string; timestamp: string; service: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'order-service',
    };
  }

  getServiceInfo(): {
    name: string;
    version: string;
    description: string;
    endpoints: string[];
  } {
    return {
      name: 'Order Service',
      version: '1.0.0',
      description: 'Microservice for managing restaurant orders',
      endpoints: [
        'GET / - Service info',
        'GET /health - Health check',
        'POST /orders - Create new order',
        'GET /orders - Get all orders',
        'GET /orders/:id - Get specific order',
        'PUT /orders/:id - Update order',
        'DELETE /orders/:id - Delete order',
        'GET /orders/status/:status - Get orders by status',
        'GET /orders/table/:tableNumber - Get orders by table',
      ],
    };
  }
}
