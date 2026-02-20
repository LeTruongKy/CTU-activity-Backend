import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityCategory } from './entities/activity_category.entity';
import { CreateActivityCategoryDto } from './dto/create-activity-category.dto';
import { UpdateActivityCategoryDto } from './dto/update-activity-category.dto';

@Injectable()
export class ActivityCategoriesService {
  constructor(
    @InjectRepository(ActivityCategory)
    private readonly categoryRepository: Repository<ActivityCategory>,
  ) {}

  async create(createCategoryDto: CreateActivityCategoryDto) {
    try {
      // Check for duplicate name
      const existing = await this.categoryRepository.findOne({
        where: { name: createCategoryDto.name },
      });

      if (existing) {
        throw new BadRequestException(`Category with name "${createCategoryDto.name}" already exists`);
      }

      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating category:', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find({
        relations: ['activities'],
        order: { name: 'ASC' },
      });

      return {
        data: categories.map((cat) => ({
          category_id: cat.id,
          name: cat.name,
          description: cat.description,
          color: cat.color || '#999999',
          activityCount: cat.activities?.length || 0,
        })),
        total: categories.length,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations: ['activities'],
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching category:', error);
      throw new InternalServerErrorException('Failed to fetch category');
    }
  }

  async update(id: number, updateCategoryDto: UpdateActivityCategoryDto) {
    try {
      const category = await this.findOne(id);

      // Check for duplicate name if name is being updated
      if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
        const existing = await this.categoryRepository.findOne({
          where: { name: updateCategoryDto.name },
        });

        if (existing) {
          throw new BadRequestException(
            `Category with name "${updateCategoryDto.name}" already exists`,
          );
        }
      }

      await this.categoryRepository.update(id, updateCategoryDto);
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error updating category:', error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async remove(id: number) {
    try {
      const category = await this.findOne(id);

      // Check if category has activities
      if (category.activities && category.activities.length > 0) {
        throw new BadRequestException(
          `Cannot delete category with ${category.activities.length} associated activities`,
        );
      }

      await this.categoryRepository.delete(id);
      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting category:', error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }
}
