import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ActivityCategoriesService } from './activity_categories.service';

@Controller('activity-categories')
export class ActivityCategoriesController {
  constructor(private readonly categoriesService: ActivityCategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: any) {
    return await this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.categoriesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateCategoryDto: any) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.categoriesService.remove(id);
  }
}
