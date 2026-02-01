import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityCriteriaService } from './activity_criteria.service';
import { ActivityCriteriaController } from './activity_criteria.controller';
import { ActivityCriterion } from './entities/activity_criterion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityCriterion])],
  controllers: [ActivityCriteriaController],
  providers: [ActivityCriteriaService],
  exports: [ActivityCriteriaService],
})
export class ActivityCriteriaModule {}
