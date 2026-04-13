import { IsEnum, IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty({ message: 'Tên đơn vị không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Loại đơn vị không được để trống' })
  @IsEnum(['LCH', 'CH'], { message: 'Loại đơn vị phải là LCH hoặc CH' })
  type: 'LCH' | 'CH';

  @IsOptional()
  @IsNumber({}, { message: 'parentId phải là số' })
  parentId?: number | null;
}
