import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInterestsService } from './user_interests.service';
import { UserInterestsController } from './user_interests.controller';
import { UserInterest } from './entities/user_interest.entity';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserInterest]), TagsModule],
  controllers: [UserInterestsController],
  providers: [UserInterestsService],
  exports: [UserInterestsService],
})
export class UserInterestsModule {}
