import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { Activity } from './entities/activity.entity';
import { ActivityTag } from '../activity_tags/entities/activity_tag.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { User } from '../users/entities/user.entity';
import { UnitsModule } from '../units/units.module';
import { ActivityCategoriesModule } from '../activity_categories/activity_categories.module';
import { ActivityCriteriaModule } from '../activity_criteria/activity_criteria.module';
import { CriteriaModule } from '../criteria/criteria.module';
import { ActivityCriterion } from '../activity_criteria/entities/activity_criterion.entity';
import { CloudinaryModule } from '../../cores/cloudinary/cloudinary.module';
import { TagsModule } from '../tags/tags.module';
import { RecommendationService } from './services/recommendation.service';
import { ReportService } from '../../cores/report/report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityCriterion, ActivityTag, Registration, User]),
    HttpModule,
    UnitsModule,
    ActivityCategoriesModule,
    ActivityCriteriaModule,
    CriteriaModule,
    CloudinaryModule,
    TagsModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, RecommendationService, ReportService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
