import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { OnboardingModule } from './onboarding/onboarding.module'; // Add this
import { OutletsModule } from './outlets/outlets.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TableModule } from './tables/table.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb+srv://dibs04:Tiger123@dibs.n1lrcnr.mongodb.net/restaurant-service',
    ),
    RestaurantsModule,
    OutletsModule,
    OnboardingModule,
    SubscriptionsModule,
    TableModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
