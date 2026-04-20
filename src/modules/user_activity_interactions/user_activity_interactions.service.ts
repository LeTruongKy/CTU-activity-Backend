import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserActivityInteraction, InteractionType } from './entities/user_activity_interaction.entity';
import { UserInterestsService } from '../user_interests/user_interests.service';
import { Activity } from '../activities/entities/activity.entity';

@Injectable()
export class UserActivityInteractionsService {
  private readonly interactionWeights = {
    [InteractionType.VIEW]: 1,
    [InteractionType.REGISTER]: 3,
    [InteractionType.CHECK_IN]: 5,
  };

  constructor(
    @InjectRepository(UserActivityInteraction)
    private readonly interactionsRepository: Repository<UserActivityInteraction>,
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    private readonly userInterestsService: UserInterestsService,
  ) {}

  /**
   * Track user interaction on activity
   * 
   * @param userId - User ID
   * @param activityId - Activity ID
   * @param action - Interaction type (VIEW, REGISTER, CHECK_IN)
   * @param activity - Optional: Activity entity (if available, to get tags)
   * @param tagIds - Optional: Direct tag IDs (if Activity not provided)
   * 
   * Behavior:
   * - For VIEW: Dedup within 5 minutes
   * - For REGISTER/CHECK_IN: No dedup (allow multiple)
   * - Async weight update (fire-and-forget)
   */
  async trackInteraction(
    userId: string,
    activityId: number,
    action: InteractionType,
    activity?: Activity,
    tagIds?: number[],
  ): Promise<UserActivityInteraction | null> {
    try {
      // Step 1: Dedup VIEW interactions within 5 minutes
      if (action === InteractionType.VIEW) {
        const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentView = await this.interactionsRepository.findOne({
          where: {
            userId,
            activityId,
            action: InteractionType.VIEW,
            createdAt: MoreThan(sixtyMinutesAgo),
          },
        });

        if (recentView) {
          // Skip if already viewed in last 60 minutes
          return null;
        }
      }

      // Step 2: Get tag IDs (from activity.activityTags or direct param or DB)
      let tagsToUpdate: number[] = [];

      if (activity?.activityTags?.length) {
        tagsToUpdate = activity.activityTags.map((at) => at.tagId);
      } else if (tagIds?.length) {
        tagsToUpdate = tagIds;
      } else {
        // Fallback: Fetch activity from DB with relations
        const activityFromDb = await this.activitiesRepository.findOne({
          where: { id: activityId },
          relations: ['activityTags'],
        });

        if (activityFromDb?.activityTags?.length) {
          tagsToUpdate = activityFromDb.activityTags.map((at) => at.tagId);
        }
      }

      // Step 3: Save interaction record
      const interaction = this.interactionsRepository.create({
        userId,
        activityId,
        action,
      });
      const saved = await this.interactionsRepository.save(interaction);
      // Step 4: Async update user interests (fire-and-forget)
      if (tagsToUpdate.length > 0) {
        const weight = this.interactionWeights[action] || 1;
        this.updateUserInterests(userId, tagsToUpdate, weight).catch((error) => {
          console.error(
            `Failed to update interests for user ${userId}:`,
            error.message,
          );
        });
      }

      return saved;
    } catch (error) {
      console.error('Error tracking interaction:', error);
      throw error;
    }
  }

  /**
   * Private: Update user interests weights
   * Called asynchronously, no await in trackInteraction
   */
  private async updateUserInterests(
    userId: string,
    tagIds: number[],
    increment: number,
  ) {
    try {
      await this.userInterestsService.incrementWeight(userId, tagIds, increment);
    } catch (error) {
      console.error('Error updating user interests:', error);
      // Don't re-throw, just log
    }
  }

  /**
   * Get interaction history for user
   */
  async getUserInteractionHistory(
    userId: string,
    limit: number = 20,
  ): Promise<UserActivityInteraction[]> {
    return this.interactionsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get interaction stats by type
   */
  async getInteractionStats(userId: string) {
    const stats = await this.interactionsRepository
      .createQueryBuilder('interaction')
      .select('interaction.action', 'action')
      .addSelect('COUNT(interaction.id)', 'count')
      .where('interaction.userId = :userId', { userId })
      .groupBy('interaction.action')
      .getRawMany();

    return stats.reduce(
      (acc, stat) => ({
        ...acc,
        [stat.action]: parseInt(stat.count, 10),
      }),
      {},
    );
  }

  /**
   * Get all interactions for specific user-activity pair
   */
  async getUserActivityInteractions(
    userId: string,
    activityId: number,
  ): Promise<UserActivityInteraction[]> {
    return this.interactionsRepository.find({
      where: { userId, activityId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Cleanup old VIEW interactions (>90 days)
   * Can be called by scheduled task
   */
  async cleanupOldViewInteractions(): Promise<number> {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const result = await this.interactionsRepository.delete({
      action: InteractionType.VIEW,
      createdAt: MoreThan(ninetyDaysAgo),
    });
    return result.affected || 0;
  }
}
