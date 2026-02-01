import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CriteriaService } from './criteria.service';
import { CriteriaController } from './criteria.controller';
import { Criterion } from './entities/criterion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Criterion])],
  controllers: [CriteriaController],
  providers: [CriteriaService],
  exports: [CriteriaService],
})
export class CriteriaModule {}
