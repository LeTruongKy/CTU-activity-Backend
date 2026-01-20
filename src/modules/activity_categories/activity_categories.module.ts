import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityCategory } from './entities/activity_category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityCategory])],
  exports: [TypeOrmModule],
})
export class ActivityCategoriesModule {}
