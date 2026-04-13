import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import type { Express } from 'express';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto, UpdateActivityStatusDto } from './dto/update-activity.dto';
import { UnitsService } from '../units/units.service';
import { ActivityCategoriesService } from '../activity_categories/activity_categories.service';
import { CloudinaryService } from '../../cores/cloudinary/cloudinary.service';
import { RecommendationService } from './services/recommendation.service';
import { ActivityTag } from '../activity_tags/entities/activity_tag.entity';
import { ActivityCriterion } from '../activity_criteria/entities/activity_criterion.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    @InjectRepository(ActivityTag)
    private readonly activityTagRepository: Repository<ActivityTag>,
    @InjectRepository(ActivityCriterion)
    private readonly activityCriterionRepository: Repository<ActivityCriterion>,
    private readonly unitsService: UnitsService,
    private readonly categoriesService: ActivityCategoriesService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(createActivityDto: CreateActivityDto, creatorId: string, posterFile?: Express.Multer.File) {
    try {
      // Validate creatorId exists
      if (!creatorId) {
        throw new BadRequestException('Creator ID is required');
      }

      // Validate unit exists
      const unit = await this.unitsService.findOne(createActivityDto.unitId);
      if (!unit) {
        throw new NotFoundException(`Unit with ID ${createActivityDto.unitId} not found`);
      }

      // Validate category exists if provided
      if (createActivityDto.categoryId) {
        const category = await this.categoriesService.findOne(createActivityDto.categoryId);
        if (!category) {
          throw new NotFoundException(`Category with ID ${createActivityDto.categoryId} not found`);
        }
      }

      // Validate startTime < endTime
      const startTime = new Date(createActivityDto.startTime);
      const endTime = new Date(createActivityDto.endTime);
      if (startTime >= endTime) {
        throw new BadRequestException('End time must be after start time');
      }

      // Handle poster file upload to Cloudinary
      let posterUrl = createActivityDto.posterUrl || null;
      if (posterFile) {
        try {
          const uploadResult = await this.cloudinaryService.uploadImageToFolder(
            posterFile,
            'ctu_activities',
          );
          posterUrl = uploadResult.secure_url;
        } catch (error) {
          throw new BadRequestException(
            `Poster upload failed: ${error.message}`,
          );
        }
      }

      // Create activity with explicit createdBy assignment
      const activity = this.activitiesRepository.create({
        title: createActivityDto.title,
        description: createActivityDto.description || null,
        categoryId: createActivityDto.categoryId || null,
        unitId: createActivityDto.unitId,
        location: createActivityDto.location || null,
        posterUrl: posterUrl,
        startTime,
        endTime,
        maxParticipants: createActivityDto.maxParticipants || null,
        status: 'PENDING',
        createdBy: { id: creatorId } as any, // ✅ Relationship object for ManyToOne
      });

      const saved = await this.activitiesRepository.save(activity);

      // Add tags to activity_tags table
      if (createActivityDto.tagIds && createActivityDto.tagIds.length > 0) {
        const activityTags = createActivityDto.tagIds.map((tagId) => (
          this.activityTagRepository.create({
            activityId: saved.id,
            tagId,
          })
        ));
        await this.activityTagRepository.save(activityTags);
      }

      // Add criteria to activity_criteria table
      if (createActivityDto.criteriaIds && createActivityDto.criteriaIds.length > 0) {
        const activityCriteria = createActivityDto.criteriaIds.map((criterionId) => (
          this.activityCriterionRepository.create({
            activityId: saved.id,
            criterionId,
          })
        ));
        await this.activityCriterionRepository.save(activityCriteria);
      }

      return this.findOne(saved.id);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error creating activity:', error);
      throw new InternalServerErrorException('Failed to create activity');
    }
  }

  async findAll(filters: {
    search?: string;
    categoryId?: number;
    unitId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { search, categoryId, unitId, status, page = 1, limit = 20 } = filters;

      // Validate pagination
      if (page < 1 || limit < 1 || limit > 100) {
        throw new BadRequestException('Page must be ≥ 1, limit must be 1-100');
      }

      const query = this.activitiesRepository.createQueryBuilder('activity');

      // Relations
      query.leftJoinAndSelect('activity.category', 'category');
      query.leftJoinAndSelect('activity.unit', 'unit');
      query.leftJoinAndSelect('activity.creator', 'creator');
      query.leftJoinAndSelect('activity.approver', 'approver');
      query.leftJoinAndSelect('activity.activityTags', 'activityTags');
      query.leftJoinAndSelect('activityTags.tag', 'tag');
      query.leftJoinAndSelect('activity.activityCriteria', 'activityCriteria');
      query.leftJoinAndSelect('activityCriteria.criterion', 'criterion');

      // Filters
      if (search) {
        query.andWhere(
          '(activity.title ILIKE :search OR activity.description ILIKE :search)',
          { search: `%${search}%` },
        );
      }

      if (categoryId) {
        query.andWhere('activity.categoryId = :categoryId', { categoryId });
      }

      if (unitId) {
        query.andWhere('activity.unitId = :unitId', { unitId });
      }

      if (status) {
        query.andWhere('activity.status = :status', { status });
      }

      // Sorting and pagination
      query.orderBy('activity.createdAt', 'DESC');
      query.skip((page - 1) * limit).take(limit);

      const [data, total] = await query.getManyAndCount();

      return {
        data: data.map((activity) => this.formatActivityResponse(activity)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching activities:', error);
      throw new InternalServerErrorException('Failed to fetch activities');
    }
  }

  async findOne(id: number) {
    const activity = await this.activitiesRepository.findOne({
      where: { id },
      relations: [
        'category',
        'unit',
        'creator',
        'approver',
        'registrations',
        'registrations.user',
        'activityTags',
        'activityTags.tag',
        'activityCriteria',
        'activityCriteria.criterion',
      ],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async findOneFormatted(id: number) {
    const activity = await this.findOne(id);
    return this.formatActivityResponse(activity);
  }

  async update(id: number, updateActivityDto: UpdateActivityDto, userId: string) {
    const activity = await this.findOne(id);

    // Only PENDING activities can be edited (not yet approved)
    if (activity.status !== 'PENDING') {
      throw new ForbiddenException('Only PENDING activities can be edited');
    }

    if (activity.createdBy !== userId) {
      throw new ForbiddenException('You can only edit your own activities');
    }

    // Validate times if provided
    if (updateActivityDto.startTime || updateActivityDto.endTime) {
      const startTime = updateActivityDto.startTime
        ? new Date(updateActivityDto.startTime)
        : activity.startTime;
      const endTime = updateActivityDto.endTime ? new Date(updateActivityDto.endTime) : activity.endTime;

      if (startTime && endTime && startTime >= endTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    // Validate category if provided
    if (updateActivityDto.categoryId !== undefined && updateActivityDto.categoryId !== null) {
      const category = await this.categoriesService.findOne(updateActivityDto.categoryId);
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateActivityDto.categoryId} not found`,
        );
      }
    }

    try {
      await this.activitiesRepository.update(id, updateActivityDto);
      return this.findOneFormatted(id);
    } catch (error) {
      console.error('Error updating activity:', error);
      throw new InternalServerErrorException('Failed to update activity');
    }
  }

  /**
   * 🔄 STATUS WORKFLOW
   * PENDING (created) → PUBLISHED (approved) → COMPLETED (done) or CANCELLED (cancelled)
   */
  async updateStatus(
    id: number,
    updateStatusDto: UpdateActivityStatusDto,
    userId: string,
    userRole: string,
  ) {
    const activity = await this.findOne(id);
    const { status: newStatus, reason } = updateStatusDto;

    // Validate workflow transitions
    await this.validateStatusTransition(activity.status, newStatus, userId, userRole, activity);

    try {
      // Update activity status
      const updateData: any = { status: newStatus };

      // Track who approved it
      if (newStatus === 'PUBLISHED') {
        updateData.approvedBy = userId;
        updateData.approvedAt = new Date();
      }

      await this.activitiesRepository.update(id, updateData);
      return this.findOneFormatted(id);
    } catch (error) {
      console.error('Error updating activity status:', error);
      throw new InternalServerErrorException('Failed to update activity status');
    }
  }

  async remove(id: number, userId: string) {
    const activity = await this.findOne(id);

    // Only owner or admin can delete
    // if (activity.createdBy !== userId) {
    //   throw new ForbiddenException('You can only delete your own activities');
    // }

    try {
      await this.activitiesRepository.softDelete(id);
      return { message: 'Activity deleted successfully' };
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw new InternalServerErrorException('Failed to delete activity');
    }
  }

  async getActivityRegistrations(id: number, userId: string, userRole: string) {
    const activity = await this.findOne(id);

    // Only creator or admin can view registrations
    if (activity.createdBy !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to view registrations for this activity');
    }

    const registrations = await this.activitiesRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.registrations', 'registration')
      .leftJoinAndSelect('registration.user', 'user')
      .where('activity.id = :id', { id })
      .select([
        'registration.id',
        'registration.status',
        'registration.checkInAt',
        'registration.proofStatus',
        'registration.proofUrl',
        'registration.rating',
        'registration.createdAt',
        'user.id',
        'user.email',
        'user.fullName',
        'user.studentCode',
        'user.avatarUrl',
      ])
      .orderBy('registration.createdAt', 'DESC')
      .getOne();

    return {
      activity_id: activity.id,
      title: activity.title,
      registration_count: registrations?.registrations?.length || 0,
      registrations: registrations?.registrations || [],
    };
  }

  private async validateStatusTransition(
    currentStatus: string,
    newStatus: string,
    userId: string,
    userRole: string,
    activity: Activity,
  ) {
    /**
     * 🔄 STATUS TRANSITIONS
     * PENDING → PUBLISHED (approve) | CANCELLED (reject)
     * PUBLISHED → CANCELLED (cancel) | COMPLETED (mark done, after activity ends)
     * CANCELLED → (no transitions, final)
     * COMPLETED → (no transitions, final)
     */
    const validTransitions: Record<string, string[]> = {
      PENDING: ['PUBLISHED', 'CANCELLED'],
      PUBLISHED: ['CANCELLED', 'COMPLETED'],
      CANCELLED: [],
      COMPLETED: [],
    };
    console.log(`Validating status transition from ${currentStatus} to ${newStatus} for user ${userId} with role ${userRole}`, !validTransitions[currentStatus]?.includes(newStatus));
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Authorization checks
    if (newStatus === 'PUBLISHED' || newStatus === 'CANCELLED') {
      // Only ADMIN or LCH can approve/reject activities
      if (!['ADMIN', 'LCH'].includes(userRole)) {
        throw new ForbiddenException('Only ADMIN or LCH can approve/reject activities');
      }
    } else if (newStatus === 'COMPLETED') {
      // Only activity creator or ADMIN can mark as complete
      if (activity.createdBy !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenException('Only the activity creator or ADMIN can mark as complete');
      }
    }
  }

  private formatActivityResponse(activity: Activity) {
    return {
      activity_id: activity.id,
      title: activity.title,
      description: activity.description,
      category: activity.category
        ? {
            category_id: activity.category.id,
            name: activity.category.name,
            color: activity.category.color,
          }
        : null,
      unit: {
        unit_id: activity.unit.id,
        name: activity.unit.name,
      },
      location: activity.location,
      poster_url: activity.posterUrl,
      start_time: activity.startTime?.toISOString(),
      end_time: activity.endTime?.toISOString(),
      max_participants: activity.maxParticipants,
      status: activity.status,
      registration_count: activity.registrations?.length || 0,
      tags: (activity.activityTags || []).map((at) => ({
        tag_id: at.tag?.id,
        name: at.tag?.name,
      })),
      criteria: (activity.activityCriteria || []).map((ac) => ({
        criterion_id: ac.criterion?.id,
        name: ac.criterion?.name,
        description: ac.criterion?.description,
      })),
      created_by: {
        user_id: activity.creator?.id,
        fullName: activity.creator?.fullName,
      },
      approved_by: activity.approver
        ? {
            user_id: activity.approver.id,
            fullName: activity.approver.fullName,
          }
        : null,
      approved_at: activity.approvedAt?.toISOString(),
      created_at: activity.createdAt?.toISOString(),
      updated_at: activity.updatedAt?.toISOString(),
    };
  }

  async getRecommendedActivities(
    userId: string,
    limit: number = 10,
  ): Promise<any> {
    try {
      // Call Python recommendation service
      const recommendations = await this.recommendationService.getRecommendationFromPython(
        userId,
        limit,
      );

      // If recommendation service returns data, format and return it
      if (recommendations && recommendations.recommendations && recommendations.recommendations.length > 0) {
        // Extract activity IDs from recommendations
        const activityIds = recommendations.recommendations.map((rec) => rec.activity_id);

        // Fetch full activity details from database
        const activities = await this.activitiesRepository.find({
          where: { id: In(activityIds) },
          relations: [
            'category',
            'unit',
            'creator',
            'approver',
            'registrations',
            'activityTags',
            'activityTags.tag',
            'activityCriteria',
            'activityCriteria.criterion',
          ],
        });

        // Create a map of activity_id -> recommendation scores
        const scoreMap = new Map();
        recommendations.recommendations.forEach((rec) => {
          scoreMap.set(rec.activity_id, {
            similarity_score: rec.similarity_score,
          });
        });

        // Format activities with recommendation scores
        const formattedRecommendations = activities
          .filter((activity) => scoreMap.has(activity.id))
          .map((activity) => {
            const scores = scoreMap.get(activity.id);
            return {
              ...this.formatActivityResponse(activity),
              similarity_score: scores.similarity_score,
              collaborative_score: scores.collaborative_score,
              final_score: scores.final_score,
            };
          })
          // Sort by final_score to maintain recommendation order
          .sort((a, b) => (b.final_score || 0) - (a.final_score || 0));

        return {
          user_id: recommendations.user_id,
          total_count: formattedRecommendations.length,
          recommendations: formattedRecommendations,
        };
      }

      // Fallback: return recent PUBLISHED activities if recommendation service fails
      const activities = await this.activitiesRepository.find({
        where: { status: 'PUBLISHED' },
        relations: [
          'category',
          'unit',
          'creator',
          'approver',
          'registrations',
          'activityTags',
          'activityTags.tag',
          'activityCriteria',
          'activityCriteria.criterion',
        ],
        order: { createdAt: 'DESC' },
        take: limit,
      });

      return {
        user_id: userId,
        total_count: activities.length,
        recommendations: activities.map((activity) =>
          this.formatActivityResponse(activity),
        ),
      };
    } catch (error) {
      console.error(
        `Error getting recommendations for user ${userId}:`,
        error,
      );

      // Fallback: return recent PUBLISHED activities
      const activities = await this.activitiesRepository.find({
        where: { status: 'PUBLISHED' },
        relations: [
          'category',
          'unit',
          'creator',
          'approver',
          'registrations',
          'activityTags',
          'activityTags.tag',
          'activityCriteria',
          'activityCriteria.criterion',
        ],
        order: { createdAt: 'DESC' },
        take: limit,
      });

      return {
        user_id: userId,
        total_count: activities.length,
        recommendations: activities.map((activity) =>
          this.formatActivityResponse(activity),
        ),
      };
    }
  }

  async seedActivities(): Promise<any> {
    // Check how many activities already exist
    const existingCount = await this.activitiesRepository.count();

    if (existingCount > 0) {
      return {
        message: 'Activities already exist (skipped to avoid duplicates)',
        total: existingCount,
        details: 'Run DELETE query to clear existing data if you want to reseed',
      };
    }

    // Return message about seeding
    return {
      message: 'Seeding activities requires database setup',
      total: 0,
      details:
        'Seed activities manually or use existing data in database',
    };
  }
}

