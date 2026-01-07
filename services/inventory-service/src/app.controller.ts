import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseDto } from './common/dto/success-response.dto';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ type: SuccessResponseDto })
  getHello(): SuccessResponseDto<string> {
    const message = this.appService.getHello();
    return new SuccessResponseDto(message, 'Inventory service is healthy');
  }
}

