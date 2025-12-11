import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OnboardingModule } from './onboarding/onboarding.module'; // Add this
import { OutletsModule } from './outlets/outlets.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-service',
    ),
    RestaurantsModule,
    OutletsModule,
    OnboardingModule,
    SubscriptionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
