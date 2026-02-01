import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityCategory } from './entities/activity_category.entity';

@Injectable()
export class ActivityCategoriesService {
  constructor(
    @InjectRepository(ActivityCategory)
    private readonly categoryRepository: Repository<ActivityCategory>,
  ) {}

  async create(createCategoryDto: any) {
    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return await this.categoryRepository.find({
      relations: ['activities'],
    });
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOne({
      where: { id },
      relations: ['activities'],
    });
  }

  async update(id: number, updateCategoryDto: any) {
    await this.categoryRepository.update(id, updateCategoryDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.categoryRepository.delete(id);
  }
}
