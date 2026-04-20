import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { Criterion } from '../criteria/entities/criterion.entity';
import { CriteriaGroup } from '../criteria_groups/entities/criteria_group.entity';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityCriterion } from '../activity_criteria/entities/activity_criterion.entity';

/**
 * SV5T Service - Manages Student of 5 Merits (Sinh ViÃªn 5 Tá»‘t) calculations
 * Calculates user progress across 5 merit categories:
 * 1. Äáº¡o Ä‘á»©c tá»‘t (Ethics) - 3 criteria
 * 2. Há»c táº­p tá»‘t (Academic Excellence) - 1 criterion
 * 3. Thá»ƒ lá»±c tá»‘t (Physical Fitness) - 2 criteria
 * 4. TÃ¬nh nguyá»‡n tá»‘t (Volunteering) - 3 criteria
 * 5. Há»™i nháº­p tá»‘t (Social Integration) - 3 criteria
 */
@Injectable()
export class SV5tService {
  private readonly logger = new Logger(SV5tService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    @InjectRepository(Criterion)
    private readonly criteriaRepository: Repository<Criterion>,
    @InjectRepository(CriteriaGroup)
    private readonly criteriaGroupsRepository: Repository<CriteriaGroup>,
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    @InjectRepository(ActivityCriterion)
    private readonly activityCriteriaRepository: Repository<ActivityCriterion>,
  ) {}

  /**
   * Calculate SV5T progress for a user
   * 
   * Algorithm:
   * 1. Find all VERIFIED registrations for the user
   * 2. Extract activity IDs from those registrations
   * 3. Find all criteria linked to those activities (via activity_criteria table)
   * 4. Mark those criteria as COMPLETED
   * 5. For each criteria group, check if completed_criteria >= requiredCount
   * 6. Calculate progress and determine SV5T eligibility
   * 
   * @param userId - UUID of the user
   * @returns SV5T progress object with groups, criteria, and eligibility status
   */
  async calculateSV5TProgress(userId: string): Promise<any> {
    try {
      // ============================================================
      // STEP 1: Verify user exists
      // ============================================================
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // ============================================================
      // STEP 2: Get all VERIFIED registrations for the user
      // Optimized: Only load necessary relations
      // ============================================================
      const verifiedRegistrations = await this.registrationsRepository
        .createQueryBuilder('reg')
        // Bá» select() vÃ  addSelect() vÃ¬ getMany() sáº½ tá»± Ä‘á»™ng map Ä‘Ãºng entity
        .where('reg.userId = :userId', { userId })
        // DÃ¹ng Ä‘Ãºng cá»™t proofStatus cho chá»¯ 'VERIFIED' (trÃ¡nh lá»—i Database)
        .andWhere('reg.proofStatus = :proofStatus', { proofStatus: 'VERIFIED' }) 
        .getMany();

      const activityIds = verifiedRegistrations
        .map((reg) => reg.activityId) // DÃ¹ng Ä‘Ãºng tÃªn thuá»™c tÃ­nh trong Entity: activityId
        .filter((id) => id !== null && id !== undefined);

      this.logger.debug(
        `User ${userId} has ${verifiedRegistrations.length} verified registrations for ${activityIds.length} activities`,
      );

      // ============================================================
      // STEP 3: Get completed criteria from verified activities
      // Optimized: Use SELECT DISTINCT to avoid duplicate results
      // ============================================================
      let completedCriteriaIds: number[] = [];

      if (activityIds.length > 0) {
        completedCriteriaIds = await this.getCompletedCriteriaIds(activityIds);
      }

      this.logger.debug(`Found ${completedCriteriaIds.length} completed criteria for user ${userId}`);

      // ============================================================
      // STEP 4: Get all criteria groups with their criteria
      // ============================================================
      const allGroups = await this.criteriaGroupsRepository
        .createQueryBuilder('cg')
        .leftJoinAndSelect('cg.criteria', 'c')
        .orderBy('cg.id', 'ASC')
        .addOrderBy('c.id', 'ASC')
        .getMany();

      // ============================================================
      // STEP 5: Calculate progress for each group
      // ============================================================
      const groupsProgress = allGroups.map((group) =>
        this.calculateGroupProgress(group, completedCriteriaIds),
      );

      // ============================================================
      // STEP 6: Determine SV5T eligibility
      // User is SV5T-eligible only if ALL 5 groups are completed
      // ============================================================
      const sv5tEligible = groupsProgress.every((g) => g.is_completed);
      const completedGroupsCount = groupsProgress.filter((g) => g.is_completed).length;
      const overallProgress = Math.round(
        (completedGroupsCount / Math.max(groupsProgress.length, 1)) * 100,
      );

      return {
        user_id: userId,
        email: user.email,
        full_name: user.fullName,
        student_code: user.studentCode,
        sv5t_eligible: sv5tEligible,
        completed_groups: completedGroupsCount,
        total_groups: groupsProgress.length,
        overall_progress: overallProgress,
        groups: groupsProgress,
        calculated_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error calculating SV5T progress for user ${userId}:`, error.message);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to calculate SV5T progress');
    }
  }

  /**
   * Get completed (DISTINCT) criteria IDs from verified activities
   * Uses optimized SQL query to avoid N+1 problem
   */
  private async getCompletedCriteriaIds(activityIds: number[]): Promise<number[]> {
    if (activityIds.length === 0) {
      return [];
    }

    const results = await this.activityCriteriaRepository
      .createQueryBuilder('ac')
      .select('DISTINCT ac.criterionId', 'criterion_id')
      .where('ac.activityId IN (:...activityIds)', { activityIds })
      .orderBy('ac.criterionId', 'ASC')
      .getRawMany();

    return results.map((row) => parseInt(row.criterion_id, 10));
  }

  /**
   * Calculate progress for a specific criteria group
   * 
   * @param group - CriteriaGroup entity with its criteria
   * @param completedCriteriaIds - Array of completed criterion IDs
   * @returns Formatted group progress object
   */
  private calculateGroupProgress(
    group: CriteriaGroup,
    completedCriteriaIds: number[],
  ): {
    group_id: number;
    group_name: string;
    description: string | null;
    required_count: number;
    criteria: Array<any>;
    completed_count: number;
    progress_percentage: number;
    is_completed: boolean;
  } {
    const groupCriteria = group.criteria || [];
    const completedSet = new Set(completedCriteriaIds);

    // Map each criterion with its completion status
    const criteriaWithStatus = groupCriteria.map((criterion) => ({
      criterion_id: criterion.id,
      code: criterion.code,
      name: criterion.name,
      description: criterion.description,
      status: completedSet.has(criterion.id) ? 'COMPLETED' : 'PENDING',
    }));

    // Count completed criteria
    const completedCount = criteriaWithStatus.filter((c) => c.status === 'COMPLETED').length;

    // Determine if group is completed
    const requiredCount = group.requiredCount || 1;
    const isGroupCompleted = completedCount >= requiredCount;

    // Calculate progress percentage
    const progressPercentage = Math.min(
      Math.round((completedCount / Math.max(requiredCount, 1)) * 100),
      100,
    );

    return {
      group_id: group.id,
      group_name: group.name,
      description: group.description || null,
      required_count: requiredCount,
      criteria: criteriaWithStatus,
      completed_count: completedCount,
      progress_percentage: progressPercentage,
      is_completed: isGroupCompleted,
    };
  }

  /**
   * Get SV5T summary for quick status check
   * Lightweight method that returns only essential info
   * 
   * @param userId - UUID of the user
   * @returns Quick SV5T status summary
   */
  async getSV5TSummary(userId: string): Promise<{
    sv5tEligible: boolean;
    completedGroups: number;
    totalGroups: number;
    overallProgress: number;
    completedCriteria: number;
    totalCriteria: number;
  }> {
    try {
      const progress = await this.calculateSV5TProgress(userId);

      const totalCriteria = progress.groups.reduce((sum, g) => sum + g.criteria.length, 0);
      const completedCriteria = progress.groups.reduce((sum, g) => sum + g.completed_count, 0);

      return {
        sv5tEligible: progress.sv5t_eligible,
        completedGroups: progress.completed_groups,
        totalGroups: progress.total_groups,
        overallProgress: progress.overall_progress,
        completedCriteria,
        totalCriteria,
      };
    } catch (error) {
      this.logger.error(`Error getting SV5T summary for user ${userId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get detailed progress for a specific criteria group
   * 
   * @param userId - UUID of the user
   * @param groupId - ID of the criteria group
   * @returns Detailed group progress with all criteria
   */
  async getGroupProgress(userId: string, groupId: number): Promise<any> {
    try {
      const progress = await this.calculateSV5TProgress(userId);
      const groupProgress = progress.groups.find((g) => g.group_id === groupId);

      if (!groupProgress) {
        throw new NotFoundException(
          `Criteria group with ID ${groupId} not found in user's progress`,
        );
      }

      return groupProgress;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error getting group progress for user ${userId} and group ${groupId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Get all completed criteria for a user
   * Returns detailed information about which criteria the user has satisfied
   * 
   * @param userId - UUID of the user
   * @returns Array of completed criteria with group information
   */
  async getCompletedCriteria(userId: string): Promise<
    Array<{
      criterion_id: number;
      code: string;
      name: string;
      description: string | null;
      group_id: number;
      group_name: string;
      activities_count: number;
    }>
  > {
    try {
      // Get verified registrations for the user
      const verifiedRegistrations = await this.registrationsRepository.find({
        where: { userId, proofStatus: 'VERIFIED' },
        relations: ['activity'],
      });

      const activityIds = verifiedRegistrations
        .map((reg) => reg.activity?.id)
        .filter((id) => id !== undefined);

      if (activityIds.length === 0) {
        return [];
      }

      // Get completed criteria with group information and activity count
      const completedCriteria = await this.criteriaRepository
        .createQueryBuilder('c')
        .select('c.id', 'criterion_id')
        .addSelect('c.code', 'code')
        .addSelect('c.name', 'name')
        .addSelect('c.description', 'description')
        .addSelect('g.id', 'group_id')
        .addSelect('g.name', 'group_name')
        .addSelect('COUNT(DISTINCT ac.activityId)', 'activities_count')
        .innerJoin(
          ActivityCriterion,
          'ac',
          'ac.criterionId = c.id AND ac.activityId IN (:...activityIds)',
          { activityIds },
        )
        .innerJoin('c.group', 'g')
        .groupBy('c.id')
        .addGroupBy('g.id')
        .addGroupBy('g.name')
        .orderBy('g.id', 'ASC')
        .addOrderBy('c.id', 'ASC')
        .getRawMany();

      return completedCriteria.map((row) => ({
        criterion_id: parseInt(row.criterion_id, 10),
        code: row.code,
        name: row.name,
        description: row.description,
        group_id: parseInt(row.group_id, 10),
        group_name: row.group_name,
        activities_count: parseInt(row.activities_count, 10),
      }));
    } catch (error) {
      this.logger.error(`Error getting completed criteria for user ${userId}:`, error.message);
      throw new InternalServerErrorException('Failed to get completed criteria');
    }
  }

  /**
   * Get user's activity history relevant to SV5T calculation
   * Shows which activities contributed to SV5T progress
   * 
   * @param userId - UUID of the user
   * @returns Activity history with criteria information
   */
  async getUserActivityHistory(userId: string): Promise<
    Array<{
      activity_id: number;
      activity_title: string;
      category_name: string;
      unit_name: string;
      status: string;
      verified_at: Date | null;
      criteria_satisfied: Array<{
        code: string;
        name: string;
        group_name: string;
      }>;
    }>
  > {
    try {
      const registrations = await this.registrationsRepository
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.activity', 'a')
        .leftJoinAndSelect('a.category', 'cat')
        .leftJoinAndSelect('a.unit', 'u')
        .leftJoinAndSelect('a.activityCriteria', 'ac')
        .leftJoinAndSelect('ac.criterion', 'c')
        .leftJoinAndSelect('c.group', 'g')
        .where('r.userId = :userId', { userId })
        .andWhere('r.proofStatus = :proofStatus', { proofStatus: 'VERIFIED' })
        .orderBy('r.createdAt', 'DESC')
        .getMany();
      return registrations.map((reg) => ({
        activity_id: reg.activity.id,
        activity_title: reg.activity.title,
        category_name: reg.activity.category?.name || 'Unknown',
        unit_name: reg.activity.unit?.name || 'Unknown',
        status: reg.proofStatus,
        verified_at: reg.checkInAt || null,
        criteria_satisfied: reg.activity.activityCriteria
          ? reg.activity.activityCriteria.map((ac) => ({
              code: ac.criterion.code ?? 'N/A', // <-- Sá»¬A á»ž ÄÃ‚Y: ThÃªm '?? 'N/A'' Ä‘á»ƒ xá»­ lÃ½ null
              name: ac.criterion.name,
              group_name: ac.criterion.group?.name || 'Unknown',
            }))
          : [],
      }));
    } catch (error) {
      this.logger.error(
        `Error getting activity history for user ${userId}:`,
        error.message,
      );
      throw new InternalServerErrorException('Failed to get activity history');
    }
  }

  /**
   * Check if a specific group is completed for a user
   * 
   * @param userId - UUID of the user
   * @param groupId - ID of the criteria group to check
   * @returns true if group is completed, false otherwise
   */
  async isGroupCompleted(userId: string, groupId: number): Promise<boolean> {
    try {
      const progress = await this.calculateSV5TProgress(userId);
      const group = progress.groups.find((g) => g.group_id === groupId);
      return group?.is_completed || false;
    } catch (error) {
      this.logger.error(
        `Error checking if group ${groupId} is completed for user ${userId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Get remaining criteria needed for a group
   * Useful for showing users what they need to do next
   * 
   * @param userId - UUID of the user
   * @param groupId - ID of the criteria group
   * @returns Array of pending criteria for the group
   */
  async getRemainingCriteria(
    userId: string,
    groupId: number,
  ): Promise<
    Array<{
      criterion_id: number;
      code: string;
      name: string;
      description: string | null;
    }>
  > {
    try {
      const progress = await this.getGroupProgress(userId, groupId);

      const pendingCriteria = progress.criteria
        .filter((c) => c.status === 'PENDING')
        .map((c) => ({
          criterion_id: c.criterion_id,
          code: c.code,
          name: c.name,
          description: c.description,
        }));

      return pendingCriteria;
    } catch (error) {
      this.logger.error(
        `Error getting remaining criteria for user ${userId} and group ${groupId}:`,
        error.message,
      );
      throw error;
    }
  }

}