import { IsNumber, IsString, IsOptional, IsArray, Min, Max } from 'class-validator';

export class GetRecommendationsQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class RecommendedActivityDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsOptional()
  @IsString()
  posterUrl: string | null;

  @IsOptional()
  @IsString()
  location: string | null;

  @IsNumber()
  similarity_score: number;

  @IsArray()
  tags: { id?: number; tag_id?: number; name: string }[];

  constructor(partial?: Partial<RecommendedActivityDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

export class RecommendationsListDto {
  @IsString()
  user_id: string;

  @IsNumber()
  total_count: number;

  @IsArray()
  recommendations: RecommendedActivityDto[];

  constructor(partial?: Partial<RecommendationsListDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}

export class RecommendationHealthDto {
  @IsString()
  status: string;

  @IsString()
  message: string;

  @IsString()
  recommendation_service: string;
}
