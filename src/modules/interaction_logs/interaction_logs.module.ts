import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionLogsService } from './interaction_logs.service';
import { InteractionLogsController } from './interaction_logs.controller';
import { InteractionLog } from './entities/interaction_log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InteractionLog])],
  controllers: [InteractionLogsController],
  providers: [InteractionLogsService],
  exports: [InteractionLogsService],
})
export class InteractionLogsModule {}
