import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OnboardingService } from './onboarding.service';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { OutletsModule } from 'src/outlets/outlets.module';
import { OnboardingController } from './onboarding.controller';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

@Module({
  imports: [
    HttpModule, // For calling other services
    RestaurantsModule,
    OutletsModule,
    SubscriptionsModule
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
