import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationsService } from './registrations.service';
import { RegistrationsController } from './registrations.controller';
import { QRCheckInController } from './qr-checkin.controller';
import { Registration } from './entities/registration.entity';
import { Activity } from '../activities/entities/activity.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryModule } from '../../cores/cloudinary/cloudinary.module';
import { QRModule } from '../../cores/qr/qr.module';
import { UserCriteriaModule } from '../user_criteria/user-criteria.module';
import { UserActivityScheduleModule } from '../user_activity_schedule/user-activity-schedule.module';
import { CalendarService } from '../user_activity_schedule/calendar.service';
import { JwtAuthModule } from '../auth/guards/jwt-auth.module';

@Module({
  imports: [
    CloudinaryModule,
    QRModule,
    TypeOrmModule.forFeature([Registration, Activity, User]),
    forwardRef(() => UserCriteriaModule),
    forwardRef(() => UserActivityScheduleModule),
    JwtAuthModule,
  ],
  controllers: [RegistrationsController, QRCheckInController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
