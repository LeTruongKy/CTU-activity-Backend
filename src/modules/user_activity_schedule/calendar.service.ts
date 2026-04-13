import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { UserActivitySchedule } from './entities/user_activity_schedule.entity';
import { Activity } from '../activities/entities/activity.entity';
import {
  ConflictResponseDto,
  CalendarMonthDto,
  CalendarDayDto,
  CalendarEventDto,
} from './dto/user-activity-schedule.dto';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(UserActivitySchedule)
    private readonly scheduleRepo: Repository<UserActivitySchedule>,
    @InjectRepository(Activity)
    private readonly activityRepo: Repository<Activity>,
  ) {}

  /**
   * 📅 Check for time conflicts
   *
   * OVERLAP LOGIC:
   * Two intervals overlap if: (startA < endB) AND (endA > startB)
   */
  async checkForConflict(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeActivityId?: number,
  ): Promise<ConflictResponseDto[]> {
    // Validate time range
    if (startTime >= endTime) {
      throw new BadRequestException('startTime must be before endTime');
    }

    // Find conflicting schedules using standard query builder
    let query = this.scheduleRepo
      .createQueryBuilder('uas')
      .where('uas.userId = :userId', { userId })
      .andWhere('uas.isActive = true')
      .andWhere('uas.deletedAt IS NULL')
      .andWhere('uas.startTime < :endTime', { endTime })
      .andWhere('uas.endTime > :startTime', { startTime });

    if (excludeActivityId) {
      query = query.andWhere('uas.activityId != :excludeActivityId', {
        excludeActivityId,
      });
    }

    const conflicts = await query.getMany();

    if (conflicts.length === 0) {
      return [];
    }

    // Fetch activity details for conflicts
    const activityIds = conflicts.map((c) => c.activityId);
    const activities = await this.activityRepo.find({
      where: { id: In(activityIds), deletedAt: IsNull() },
    });

    // Build response
    return conflicts.map((conflict) => {
      const activity = activities.find((a) => a.id === conflict.activityId);
      return {
        activityId: conflict.activityId,
        title: activity?.title || 'Unknown Activity',
        startTime: conflict.startTime,
        endTime: conflict.endTime,
        location: activity?.location || undefined,
      };
    });
  }

  /**
   * 📅 Add activity to user's schedule
   */
  async addToSchedule(
    userId: string,
    activityId: number,
    startTime: Date,
    endTime: Date,
  ): Promise<UserActivitySchedule> {
    this.logger.debug(
      `Adding to schedule: user=${userId}, activity=${activityId}`,
    );

    const schedule = this.scheduleRepo.create({
      userId,
      activityId,
      startTime,
      endTime,
      isActive: true,
    });

    return this.scheduleRepo.save(schedule);
  }

  /**
   * 📅 Remove activity from schedule
   */
  async removeFromSchedule(
    userId: string,
    activityId: number,
  ): Promise<number> {
    this.logger.debug(
      `Removing from schedule: user=${userId}, activity=${activityId}`,
    );

    const result = await this.scheduleRepo.update(
      {
        userId,
        activityId,
      },
      {
        isActive: false,
        deletedAt: new Date(),
      },
    );
    return result.affected || 0;
  }

  /**
   * 📅 Get user calendar for month
   * Returns structured CalendarMonth with days and events grouped by date
   */
  async getUserCalendar(
    userId: string,
    year: number,
    month: number,
  ): Promise<CalendarMonthDto> {
    console.log(
      `Getting calendar for user=${userId}, year=${year}, month=${month}`,
    );

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const schedules = await this.scheduleRepo
      .createQueryBuilder('uas')
      .where('uas.userId = :userId', { userId })
      .andWhere('uas.isActive = true')
      .andWhere('uas.deletedAt IS NULL')
      .andWhere('uas.startTime >= :startOfMonth', { startOfMonth })
      .andWhere('uas.startTime <= :endOfMonth', { endOfMonth })
      .orderBy('uas.startTime', 'ASC')
      .getMany();

    // Fetch activity details
    const activityIds = [...new Set(schedules.map((s) => s.activityId))];
    const activities = await this.activityRepo.find({
      where: { id: In(activityIds), deletedAt: IsNull() },
    });

    // Initialize as simple array instead of Map
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendarDays: CalendarDayDto[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayDto: CalendarDayDto = {
        date: dateStr,
        hasEvents: false,
        hasConflicts: false,
        events: [],
      };
      calendarDays.push(dayDto);
    }

    // Group schedules by date
    schedules.forEach((schedule) => {
      const dateStr = schedule.startTime.toISOString().split('T')[0];
      const dayData = calendarDays.find((d) => d.date === dateStr);

      if (dayData) {
        const activity = activities.find((a) => a.id === schedule.activityId);
        const event: CalendarEventDto = {
          id: schedule.id.toString(),
          activityId: schedule.activityId,
          title: activity?.title || 'Unknown Activity',
          description: activity?.description || undefined,
          location: activity?.location || undefined,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          criteriaGroupId: activity?.criteriaGroupId?.toString(),
          maxParticipants: activity?.maxParticipants || undefined,
        };

        dayData.events.push(event);
        dayData.hasEvents = true;
      }
    });

    // Detect conflicts (days with 2+ events)
    calendarDays.forEach((day) => {
      if (day.events.length > 1) {
        day.hasConflicts = true;
      }
    });

    // Sort days
    calendarDays.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    const totalEvents = schedules.length;
    const totalConflicts = calendarDays
      .filter((d) => d.hasConflicts)
      .reduce((sum, d) => sum + d.events.length, 0);

    const result: CalendarMonthDto = {
      year,
      month,
      days: calendarDays,
      totalEvents,
      totalConflicts,
    };

    return result;
  }

  /**
   * 📅 Get user activities for specific date
   */
  async getUserActivitiesForDate(userId: string, date: Date) {
    this.logger.debug(`Getting activities for user=${userId}, date`);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.scheduleRepo
      .createQueryBuilder('uas')
      .where('uas.userId = :userId', { userId })
      .andWhere('uas.isActive = true')
      .andWhere('uas.deletedAt IS NULL')
      .andWhere('uas.startTime >= :startOfDay', { startOfDay })
      .andWhere('uas.startTime <= :endOfDay', { endOfDay })
      .orderBy('uas.startTime', 'ASC')
      .getMany();
  }

  /**
   * 📅 Clear schedule (used when registration cancelled)
   */
  async clearSchedule(userId: string, activityId: number): Promise<void> {
    this.logger.debug(
      `Clearing schedule: user=${userId}, activity=${activityId}`,
    );

    await this.scheduleRepo.update(
      {
        userId,
        activityId,
      },
      {
        isActive: false,
        deletedAt: new Date(),
      },
    );
  }
}
