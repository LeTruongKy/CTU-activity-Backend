import { PartialType } from '@nestjs/mapped-types';
import { CreateCriteriaGroupDto } from './create-criteria_group.dto';

export class UpdateCriteriaGroupDto extends PartialType(CreateCriteriaGroupDto) {}
