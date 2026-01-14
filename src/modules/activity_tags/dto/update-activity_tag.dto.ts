import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityTagDto } from './create-activity_tag.dto';

export class UpdateActivityTagDto extends PartialType(CreateActivityTagDto) {}
