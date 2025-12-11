import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RestaurantsService } from '../restaurants/restaurants.service';
import { OutletsService } from '../outlets/outlets.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { CreateOutletDto } from '../outlets/dto/create-outlet.dto';
import { SubscriptionsService } from 'src/subscriptions/subscriptions.service';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly outletsService: OutletsService,
    private readonly httpService: HttpService,
    private readonly subscriptionService: SubscriptionsService,
  ) {}

  private readonly authServiceUrl =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  private readonly subscriptionServiceUrl =
    process.env.SUBSCRIPTION_SERVICE_URL || 'http://localhost:3006';
  private readonly menuServiceUrl =
    process.env.MENU_SERVICE_URL || 'http://localhost:3004';

  async onboardRestaurant(
    createOnboardingDto: CreateOnboardingDto,
  ): Promise<any> {
    try {
      const { restaurantData, ownerData, subscriptionPlanId } =
        createOnboardingDto;

      // Step 1: Create restaurant
      const restaurant: any = await this.restaurantsService.create(restaurantData);

      // Step 2: Create owner user account in auth service
      let user;
      try {
        const authResponse: any = await this.httpService
          .post(`${this.authServiceUrl}/auth/register/restaurant`, {
            ...ownerData,
            restaurantAccess: [
              {
                restaurantId: restaurant._id.toString(),
                roleId: process.env.OWNER_ROLE_ID ,
              },
            ],
          })
          .toPromise();
        user = authResponse.data || '';
        
      } catch (error) {
        // Rollback restaurant creation if user creation fails
        await this.restaurantsService.remove(restaurant._id.toString());
        throw new BadRequestException(
          'Failed to create user account: ' + error.message,
        );
      }

      // Step 3: Create default outlet
      let outlet;
      try {
        const createOutletDto: CreateOutletDto = {
          name: `${restaurant.name} - Main Outlet`,
          restaurantId: restaurant._id.toString(),
          location: restaurant.location,
          phone: restaurant.phone,
          email: restaurant.email,
          timing: {
            openingTime: '09:00',
            closingTime: '23:00',
            timezone: 'Asia/Kolkata',
            workingDays: [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ],
          },
          facilities: {
            hasDelivery: true,
            hasTakeaway: true,
            hasDineIn: true,
            tableCount: 20,
            seatingCapacity: 80,
          },
        };
        outlet = await this.outletsService.create(createOutletDto);
      } catch (error) {
        // Rollback user creation if outlet creation fails
        await this.httpService
          .delete(`${this.authServiceUrl}/auth/users/${user.data._id}`)
          .toPromise();
        await this.restaurantsService.remove(restaurant._id.toString());
        throw new BadRequestException(
          'Failed to create outlet: ' + error.message,
        );
      }

      // Step 4: Assign trial subscription if provided
      let subscription;
      if (subscriptionPlanId) {
        try {
          const subscriptionResponse: any = await this.subscriptionService
            .createSubscription({
              restaurantId: restaurant._id.toString(),
              planId: subscriptionPlanId,
              status: 'trial',
            })
          subscription = subscriptionResponse;

          // Update restaurant with subscription
          await this.restaurantsService.assignSubscription(
            restaurant._id.toString(),
            subscription._id.toString(),
          );
        } catch (error) {
          console.error('Subscription creation failed:', error.message);
          // Continue without subscription - restaurant can add it later
        }
      }

      // Step 5: Initialize menu structure
      try {
        await this.httpService
          .post(`${this.menuServiceUrl}/api/menu/initialize-restaurant`, {
            restaurantId: restaurant._id.toString(),
            outletId: outlet._id.toString(),
            restaurantName: restaurant.name,
          })
          .toPromise();
      } catch (error) {
        console.error('Menu initialization failed:', error.message);
        // Continue without menu initialization
      }

      return {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
          status: restaurant.status,
        },
        user: user,
        outlet: {
          id: outlet._id,
          name: outlet.name,
        },
        subscription: subscription
          ? {
              id: subscription._id,
              status: subscription.status,
            }
          : null,
        onboardingCompleted: true,
        message: 'Restaurant onboarded successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Onboarding failed: ${error.message}`);
    }
  }

  async completeOnboarding(restaurantId: string): Promise<any> {
    const restaurant : any = await this.restaurantsService.updateStatus(
      restaurantId,
      'active',
    );

    // Trigger setup for other services
    await this.triggerServiceSetup(restaurantId);

    return {
      message: 'Onboarding completed successfully',
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status,
      },
    };
  }

  async getOnboardingStatus(restaurantId: string): Promise<any> {
    const restaurant : any = await this.restaurantsService.findOne(restaurantId);
    const outlets = await this.outletsService.findByRestaurant(restaurantId);

    // Check subscription status
    let subscription;
    try {
      const subscriptionResponse: any = await this.httpService
        .get(
          `${this.subscriptionServiceUrl}/api/subscriptions/restaurant/${restaurantId}`,
        )
        .toPromise();
      subscription = subscriptionResponse.data;
    } catch (error) {
      subscription = null;
    }

    return {
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        status: restaurant.status,
        onboardedAt: restaurant.onboardedAt,
      },
      outlets: outlets.length,
      hasSubscription: !!subscription,
      subscriptionStatus: subscription?.data?.status || 'none',
      onboardingProgress: this.calculateProgress(
        restaurant,
        outlets,
        subscription,
      ),
    };
  }

  private calculateProgress(
    restaurant: any,
    outlets: any[],
    subscription: any,
  ): number {
    let progress = 0;

    // Basic restaurant info - 30%
    if (restaurant.name && restaurant.email && restaurant.phone) progress += 30;

    // Location info - 20%
    if (restaurant.location?.address && restaurant.location?.city)
      progress += 20;

    // At least one outlet - 20%
    if (outlets.length > 0) progress += 20;

    // Active subscription - 30%
    if (
      subscription?.data?.status === 'active' ||
      subscription?.data?.status === 'trial'
    )
      progress += 30;

    return Math.min(progress, 100);
  }

  private async triggerServiceSetup(restaurantId: string): Promise<void> {
    // Make HTTP calls to other services to set up default data
    try {
      // Setup default menu categories
      await this.httpService
        .post(`${this.menuServiceUrl}/api/menu/setup-default-categories`, {
          restaurantId,
        })
        .toPromise();

      // Setup default tables in order service
      await this.httpService
        .post(
          `${process.env.ORDER_SERVICE_URL || 'http://localhost:3003'}/api/orders/setup-default-tables`,
          { restaurantId },
        )
        .toPromise();
    } catch (error) {
      console.error('Service setup failed:', error.message);
    }
  }
}
