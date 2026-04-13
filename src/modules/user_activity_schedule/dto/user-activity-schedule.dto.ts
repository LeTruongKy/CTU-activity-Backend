import { IsUUID, IsNumber, IsISO8601, IsOptional } from 'class-validator';

export class CreateUserActivityScheduleDto {
  @IsUUID()
  userId: string;

  @IsNumber()
  activityId: number;

  @IsISO8601()
  startTime: Date;

  @IsISO8601()
  endTime: Date;
}

export class ConflictCheckDto {
  @IsISO8601()
  startTime: Date;

  @IsISO8601()
  endTime: Date;

  @IsNumber()
  @IsOptional()
  excludeActivityId?: number;
}

export class ConflictResponseDto {
  activityId: number;
  title: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

// Calendar Response DTOs
export class CalendarEventDto {
  id: string;
  activityId: number;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  criteriaGroupId?: string;
  maxParticipants?: number;
}

export class CalendarDayDto {
  date: string; // YYYY-MM-DD
  hasEvents: boolean;
  hasConflicts: boolean;
  events: CalendarEventDto[];
}

export class CalendarMonthDto {
  year: number;
  month: number;
  days: CalendarDayDto[];
  totalEvents: number;
  totalConflicts: number;
}
