import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  async create(createUnitDto: CreateUnitDto) {
    const unit = this.unitsRepository.create(createUnitDto);
    return await this.unitsRepository.save(unit);
  }

  async findAll() {
    return await this.unitsRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  async findWithHierarchy() {
    const allUnits = await this.unitsRepository.find({
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });

    // Build hierarchical tree - return only top-level LCH units with their children
    const topLevelUnits = allUnits.filter((unit) => !unit.parentId);

    return topLevelUnits.map((unit) => this.buildUnitTree(unit, allUnits));
  }

  private buildUnitTree(unit: Unit, allUnits: Unit[]) {
    const children = allUnits.filter((u) => u.parentId === unit.id);
    return {
      unit_id: unit.id,
      name: unit.name,
      type: unit.type,
      parentId: unit.parentId,
      children: children.map((child) => this.buildUnitTree(child, allUnits)),
    };
  }

  async findOne(id: number) {
    const unit = await this.unitsRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'users'],
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    const unit = await this.findOne(id);
    Object.assign(unit, updateUnitDto);
    return await this.unitsRepository.save(unit);
  }

  async remove(id: number) {
    const unit = await this.findOne(id);
    return await this.unitsRepository.remove(unit);
  }
}
