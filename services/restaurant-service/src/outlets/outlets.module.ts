import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OutletsService } from './outlets.service';
import { OutletsController } from './outlets.controller';
import { Outlet, OutletSchema } from './schema/outlets.schema';

@Module({
	imports: [MongooseModule.forFeature([{ name: Outlet.name, schema: OutletSchema }])],
	controllers: [OutletsController],
	providers: [OutletsService],
	exports: [OutletsService],
})
export class OutletsModule {}
