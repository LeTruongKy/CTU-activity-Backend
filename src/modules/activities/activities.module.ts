import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activity.entity';
import { ActivityApprovalsModule } from '../activity_approvals/activity_approvals.module';
import { UnitsModule } from '../units/units.module';
import { ActivityCategoriesModule } from '../activity_categories/activity_categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    ActivityApprovalsModule,
    UnitsModule,
    ActivityCategoriesModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
