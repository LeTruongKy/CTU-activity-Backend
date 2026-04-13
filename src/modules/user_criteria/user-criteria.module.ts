import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCriteria } from './entities/user_criteria.entity';
import { UserCriteriaService } from './user-criteria.service';
import { UserCriteriaController } from './user-criteria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserCriteria])],
  controllers: [UserCriteriaController],
  providers: [UserCriteriaService],
  exports: [UserCriteriaService],
})
export class UserCriteriaModule {}
