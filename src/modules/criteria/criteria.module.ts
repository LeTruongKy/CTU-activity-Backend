import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriteriaService } from './criteria.service';
import { CriteriaController } from './criteria.controller';
import { Criterion } from './entities/criterion.entity';
import { CriteriaGroupsModule } from '../criteria_groups/criteria_groups.module';

@Module({
  imports: [TypeOrmModule.forFeature([Criterion]), CriteriaGroupsModule],
  controllers: [CriteriaController],
  providers: [CriteriaService],
  exports: [CriteriaService],
})
export class CriteriaModule {}
