import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto, UpdateActivityStatusDto } from './dto/update-activity.dto';
import { ActivityApprovalsService } from '../activity_approvals/activity_approvals.service';
import { UnitsService } from '../units/units.service';
import { ActivityCategoriesService } from '../activity_categories/activity_categories.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    private readonly approvalsService: ActivityApprovalsService,
    private readonly unitsService: UnitsService,
    private readonly categoriesService: ActivityCategoriesService,
  ) {}

  async create(createActivityDto: CreateActivityDto, creatorId: string) {
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

      // Create activity with explicit createdBy assignment
      const activity = this.activitiesRepository.create({
        title: createActivityDto.title,
        description: createActivityDto.description || null,
        categoryId: createActivityDto.categoryId || null,
        unitId: createActivityDto.unitId,
        location: createActivityDto.location || null,
        startTime,
        endTime,
        maxParticipants: createActivityDto.maxParticipants || null,
        status: 'DRAFT',
        createdBy: { id: creatorId } as any, // ✅ Relationship object for ManyToOne
      });

      const saved = await this.activitiesRepository.save(activity);
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
        'approvals',
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

    // Only creator can edit draft activities
    if (activity.status !== 'DRAFT') {
      throw new ForbiddenException('Only draft activities can be edited');
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

      if (newStatus === 'APPROVED' || newStatus === 'PUBLISHED') {
        updateData.approvedBy = userId;
        updateData.approvedAt = new Date();
      }

      await this.activitiesRepository.update(id, updateData);

      // Log approval action
      if (newStatus === 'APPROVED') {
        await this.approvalsService.create({
          activityId: id,
          userId,
          action: 'APPROVED',
          comment: reason || null,
        });
      }

      return this.findOneFormatted(id);
    } catch (error) {
      console.error('Error updating activity status:', error);
      throw new InternalServerErrorException('Failed to update activity status');
    }
  }

  async remove(id: number, userId: string) {
    const activity = await this.findOne(id);

    // Only owner or admin can delete
    if (activity.createdBy !== userId) {
      throw new ForbiddenException('You can only delete your own activities');
    }

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
    const validTransitions: Record<string, string[]> = {
      DRAFT: ['PENDING', 'CANCELLED'],
      PENDING: ['APPROVED', 'REJECTED', 'DRAFT'],
      APPROVED: ['PUBLISHED', 'REJECTED'],
      PUBLISHED: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }

    // Authorization checks
    if (currentStatus === 'DRAFT' && newStatus === 'PENDING') {
      if (activity.createdBy !== userId) {
        throw new ForbiddenException('Only the activity creator can submit for approval');
      }
    } else if (['APPROVED', 'REJECTED', 'REQUEST_CHANGE'].includes(newStatus)) {
      if (!['ADMIN', 'LCH'].includes(userRole)) {
        throw new ForbiddenException('Only ADMIN or LCH can approve/reject activities');
      }
    } else if (newStatus === 'PUBLISHED') {
      if (activity.createdBy !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenException('Only the activity creator or ADMIN can publish');
      }
    } else if (newStatus === 'COMPLETED') {
      if (activity.createdBy !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenException('Only the activity creator or ADMIN can mark as completed');
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
      start_time: activity.startTime?.toISOString(),
      end_time: activity.endTime?.toISOString(),
      max_participants: activity.maxParticipants,
      status: activity.status,
      registration_count: activity.registrations?.length || 0,
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
}

