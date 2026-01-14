import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitTenureDto } from './create-unit_tenure.dto';

export class UpdateUnitTenureDto extends PartialType(CreateUnitTenureDto) {}
