import { Module } from '@nestjs/common';
import { UserInterestsService } from './user_interests.service';
import { UserInterestsController } from './user_interests.controller';

@Module({
  controllers: [UserInterestsController],
  providers: [UserInterestsService],
})
export class UserInterestsModule {}
