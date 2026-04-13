import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO for updating user SV5T tracking fields
 * Used by admin to set academic metrics for SV5T calculation
 */
export class UpdateUserSV5tDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(4)
  gpa?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  drl?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  creditCount?: number;

  @IsBoolean()
  @IsOptional()
  isDisabled?: boolean;
}
