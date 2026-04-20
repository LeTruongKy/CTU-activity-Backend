import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentProgressService } from './student_progress.service';
import { StudentProgressController } from './student_progress.controller';
import { User } from '../users/entities/user.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { CriteriaGroup } from '../criteria_groups/entities/criteria_group.entity';
import { Criterion } from '../criteria/entities/criterion.entity';
import { ActivityCriterion } from '../activity_criteria/entities/activity_criterion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Registration,
      CriteriaGroup,
      Criterion,
      ActivityCriterion,
    ]),
  ],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
  exports: [StudentProgressService],
})
export class StudentProgressModule {}
