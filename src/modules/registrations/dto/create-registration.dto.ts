import { IsInt, IsNotEmpty, Min, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRegistrationDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  activityId: number;

  @IsBoolean()
  @IsOptional()
  skipConflictCheck?: boolean;
}
