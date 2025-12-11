import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SuccessResponseDto } from './common/dto/success-response.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Welcome message' })
  @ApiResponse({
    status: 200,
    description: 'Service is running',
    schema: {
      example: {
        success: true,
        message: 'Menu Service is running!',
        data: null,
        timestamp: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  @ApiResponse({
    status: 200,
    description: 'Health status',
    type: SuccessResponseDto,
  })
  getHealth() {
    const healthData = this.appService.getHealth();
    return healthData;
  }

  @Get('info')
  @ApiOperation({ summary: 'Service information' })
  @ApiResponse({
    status: 200,
    description: 'Service info',
    type: SuccessResponseDto,
  })
  getServiceInfo() {
    const info = this.appService.getServiceInfo();
    return info;
  }
}
