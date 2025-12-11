import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SubscriptionPlan, SubscriptionPlanSchema } from "./schemas/subscription-plan.schema";
import { RestaurantSubscription, RestaurantSubscriptionSchema } from "./schemas/restaurant-subscription.schema";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema },
            { name: RestaurantSubscription.name, schema: RestaurantSubscriptionSchema },
        ])
    ],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
    exports: [SubscriptionsService] 
})

export class SubscriptionsModule {} 