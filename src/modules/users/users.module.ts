import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { SV5tService } from './sv5t.service';
import { RegistrationsModule } from '../registrations/registrations.module';
import { Registration } from '../registrations/entities/registration.entity';
import { Criterion } from '../criteria/entities/criterion.entity';
import { CriteriaGroup } from '../criteria_groups/entities/criteria_group.entity';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityCriterion } from '../activity_criteria/entities/activity_criterion.entity';
import { CloudinaryModule } from '../../cores/cloudinary/cloudinary.module';

@Module({
  imports: [
    RegistrationsModule,
    CloudinaryModule,
    TypeOrmModule.forFeature([
      User,
      Registration,
      Criterion,
      CriteriaGroup,
      Activity,
      ActivityCriterion,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, SV5tService],
  exports: [UsersService, SV5tService],
})
export class UsersModule {}
