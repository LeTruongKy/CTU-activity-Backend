import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsISO8601,
  IsInt,
  MinLength,
  MaxLength,
  Min,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  categoryId?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  unitId: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  location?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  posterUrl?: string;

  @IsISO8601()
  @IsNotEmpty()
  startTime: string;

  @IsISO8601()
  @IsNotEmpty()
  endTime: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxParticipants?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  criteriaGroupId?: number;

  @IsBoolean()
  @IsOptional()
  requiresProof?: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  pointsValue?: number;

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  criteriaIds?: number[];

  @Type(() => Number)
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @IsOptional()
  tagIds?: number[];
}
