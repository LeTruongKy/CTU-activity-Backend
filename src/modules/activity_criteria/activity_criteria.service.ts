import { Injectable } from '@nestjs/common';
import { CreateActivityCriterionDto } from './dto/create-activity_criterion.dto';
import { UpdateActivityCriterionDto } from './dto/update-activity_criterion.dto';

@Injectable()
export class ActivityCriteriaService {
  create(createActivityCriterionDto: CreateActivityCriterionDto) {
    return 'This action adds a new activityCriterion';
  }

  findAll() {
    return `This action returns all activityCriteria`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityCriterion`;
  }

  update(id: number, updateActivityCriterionDto: UpdateActivityCriterionDto) {
    return `This action updates a #${id} activityCriterion`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityCriterion`;
  }
}
