import { Injectable } from '@nestjs/common';
import { CreateCriteriaGroupDto } from './dto/create-criteria_group.dto';
import { UpdateCriteriaGroupDto } from './dto/update-criteria_group.dto';

@Injectable()
export class CriteriaGroupsService {
  create(createCriteriaGroupDto: CreateCriteriaGroupDto) {
    return 'This action adds a new criteriaGroup';
  }

  findAll() {
    return `This action returns all criteriaGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} criteriaGroup`;
  }

  update(id: number, updateCriteriaGroupDto: UpdateCriteriaGroupDto) {
    return `This action updates a #${id} criteriaGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} criteriaGroup`;
  }
}
