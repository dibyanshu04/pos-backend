import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('restaurant')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Onboard a new restaurant with owner account' })
  @ApiBody({ type: CreateOnboardingDto })
  @ApiResponse({
    status: 201,
    description: 'Restaurant onboarded successfully',
    type: SuccessResponseDto,
  })
  async onboardRestaurant(
    @Body() createOnboardingDto: CreateOnboardingDto,
  ): Promise<SuccessResponseDto<any>> {
    const result =
      await this.onboardingService.onboardRestaurant(createOnboardingDto);
    return new SuccessResponseDto(result, 'Restaurant onboarded successfully');
  }

  @Put('restaurant/:id/complete')
  @ApiOperation({ summary: 'Mark restaurant onboarding as complete' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding completed successfully',
    type: SuccessResponseDto,
  })
  async completeOnboarding(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const result = await this.onboardingService.completeOnboarding(id);
    return new SuccessResponseDto(result, 'Onboarding completed successfully');
  }

  @Get('restaurant/:id/status')
  @ApiOperation({ summary: 'Get onboarding status for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant ID' })
  @ApiResponse({
    status: 200,
    description: 'Onboarding status retrieved successfully',
    type: SuccessResponseDto,
  })
  async getOnboardingStatus(
    @Param('id') id: string,
  ): Promise<SuccessResponseDto<any>> {
    const status = await this.onboardingService.getOnboardingStatus(id);
    return new SuccessResponseDto(
      status,
      'Onboarding status retrieved successfully',
    );
  }
}
