import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityCriterionDto } from './create-activity_criterion.dto';

export class UpdateActivityCriterionDto extends PartialType(CreateActivityCriterionDto) {}
