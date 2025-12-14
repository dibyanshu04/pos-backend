import { Module } from '@nestjs/common';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Area, AreaSchema } from './schema/area.schema';
import { OutletsModule } from 'src/outlets/outlets.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }]),
    OutletsModule,
  ],
  controllers: [AreaController],
  providers: [AreaService],
})
export class AreaModule {}
