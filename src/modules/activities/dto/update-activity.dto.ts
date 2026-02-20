import {
  IsString,
  IsNumber,
  IsOptional,
  IsISO8601,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateActivityDto {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(255)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number | null;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string;

  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @IsISO8601()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  maxParticipants?: number | null;
}

export class UpdateActivityStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}
