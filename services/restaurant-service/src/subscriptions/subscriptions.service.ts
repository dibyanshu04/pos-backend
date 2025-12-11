import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from './schemas/subscription-plan.schema';
import {
  RestaurantSubscription,
  RestaurantSubscriptionDocument,
} from './schemas/restaurant-subscription.schema';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { CreateRestaurantSubscriptionDto } from './dto/create-restaurant-subscription.dto';


@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(RestaurantSubscription.name)
    private subscriptionModel: Model<RestaurantSubscriptionDocument>,
  ) {}

  // Plan Management
  async createPlan(
    createPlanDto: CreateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const createdPlan = new this.planModel(createPlanDto);
    return createdPlan.save();
  }

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.planModel.find({ isActive: true }).exec();
  }

  async findPlanById(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }
    return plan;
  }

  async updatePlan(
    id: string,
    updatePlanDto: Partial<SubscriptionPlan>,
  ): Promise<SubscriptionPlan> {
    const plan = await this.planModel
      .findByIdAndUpdate(id, updatePlanDto, { new: true })
      .exec();

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  // Restaurant Subscription Management
  async createSubscription(
    createSubscriptionDto: CreateRestaurantSubscriptionDto,
  ): Promise<RestaurantSubscription> {
    // Check if restaurant already has an active subscription
    const existingSubscription = await this.subscriptionModel.findOne({
      restaurantId: createSubscriptionDto.restaurantId,
      status: { $in: ['active', 'trial'] },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        'Restaurant already has an active subscription',
      );
    }

    const plan = await this.planModel.findById(createSubscriptionDto.planId);
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const startDate = new Date();
    const endDate = new Date();

    if (createSubscriptionDto.status === 'trial') {
      endDate.setDate(endDate.getDate() + plan.trialPeriod);
    } else {
      endDate.setMonth(endDate.getMonth() + 1); // Default to monthly
    }

    const subscriptionData = {
      ...createSubscriptionDto,
      startDate,
      endDate,
    };

    const createdSubscription = new this.subscriptionModel(subscriptionData);
    return createdSubscription.save();
  }

  async getRestaurantSubscription(
    restaurantId: string,
  ): Promise<RestaurantSubscription> {
    const subscription = await this.subscriptionModel
      .findOne({ restaurantId })
      .populate('planId')
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found for this restaurant');
    }

    return subscription;
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
  ): Promise<RestaurantSubscription> {
    const subscription = await this.subscriptionModel
      .findByIdAndUpdate(subscriptionId, { status }, { new: true })
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<RestaurantSubscription> {
    const subscription = await this.subscriptionModel
      .findByIdAndUpdate(
        subscriptionId,
        { status: 'canceled', autoRenew: false },
        { new: true },
      )
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async renewSubscription(
    subscriptionId: string,
  ): Promise<RestaurantSubscription> {
    const subscription = await this.subscriptionModel.findById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1);

    subscription.startDate = newStartDate;
    subscription.endDate = newEndDate;
    subscription.status = 'active';
    subscription.autoRenew = true;

    return subscription.save();
  }

  async checkUsageLimits(restaurantId: string): Promise<any> {
    const subscription : any= await this.getRestaurantSubscription(restaurantId);
    const plan = subscription.planId as any; // Populated plan

    return {
      subscription: {
        id: subscription._id,
        status: subscription.status,
        plan: plan.name,
      },
      usage: {
        orders: {
          used: subscription.usedOrdersThisMonth,
          limit: plan.features.maxOrdersPerMonth,
          remaining: Math.max(
            0,
            plan.features.maxOrdersPerMonth - subscription.usedOrdersThisMonth,
          ),
          exceeded:
            subscription.usedOrdersThisMonth > plan.features.maxOrdersPerMonth,
        },
        menuItems: {
          used: subscription.usedMenuItems,
          limit: plan.features.maxMenuItems,
          remaining: Math.max(
            0,
            plan.features.maxMenuItems - subscription.usedMenuItems,
          ),
          exceeded: subscription.usedMenuItems > plan.features.maxMenuItems,
        },
        outlets: {
          used: subscription.usedOutlets,
          limit: plan.features.maxOutlets,
          remaining: Math.max(
            0,
            plan.features.maxOutlets - subscription.usedOutlets,
          ),
          exceeded: subscription.usedOutlets > plan.features.maxOutlets,
        },
      },
      isWithinLimits:
        subscription.usedOrdersThisMonth <= plan.features.maxOrdersPerMonth &&
        subscription.usedMenuItems <= plan.features.maxMenuItems &&
        subscription.usedOutlets <= plan.features.maxOutlets,
    };
  }

  async incrementUsage(
    restaurantId: string,
    type: 'orders' | 'menuItems' | 'outlets',
    count: number = 1,
  ): Promise<void> {
    const updateField =
      type === 'orders'
        ? 'usedOrdersThisMonth'
        : type === 'menuItems'
          ? 'usedMenuItems'
          : 'usedOutlets';

    await this.subscriptionModel
      .updateOne({ restaurantId }, { $inc: { [updateField]: count } })
      .exec();
  }

  async resetMonthlyUsage(): Promise<void> {
    // This should be called by a cron job at the beginning of each month
    await this.subscriptionModel
      .updateMany({}, { usedOrdersThisMonth: 0 })
      .exec();
  }

  async getExpiringSubscriptions(
    days: number = 7,
  ): Promise<RestaurantSubscription[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    return this.subscriptionModel
      .find({
        status: 'active',
        endDate: { $lte: targetDate, $gte: new Date() },
      })
      .populate('planId')
      .exec();
  }

  async getSubscriptionAnalytics(): Promise<any> {
    const totalSubscriptions = await this.subscriptionModel.countDocuments();
    const activeSubscriptions = await this.subscriptionModel.countDocuments({
      status: 'active',
    });
    const trialSubscriptions = await this.subscriptionModel.countDocuments({
      status: 'trial',
    });

    const revenue = await this.subscriptionModel.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'subscriptionplans',
          localField: 'planId',
          foreignField: '_id',
          as: 'plan',
        },
      },
      { $unwind: '$plan' },
      { $group: { _id: null, total: { $sum: '$plan.price' } } },
    ]);

    return {
      totalSubscriptions,
      activeSubscriptions,
      trialSubscriptions,
      monthlyRevenue: revenue.length > 0 ? revenue[0].total : 0,
      churnRate: await this.calculateChurnRate(),
    };
  }

  private async calculateChurnRate(): Promise<number> {
    // Simple churn rate calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const canceledSubscriptions = await this.subscriptionModel.countDocuments({
      status: 'canceled',
      updatedAt: { $gte: thirtyDaysAgo },
    });

    const totalActiveSubscriptions =
      await this.subscriptionModel.countDocuments({
        status: 'active',
      });

    return totalActiveSubscriptions > 0
      ? (canceledSubscriptions / totalActiveSubscriptions) * 100
      : 0;
  }
}
