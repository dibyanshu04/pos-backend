import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Restaurant, RestaurantDocument } from './schemas/restaurant.schema';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    // Check if restaurant with same email or slug exists
    const existingRestaurant = await this.restaurantModel.findOne({
      $or: [
        { email: createRestaurantDto.email },
        { slug: createRestaurantDto.slug },
      ],
    });

    if (existingRestaurant) {
      throw new ConflictException(
        'Restaurant with this email or slug already exists',
      );
    }

    const createdRestaurant = new this.restaurantModel(createRestaurantDto);
    return createdRestaurant.save();
  }

  async findAll(): Promise<Restaurant[]> {
    return this.restaurantModel.find().exec();
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findById(id).exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async findBySlug(slug: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel.findOne({ slug }).exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async update(
    id: string,
    updateRestaurantDto: UpdateRestaurantDto,
  ): Promise<Restaurant> {
    const updatedRestaurant = await this.restaurantModel
      .findByIdAndUpdate(id, updateRestaurantDto, { new: true })
      .exec();

    if (!updatedRestaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return updatedRestaurant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.restaurantModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Restaurant not found');
    }
  }

  async updateStatus(id: string, status: string): Promise<Restaurant> {
    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async assignSubscription(
    restaurantId: string,
    subscriptionId: string,
  ): Promise<Restaurant> {
    const restaurant = await this.restaurantModel
      .findByIdAndUpdate(
        restaurantId,
        { currentSubscription: subscriptionId, status: 'active' },
        { new: true },
      )
      .exec();

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async getRestaurantStats(restaurantId: string): Promise<any> {
    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Here you can integrate with order-service and menu-service
    // to get actual statistics
    return {
      totalOutlets: restaurant.totalOutlets,
      status: restaurant.status,
      onboardedAt: restaurant.onboardedAt,
      // Add more stats as needed
    };
  }
  async searchRestaurants(filters: {
    city?: string;
    cuisine?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ restaurants: Restaurant[]; total: number }> {
    const { city, cuisine, status, page = 1, limit = 10 } = filters;

    const query: any = {};

    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    if (cuisine) {
      query['details.cuisine'] = { $in: [cuisine] };
    }

    const restaurants = await this.restaurantModel
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.restaurantModel.countDocuments(query);

    return { restaurants, total };
  }
}
