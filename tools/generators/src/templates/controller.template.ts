import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { {{ServiceClassName}} } from './{{moduleName}}.service';
import { SuccessResponseDto } from '../common/dto/success-response.dto';
import { Create{{EntityName}}Dto } from './dto/create-{{moduleName}}.dto';
import { Update{{EntityName}}Dto } from './dto/update-{{moduleName}}.dto';

@ApiTags('{{moduleName}}')
@Controller('{{moduleName}}')
export class {{ControllerClassName}} {
  constructor(private readonly {{serviceInstanceName}}: {{ServiceClassName}}) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new {{entityDisplayName}}' })
  @ApiBody({ type: Create{{EntityName}}Dto })
  @ApiResponse({
    status: 201,
    description: '{{EntityDisplayName}} created successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Validation failed' })
  async create(
    @Body() create{{EntityName}}Dto: Create{{EntityName}}Dto,
  ): Promise<SuccessResponseDto<any>> {
    const {{entityInstanceName}} = await this.{{serviceInstanceName}}.create(create{{EntityName}}Dto);
    return new SuccessResponseDto({{entityInstanceName}}, '{{EntityDisplayName}} created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all {{entityDisplayNamePlural}}' })
  {{#if hasRestaurantId}}
  @ApiQuery({
    name: 'restaurantId',
    required: true,
    description: 'Restaurant ID',
  })
  {{/if}}
  @ApiResponse({
    status: 200,
    description: '{{EntityDisplayNamePlural}} retrieved successfully',
    type: SuccessResponseDto,
  })
  async findAll(
    {{#if hasRestaurantId}}
    @Query('restaurantId') restaurantId: string,
    {{/if}}
  ): Promise<SuccessResponseDto<any[]>> {
    const {{entityInstanceNamePlural}} = await this.{{serviceInstanceName}}.findAll({{#if hasRestaurantId}}restaurantId{{/if}});
    return new SuccessResponseDto({{entityInstanceNamePlural}}, '{{EntityDisplayNamePlural}} retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get {{entityDisplayName}} by ID' })
  @ApiParam({ name: 'id', description: '{{EntityDisplayName}} ID' })
  @ApiResponse({
    status: 200,
    description: '{{EntityDisplayName}} retrieved successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: '{{EntityDisplayName}} not found' })
  async findOne(@Param('id') id: string): Promise<SuccessResponseDto<any>> {
    const {{entityInstanceName}} = await this.{{serviceInstanceName}}.findOne(id);
    return new SuccessResponseDto({{entityInstanceName}}, '{{EntityDisplayName}} retrieved successfully');
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a {{entityDisplayName}}' })
  @ApiParam({ name: 'id', description: '{{EntityDisplayName}} ID' })
  @ApiBody({ type: Update{{EntityName}}Dto })
  @ApiResponse({
    status: 200,
    description: '{{EntityDisplayName}} updated successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: '{{EntityDisplayName}} not found' })
  async update(
    @Param('id') id: string,
    @Body() update{{EntityName}}Dto: Update{{EntityName}}Dto,
  ): Promise<SuccessResponseDto<any>> {
    const {{entityInstanceName}} = await this.{{serviceInstanceName}}.update(id, update{{EntityName}}Dto);
    return new SuccessResponseDto({{entityInstanceName}}, '{{EntityDisplayName}} updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a {{entityDisplayName}}' })
  @ApiParam({ name: 'id', description: '{{EntityDisplayName}} ID' })
  @ApiResponse({ status: 204, description: '{{EntityDisplayName}} deleted successfully' })
  @ApiResponse({ status: 404, description: '{{EntityDisplayName}} not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.{{serviceInstanceName}}.remove(id);
  }
}

