import { IsUUID, IsInt, IsArray, Min, IsOptional, IsNumber } from 'class-validator';

export class CreateUserInterestDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  tagIds: number[];

  @IsNumber()
  @IsOptional()
  weight?: number;
}

