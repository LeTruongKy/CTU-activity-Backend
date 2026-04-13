import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { UserActivitySchedule } from './entities/user_activity_schedule.entity';
import { Activity } from '../activities/entities/activity.entity';

@Injectable()
export class UserActivityScheduleRepository extends Repository<UserActivitySchedule> {
  constructor(private dataSource: DataSource) {
    super(UserActivitySchedule, dataSource.createEntityManager());
  }

  /**
   * 📅 Find overlapping activities for time range
   * 
   * Overlap logic: (startA < endB) AND (endA > startB)
   * 
   * Example:
   * Activity A: 09:00 - 11:00
   * Activity B: 10:00 - 12:00  ← Overlaps A
   * Check: (09:00 < 12:00) AND (11:00 > 10:00) = TRUE ✅
   */
  async findConflicts(
    userId: string,
    startTime: Date,
    endTime: Date,
    excludeActivityId?: number,
  ): Promise<UserActivitySchedule[]> {
    const query = this.createQueryBuilder('uas')
      .where('uas.userId = :userId', { userId })
      .andWhere('uas.isActive = true')
      .andWhere('uas.deletedAt IS NULL')
      .andWhere('uas.startTime < :endTime', { endTime })
      .andWhere('uas.endTime > :startTime', { startTime });

    if (excludeActivityId) {
      query.andWhere('uas.activityId != :excludeActivityId', { excludeActivityId });
    }

    return query.getMany();
  }

  /**
   * 📅 Get user's calendar for a month
   */
  async getUserCalendar(userId: string, year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    return this.createQueryBuilder('uas')
      .where('uas.userId = :userId', { userId })
      .andWhere('uas.isActive = true')
      .andWhere('uas.deletedAt IS NULL')
      .andWhere('uas.startTime >= :startOfMonth', { startOfMonth })
      .andWhere('uas.startTime <= :endOfMonth', { endOfMonth })
      .orderBy('uas.startTime', 'ASC')
      .getMany();
  }

  /**
   * 📍 Get user's activities for a specific date
   */
  async getUserActivitiesForDate(userId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.createQueryBuilder('uas')
      .leftJoinAndSelect('uas.userId', 'user')
      .where('uas.userId = :userId', { userId })
      .andWhere('uas.isActive = true')
      .andWhere('uas.deletedAt IS NULL')
      .andWhere('uas.startTime >= :startOfDay', { startOfDay })
      .andWhere('uas.startTime <= :endOfDay', { endOfDay })
      .orderBy('uas.startTime', 'ASC')
      .getMany();
  }

  /**
   * 🗑️ Soft delete schedule entry
   */
  async deactivateSchedule(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  /**
   * 🗑️ Soft delete all user schedules for activity
   */
  async deactivateUserActivitySchedules(userId: string, activityId: number): Promise<number> {
    const result = await this.update(
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
}
