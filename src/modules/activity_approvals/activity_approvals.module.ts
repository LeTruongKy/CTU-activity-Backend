import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityApprovalsService } from './activity_approvals.service';
import { ActivityApprovalsController } from './activity_approvals.controller';
import { ActivityApproval } from './entities/activity_approval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityApproval])],
  controllers: [ActivityApprovalsController],
  providers: [ActivityApprovalsService],
  exports: [ActivityApprovalsService],
})
export class ActivityApprovalsModule {}
