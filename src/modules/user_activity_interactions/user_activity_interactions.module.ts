import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserActivityInteraction } from './entities/user_activity_interaction.entity';
import { UserActivityInteractionsService } from './user_activity_interactions.service';
import { UserActivityInteractionsController } from './user_activity_interactions.controller';
import { UserInterestsModule } from '../user_interests/user_interests.module';
import { Activity } from '../activities/entities/activity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserActivityInteraction, Activity]),
    UserInterestsModule,
  ],
  controllers: [UserActivityInteractionsController],
  providers: [UserActivityInteractionsService],
  exports: [UserActivityInteractionsService],
})
export class UserActivityInteractionsModule {}

