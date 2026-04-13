import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { CriteriaGroup } from '../criteria_groups/entities/criteria_group.entity';
import { Criterion } from '../criteria/entities/criterion.entity';
import { ActivityCriterion } from '../activity_criteria/entities/activity_criterion.entity';

@Injectable()
export class StudentProgressService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    @InjectRepository(CriteriaGroup)
    private readonly criteriaGroupsRepository: Repository<CriteriaGroup>,
    @InjectRepository(Criterion)
    private readonly criteriaRepository: Repository<Criterion>,
    @InjectRepository(ActivityCriterion)
    private readonly activityCriteriaRepository: Repository<ActivityCriterion>,
  ) {}

  async getStudentProgress(userId: string) {
    try {
      // Validate user exists
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Get all criteria groups
      const criteriaGroups = await this.criteriaGroupsRepository.find({
        relations: ['criteria'],
      });

      // Get user's verified registrations
      const registrations = await this.registrationsRepository.find({
        where: { userId, proofStatus: 'VERIFIED' },
        relations: ['activity'],
      });

      const completedActivityIds = registrations.map((r) => r.activityId);

      // Calculate progress for each criteria group
      const criteriaProgress: any[] = [];
      let totalProgress = 0;
      let completedGroups = 0;

      for (const group of criteriaGroups) {
        let groupProgress = 0;
        const groupCriteria: any[] = [];

        for (const criterion of group.criteria) {
          // Count activities satisfying this criterion that user completed
          const activityCriteria = await this.activityCriteriaRepository.find({
            where: { criterionId: criterion.id },
          });

          const satisfyingActivities = activityCriteria.filter((ac) =>
            completedActivityIds.includes(ac.activityId),
          ).length;

          const criterionCompleted = satisfyingActivities > 0;

          groupCriteria.push({
            criteriaId: criterion.id,
            name: criterion.name,
            status: criterionCompleted ? 'COMPLETED' : 'NOT_COMPLETED',
            satisfyingActivities,
          });

          if (criterionCompleted) {
            groupProgress += 1;
          }
        }

        const completionPercentage =
          group.criteria.length > 0
            ? Math.round((groupProgress / group.criteria.length) * 100)
            : 0;

        criteriaProgress.push({
          groupId: group.id,
          groupName: group.name,
          progress: completionPercentage,
          completed: completionPercentage === 100,
          criteria: groupCriteria,
        });

        totalProgress += completionPercentage;
        if (completionPercentage === 100) {
          completedGroups += 1;
        }
      }

      const overallProgress =
        criteriaGroups.length > 0
          ? Math.round(totalProgress / criteriaGroups.length)
          : 0;

      return {
        userId,
        studentCode: user.studentCode,
        fullName: user.fullName,
        overallProgress,
        completedGroups,
        totalGroups: criteriaGroups.length,
        sv5tEligible: completedGroups >= criteriaGroups.length,
        criteriaGroups: criteriaProgress,
        lastActivityVerification: registrations.length > 0
          ? registrations[registrations.length - 1].updatedAt
          : null,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error calculating student progress:', error);
      throw new InternalServerErrorException(
        'Failed to calculate student progress',
      );
    }
  }
}
