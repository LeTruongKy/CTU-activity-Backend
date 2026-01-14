import { Module } from '@nestjs/common';
import { InteractionLogsService } from './interaction_logs.service';
import { InteractionLogsController } from './interaction_logs.controller';

@Module({
  controllers: [InteractionLogsController],
  providers: [InteractionLogsService],
})
export class InteractionLogsModule {}
