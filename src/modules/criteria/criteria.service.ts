import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Criterion } from './entities/criterion.entity';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { CriteriaGroupsService } from '../criteria_groups/criteria_groups.service';

@Injectable()
export class CriteriaService {
  constructor(
    @InjectRepository(Criterion)
    private readonly criteriaRepository: Repository<Criterion>,
    private readonly criteriaGroupsService: CriteriaGroupsService,
  ) {}

  async create(createCriterionDto: CreateCriterionDto) {
    try {
      // Validate group exists
      const group = await this.criteriaGroupsService.findOne(createCriterionDto.groupId);
      if (!group) {
        throw new NotFoundException(`Criteria group with ID ${createCriterionDto.groupId} not found`);
      }

      // Check if code already exists (if provided)
      if (createCriterionDto.code) {
        const existing = await this.criteriaRepository.findOne({
          where: { code: createCriterionDto.code },
        });
        if (existing) {
          throw new BadRequestException(`Criterion with code "${createCriterionDto.code}" already exists`);
        }
      }

      const criterion = this.criteriaRepository.create(createCriterionDto);
      return await this.criteriaRepository.save(criterion);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create criterion');
    }
  }

  async findAll() {
    return await this.criteriaRepository.find({
      relations: ['group'],
      order: { groupId: 'ASC', id: 'ASC' },
    });
  }

  async findAllGrouped() {
    const criteria = await this.findAll();
    
    // Group criteria by group name
    const grouped = criteria.reduce((acc, criterion) => {
      const groupName = criterion.group?.name || 'Unknown';
      
      if (!acc[groupName]) {
        acc[groupName] = {
          group_id: criterion.group?.id,
          group_name: groupName,
          required_count: criterion.group?.requiredCount,
          description: criterion.group?.description,
          criteria: [],
        };
      }
      
      acc[groupName].criteria.push({
        criterion_id: criterion.id,
        code: criterion.code,
        name: criterion.name,
        description: criterion.description,
      });
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  async findByGroup(groupId: number) {
    return await this.criteriaRepository.find({
      where: { groupId },
      relations: ['group'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const criterion = await this.criteriaRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!criterion) {
      throw new NotFoundException(`Criterion with ID ${id} not found`);
    }

    return criterion;
  }

  async findByCode(code: string) {
    return await this.criteriaRepository.findOne({
      where: { code },
      relations: ['group'],
    });
  }

  async update(id: number, updateCriterionDto: UpdateCriterionDto) {
    const criterion = await this.findOne(id);

    // If groupId is being updated, validate new group exists
    if (updateCriterionDto.groupId && updateCriterionDto.groupId !== criterion.groupId) {
      const newGroup = await this.criteriaGroupsService.findOne(updateCriterionDto.groupId);
      if (!newGroup) {
        throw new NotFoundException(`Criteria group with ID ${updateCriterionDto.groupId} not found`);
      }
    }

    Object.assign(criterion, updateCriterionDto);
    return await this.criteriaRepository.save(criterion);
  }

  async remove(id: number) {
    const criterion = await this.findOne(id);
    return await this.criteriaRepository.remove(criterion);
  }

  // Helper method: Check if criterion exists by code
  async existsByCode(code: string): Promise<boolean> {
    const count = await this.criteriaRepository.countBy({ code });
    return count > 0;
  }
}
