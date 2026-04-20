import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CriteriaGroup } from './entities/criteria_group.entity';
import { CreateCriteriaGroupDto } from './dto/create-criteria_group.dto';
import { UpdateCriteriaGroupDto } from './dto/update-criteria_group.dto';

@Injectable()
export class CriteriaGroupsService {
  constructor(
    @InjectRepository(CriteriaGroup)
    private readonly criteriaGroupsRepository: Repository<CriteriaGroup>,
  ) {}

  async create(createCriteriaGroupDto: CreateCriteriaGroupDto) {
    try {
      // Check if group with same name already exists
      const existing = await this.criteriaGroupsRepository.findOne({
        where: { name: createCriteriaGroupDto.name },
      });

      if (existing) {
        throw new BadRequestException(`Criteria group "${createCriteriaGroupDto.name}" already exists`);
      }

      const criteriaGroup = this.criteriaGroupsRepository.create(createCriteriaGroupDto);
      return await this.criteriaGroupsRepository.save(criteriaGroup);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create criteria group');
    }
  }

  async findAll() {
    return await this.criteriaGroupsRepository.find({
      relations: ['criteria'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const criteriaGroup = await this.criteriaGroupsRepository.findOne({
      where: { id },
      relations: ['criteria'],
    });

    if (!criteriaGroup) {
      throw new NotFoundException(`Criteria group with ID ${id} not found`);
    }

    return criteriaGroup;
  }

  async findByName(name: string) {
    return await this.criteriaGroupsRepository.findOne({
      where: { name },
      relations: ['criteria'],
    });
  }

  async update(id: number, updateCriteriaGroupDto: UpdateCriteriaGroupDto) {
    const criteriaGroup = await this.findOne(id);
    Object.assign(criteriaGroup, updateCriteriaGroupDto);
    return await this.criteriaGroupsRepository.save(criteriaGroup);
  }

  async remove(id: number) {
    const criteriaGroup = await this.findOne(id);
    return await this.criteriaGroupsRepository.remove(criteriaGroup);
  }

  // Helper method: Check if group exists by name
  async existsByName(name: string): Promise<boolean> {
    const count = await this.criteriaGroupsRepository.countBy({ name });
    return count > 0;
  }
}
