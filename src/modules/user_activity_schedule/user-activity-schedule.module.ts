import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivitySchedule } from './entities/user_activity_schedule.entity';
import { Activity } from '../activities/entities/activity.entity';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserActivitySchedule, Activity])],
  controllers: [CalendarController],
  providers: [CalendarService],
  exports: [CalendarService],
})
export class UserActivityScheduleModule {}
