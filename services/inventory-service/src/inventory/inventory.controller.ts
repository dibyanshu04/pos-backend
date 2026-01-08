import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { ConsumeInventoryDto } from './dto/consume-inventory.dto';
import { CostSnapshotDto } from './dto/cost-snapshot.dto';

@ApiTags('internal')
@Controller('internal')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('inventory/consume')
  async consume(
    @Body() body: ConsumeInventoryDto,
    @Headers('x-internal-token') internalToken?: string,
  ) {
    try {
      const result = await this.inventoryService.consumeInventory(
        body,
        internalToken,
      );
      return { status: 'ok', ...result };
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Consumption failed');
    }
  }

  @Post('raw-materials/cost-snapshot')
  async costSnapshot(
    @Body() body: CostSnapshotDto,
    @Headers('x-internal-token') internalToken?: string,
  ) {
    return this.inventoryService.costSnapshot(body, internalToken);
  }
}

