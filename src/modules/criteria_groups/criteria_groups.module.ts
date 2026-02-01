import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriteriaGroupsService } from './criteria_groups.service';
import { CriteriaGroupsController } from './criteria_groups.controller';
import { CriteriaGroup } from './entities/criteria_group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CriteriaGroup])],
  controllers: [CriteriaGroupsController],
  providers: [CriteriaGroupsService],
  exports: [CriteriaGroupsService],
})
export class CriteriaGroupsModule {}
