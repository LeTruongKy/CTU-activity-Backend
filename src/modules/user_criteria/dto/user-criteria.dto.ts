import { IsUUID, IsNumber, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateUserCriteriaDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  criteriaGroupId: number;
}

export class UpdateUserCriteriaOverrideDto {
  @IsBoolean()
  @IsOptional()
  userOverride: boolean | null;

  @IsString()
  @IsOptional()
  overrideReason?: string;
}

export class UserCriteriaResponseDto {
  id: string;
  userId: string;
  criteriaGroupId: number;
  progressCount: number;
  completionCount: number;
  autoCompleted: boolean;
  userOverride: boolean | null;
  finalCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
