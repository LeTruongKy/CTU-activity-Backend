import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ActivityCategoriesService } from './activity_categories.service';
import { CreateActivityCategoryDto } from './dto/create-activity-category.dto';
import { UpdateActivityCategoryDto } from './dto/update-activity-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class ActivityCategoriesController {
  constructor(private readonly categoriesService: ActivityCategoriesService) {}

  /**
   * GET /categories
   * Retrieve all activity categories with UI metadata (color, name)
   */
  @Get()
  async findAll() {
    return await this.categoriesService.findAll();
  }

  /**
   * GET /categories/:id
   * Get a single category by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoriesService.findOne(id);
    return {
      message: 'Category details',
      category: {
        category_id: category.id,
        name: category.name,
        description: category.description,
        color: category.color || '#999999',
        activityCount: category.activities?.length || 0,
      },
    };
  }

  /**
   * POST /categories
   * Create a new activity category (admin only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() createCategoryDto: CreateActivityCategoryDto) {
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      message: 'Category created successfully',
      category: {
        category_id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
      },
    };
  }

  /**
   * PATCH /categories/:id
   * Update a category (admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateActivityCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return {
      message: 'Category updated successfully',
      category: {
        category_id: category.id,
        name: category.name,
        description: category.description,
        color: category.color,
      },
    };
  }

  /**
   * DELETE /categories/:id
   * Delete a category (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.remove(id);
  }
}
