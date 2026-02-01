import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInterestsService } from './user_interests.service';
import { UserInterestsController } from './user_interests.controller';
import { UserInterest } from './entities/user_interest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserInterest])],
  controllers: [UserInterestsController],
  providers: [UserInterestsService],
  exports: [UserInterestsService],
})
export class UserInterestsModule {}
