import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCriteria } from './entities/user_criteria.entity';

@Injectable()
export class UserCriteriaService {
  constructor(
    @InjectRepository(UserCriteria)
    private readonly userCriteriaRepository: Repository<UserCriteria>,
  ) {}

  /**
   * Get user criteria
   */
  async getUserCriteria(userId: string) {
    return this.userCriteriaRepository.find({
      where: { userId },
      relations: ['criteriaGroup'],
    });
  }

  /**
   * Add criteria to user
   */
  async addUserCriteria(userId: string, criteriaGroupId: number) {
    const userCriteria = this.userCriteriaRepository.create({
      userId,
      criteriaGroupId,
    });
    return this.userCriteriaRepository.save(userCriteria);
  }

  /**
   * Remove criteria from user
   */
  async removeUserCriteria(userId: string, criteriaGroupId: number) {
    return this.userCriteriaRepository.delete({
      userId,
      criteriaGroupId,
    });
  }
}
