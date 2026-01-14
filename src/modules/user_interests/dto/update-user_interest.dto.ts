import { PartialType } from '@nestjs/mapped-types';
import { CreateUserInterestDto } from './create-user_interest.dto';

export class UpdateUserInterestDto extends PartialType(CreateUserInterestDto) {}
