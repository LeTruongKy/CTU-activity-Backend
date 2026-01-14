import { PartialType } from '@nestjs/mapped-types';
import { CreateInteractionLogDto } from './create-interaction_log.dto';

export class UpdateInteractionLogDto extends PartialType(CreateInteractionLogDto) {}
