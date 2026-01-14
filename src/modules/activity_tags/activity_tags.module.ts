import { Module } from '@nestjs/common';
import { ActivityTagsService } from './activity_tags.service';
import { ActivityTagsController } from './activity_tags.controller';

@Module({
  controllers: [ActivityTagsController],
  providers: [ActivityTagsService],
})
export class ActivityTagsModule {}
