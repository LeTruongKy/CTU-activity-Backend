import {
  IsString,
  IsNumber,
  IsOptional,
  IsISO8601,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  IsArray,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsString()
  @IsOptional()
  @MaxLength(500)
  posterUrl?: string;

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

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  tagIds?: number[];
}

export class UpdateActivityStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'PENDING' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reason?: string;
}
