import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';
import {
  ConflictCheckDto,
  CalendarMonthDto,
} from './dto/user-activity-schedule.dto';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(private calendarService: CalendarService) {}

  /**
   * GET /calendar?year=2026&month=4
   * Get user's calendar for a specific month with events grouped by date
   */
  @Get()
  async getCalendar(
    @Request() req,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<CalendarMonthDto> {
    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    return this.calendarService.getUserCalendar(req.user.id, year, month);
  }

  /**
   * GET /calendar/date?date=2026-04-15
   * Get activities for specific date
   */
  @Get('date')
  async getActivitiesForDate(
    @Request() req,
    @Query('date') dateStr: string,
  ) {
    this.logger.debug(
      `Getting activities for date=${dateStr}, user=${req.user.id}`,
    );

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }

    return this.calendarService.getUserActivitiesForDate(req.user.id, date);
  }

  /**
   * POST /calendar/check-conflict
   * Check for overlapping activities
   */
  @Post('check-conflict')
  async checkConflict(
    @Request() req,
    @Query() dto: ConflictCheckDto & { year: number; month: number },
  ) {
    this.logger.debug(`Checking conflicts for user=${req.user.id}`);

    const conflicts = await this.calendarService.checkForConflict(
      req.user.id,
      dto.startTime,
      dto.endTime,
      dto.excludeActivityId,
    );

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }
}
