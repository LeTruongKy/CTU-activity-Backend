import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityApproval } from './entities/activity_approval.entity';

@Injectable()
export class ActivityApprovalsService {
  constructor(
    @InjectRepository(ActivityApproval)
    private readonly approvalRepository: Repository<ActivityApproval>,
  ) {}

  async create(createApprovalDto: any) {
    const approval = this.approvalRepository.create(createApprovalDto);
    return await this.approvalRepository.save(approval);
  }

  async findAll(activityId?: number) {
    const query = this.approvalRepository.createQueryBuilder('approval');
    if (activityId) {
      query.where('approval.activityId = :activityId', { activityId });
    }
    return await query.orderBy('approval.timestamp', 'DESC').getMany();
  }

  async findOne(id: number) {
    return await this.approvalRepository.findOneBy({ id });
  }

  async remove(id: number) {
    await this.approvalRepository.delete(id);
  }
}
