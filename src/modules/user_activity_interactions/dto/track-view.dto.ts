import { IsNumber, IsNotEmpty } from 'class-validator';

export class TrackViewDto {
  @IsNumber()
  @IsNotEmpty()
  activityId: number;
}
