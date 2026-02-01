import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityTagsService } from './activity_tags.service';
import { ActivityTagsController } from './activity_tags.controller';
import { ActivityTag } from './entities/activity_tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityTag])],
  controllers: [ActivityTagsController],
  providers: [ActivityTagsService],
  exports: [ActivityTagsService],
})
export class ActivityTagsModule {}
