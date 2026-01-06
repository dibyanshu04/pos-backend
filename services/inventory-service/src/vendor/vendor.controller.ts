import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { VendorService } from './vendor.service';

@ApiTags('vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  @Roles('OWNER', 'MANAGER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create vendor', description: 'Adds a vendor for an outlet. Names must be unique per outlet.' })
  @ApiBody({ type: CreateVendorDto })
  @ApiResponse({ status: 201, description: 'Vendor created', type: SuccessResponseDto })
  async create(@Body() dto: CreateVendorDto): Promise<SuccessResponseDto<any>> {
    const vendor = await this.vendorService.create(dto);
    return new SuccessResponseDto(vendor, 'Vendor created successfully');
  }

  @Get()
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'List vendors by outlet' })
  @ApiQuery({ name: 'outletId', required: true, description: 'Outlet ID' })
  @ApiOkResponse({ type: SuccessResponseDto })
  async findAll(@Query('outletId') outletId: string): Promise<SuccessResponseDto<any[]>> {
    const vendors = await this.vendorService.findAll(outletId);
    return new SuccessResponseDto(vendors, 'Vendors retrieved successfully');
  }

  @Put(':id/status')
  @Roles('OWNER', 'MANAGER')
  @ApiOperation({ summary: 'Activate/deactivate vendor' })
  @ApiParam({ name: 'id', description: 'Vendor ID' })
  @ApiBody({ type: UpdateVendorStatusDto })
  @ApiOkResponse({ type: SuccessResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateVendorStatusDto,
  ): Promise<SuccessResponseDto<any>> {
    const vendor = await this.vendorService.updateStatus(id, dto);
    return new SuccessResponseDto(
      vendor,
      dto.isActive ? 'Vendor activated' : 'Vendor deactivated',
    );
  }
}

