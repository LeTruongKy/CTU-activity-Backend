import { IsNumber, IsNotEmpty } from 'class-validator';

export class TrackRegisterDto {
  @IsNumber()
  @IsNotEmpty()
  activityId: number;
}
