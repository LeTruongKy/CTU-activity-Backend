import { Module } from '@nestjs/common';
import { CriteriaGroupsService } from './criteria_groups.service';
import { CriteriaGroupsController } from './criteria_groups.controller';

@Module({
  controllers: [CriteriaGroupsController],
  providers: [CriteriaGroupsService],
})
export class CriteriaGroupsModule {}
