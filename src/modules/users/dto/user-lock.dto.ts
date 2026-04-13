import { IsString, IsOptional } from 'class-validator';

export class UserLockDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
