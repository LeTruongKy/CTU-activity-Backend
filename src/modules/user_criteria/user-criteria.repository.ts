import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserCriteria } from './entities/user_criteria.entity';

@Injectable()
export class UserCriteriaRepository extends Repository<UserCriteria> {
  constructor(private dataSource: DataSource) {
    super(UserCriteria, dataSource.createEntityManager());
  }

  /**
   * Find user criteria by user and group
   */
  async findByUserAndGroup(
    userId: string,
    criteriaGroupId: number,
  ): Promise<UserCriteria | null> {
    return this.findOne({
      where: { userId, criteriaGroupId },
      relations: ['user', 'criteriaGroup'],
    });
  }

  /**
   * Get or create user criteria
   */
  async findOrCreateUserCriteria(
    userId: string,
    criteriaGroupId: number,
  ): Promise<UserCriteria> {
    let userCriteria = await this.findByUserAndGroup(userId, criteriaGroupId);

    if (!userCriteria) {
      userCriteria = this.create({
        userId,
        criteriaGroupId,
        progressCount: 0,
        completion: 0,
      });
      await this.save(userCriteria);
    }

    return userCriteria;
  }

  /**
   * Get all criteria progress for a user
   */
  async findUserProgress(userId: string): Promise<UserCriteria[]> {
    return this.find({
      where: { userId },
      relations: ['criteriaGroup'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get criteria completion stats for admin
   */
  async getCompletionStats(criteriaGroupId: number) {
    return this.createQueryBuilder('uc')
      .where('uc.criteriaGroupId = :criteriaGroupId', { criteriaGroupId })
      .select('COUNT(*)', 'totalUsers')
      .addSelect('SUM(CASE WHEN uc.finalCompleted = true THEN 1 ELSE 0 END)', 'completedUsers')
      .addSelect('AVG(uc.progressCount)', 'avgProgress')
      .getRawOne();
  }
}
