import { Module } from '@nestjs/common';
import { ActivityCriteriaService } from './activity_criteria.service';
import { ActivityCriteriaController } from './activity_criteria.controller';

@Module({
  controllers: [ActivityCriteriaController],
  providers: [ActivityCriteriaService],
})
export class ActivityCriteriaModule {}
