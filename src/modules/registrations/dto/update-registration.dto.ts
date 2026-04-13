import { IsOptional, IsString, IsInt, Min, Max, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRegistrationDto {
  @IsOptional()
  @IsString()
  proofUrl?: string;
}

export class CheckInRegistrationDto {
  @IsNotEmpty()
  @IsString()
  qrCode: string;
}

export class ProofSubmissionDto {
  @IsOptional()
  @IsString()
  proofUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class VerifyProofDto {
  @IsEnum(['VERIFIED', 'REJECTED'])
  action: 'VERIFIED' | 'REJECTED';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
