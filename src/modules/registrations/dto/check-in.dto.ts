import { IsNumber, IsString } from 'class-validator';

/**
 * DTO for QR code check-in
 * 
 * Received from frontend at /registrations/check-in endpoint
 * Contains signature verification data
 */
export class CheckInDto {
  @IsNumber()
  activityId: number;

  @IsNumber()
  timestamp: number;

  @IsString()
  signature: string;
}
