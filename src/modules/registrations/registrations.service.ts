import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { Registration } from './entities/registration.entity';
import { Activity } from '../activities/entities/activity.entity';
import { User } from '../users/entities/user.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ProofSubmissionDto, VerifyProofDto } from './dto/update-registration.dto';
import { CloudinaryService } from '../../cores/cloudinary/cloudinary.service';
import { QrUrlService } from '../../cores/qr/qr-url.service';
import { CalendarService } from '../user_activity_schedule/calendar.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly qrUrlService: QrUrlService,
    private readonly calendarService: CalendarService,
  ) {}

  async create(userId: string, createRegistrationDto: CreateRegistrationDto) {
    try {
      const { activityId } = createRegistrationDto;

      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Check if user is banned
      if (user.status === 'BANNED') {
        throw new ForbiddenException('Your account is banned and cannot register for activities');
      }

      const activity = await this.activitiesRepository.findOne({
        where: { id: activityId },
      });
      if (!activity) {
        throw new NotFoundException(`Activity with ID ${activityId} not found`);
      }

      if (activity.status !== 'PUBLISHED') {
        throw new BadRequestException(
          `Activity must be PUBLISHED to register`,
        );
      }

      const existingReg = await this.registrationsRepository.findOne({
        where: { userId: userId, activityId: activityId },
      });
      if (existingReg) {
        throw new ConflictException(
          'User is already registered for this activity',
        );
      }

      if (activity.maxParticipants) {
        const registrationCount = await this.registrationsRepository.count({
          where: { activityId: activityId },
        });
        if (registrationCount >= activity.maxParticipants) {
          throw new BadRequestException(
            `Activity has reached maximum capacity`,
          );
        }
      }

      // Check for schedule conflicts
      if (activity.startTime && activity.endTime) {
        const conflicts = await this.calendarService.checkForConflict(
          userId,
          activity.startTime,
          activity.endTime,
          activityId,
        );

        if (conflicts.length > 0) {
          throw new ConflictException({
            message: 'Activity schedule conflicts with your existing registrations',
            conflicts,
          });
        }
      }

      const registration = this.registrationsRepository.create({
        userId,
        activityId,
        proofStatus: 'PENDING',
      });
      console.log('Creating registration with data:', registration)
      const saved = await this.registrationsRepository.save(registration);

      // Add to user activity schedule
      if (activity.startTime && activity.endTime) {
        await this.calendarService.addToSchedule(
          userId,
          activityId,
          activity.startTime,
          activity.endTime,
        );
      }

      return this.findOne(saved.id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error creating registration:', error);
      throw new InternalServerErrorException('Failed to create registration');
    }
  }

  async findOne(id: string) {
    const registration = await this.registrationsRepository.findOne({
      where: { id },
      relations: ['user', 'activity'],
    });
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    return registration;
  }

  async checkIn(userId: string, activityId: number, qrCode: string) {
    try {
      const registration = await this.registrationsRepository.findOne({
        where: { userId: userId, activityId: activityId },
        relations: ['activity'],
      });
      if (!registration) {
        throw new NotFoundException(
          `Registration not found for user and activity`,
        );
      }

      if (registration.activity.qrSecret !== qrCode) {
        throw new BadRequestException('Invalid QR code');
      }

      const now = new Date();
      if (registration.activity.startTime && now < registration.activity.startTime) {
        throw new BadRequestException('Activity has not started yet');
      }
      if (registration.activity.endTime && now > registration.activity.endTime) {
        throw new BadRequestException('Activity has already ended');
      }

      if (registration.checkInAt) {
        throw new ConflictException('User is already checked in for this activity');
      }

      registration.checkInAt = new Date();
      const updated = await this.registrationsRepository.save(registration);
      return this.findOne(updated.id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error checking in:', error);
      throw new InternalServerErrorException('Failed to check in');
    }
  }

  /**
   * ✅ Check-in via QR code with signature verification
   * Used for URL-based QR codes (no in-app QR scanner needed)
   * 
   * @param userId - User ID from JWT
   * @param activityId - Activity ID from QR
   * @param timestamp - Timestamp from QR
   * @param signature - HMAC-SHA256 signature from QR
   */
  async checkInViaQr(
    userId: string,
    activityId: number,
    timestamp: number,
    signature: string,
  ): Promise<Registration> {
    try {
      // 1. Find activity
      console.log('Checking in via QR with data:', { userId, activityId, timestamp, signature })
      const activity = await this.activitiesRepository
        .createQueryBuilder('activity')
        .addSelect('activity.qrSecret') 
        .where('activity.id = :id', { id: activityId })
        .getOne();
      if (!activity) {
        throw new NotFoundException(`Activity with ID ${activityId} not found`);
      }
      console.log('Found activity for QR check-in:', activity)
      // 2. Verify signature using QrUrlService
      const isSignatureValid = this.qrUrlService.verifySignature(
        activityId,
        timestamp,
        signature,
        activity.qrSecret,
      );
      if (!isSignatureValid) {
        throw new BadRequestException('Invalid QR code signature');
      }

      // 3. (Optional) Verify timestamp is not too old (max 10 minutes for demo)
      // Comment out for demo, uncomment for production
      // const isTimestampValid = this.qrUrlService.isTimestampValid(timestamp);
      // if (!isTimestampValid) {
      //   throw new BadRequestException('QR code has expired');
      // }

      // 4. Find registration
      const registration = await this.registrationsRepository.findOne({
        where: { userId, activityId },
        relations: ['activity'],
      });
      if (!registration) {
        throw new NotFoundException(
          `Registration not found for user ${userId} and activity ${activityId}`,
        );
      }

      // 5. Check if already verified
      if (registration.proofStatus === 'VERIFIED') {
        throw new BadRequestException('User is already verified for this activity');
      }

      // 6. Update registration - set proofStatus to VERIFIED
      registration.proofStatus = 'VERIFIED';
      registration.checkInAt = new Date();
      const updated = await this.registrationsRepository.save(registration);

      return this.findOne(updated.id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error checking in via QR:', error);
      throw new InternalServerErrorException('Failed to check in via QR');
    }
  }

  async submitProof(
    userId: string,
    registrationId: string,
    proofSubmissionDto: ProofSubmissionDto,
    proofFile?: Express.Multer.File,
  ) {
    try {
      const registration = await this.registrationsRepository.findOne({
        where: { id: registrationId },
      });
      if (!registration) {
        throw new NotFoundException(`Registration with ID ${registrationId} not found`);
      }

      if (registration.userId !== userId) {
        throw new ForbiddenException('Can only submit proof for your own registration');
      }

      if (registration.proofStatus === 'VERIFIED') {
        throw new ConflictException('Proof has already been verified');
      }

      // Handle proof file upload to Cloudinary
      if (proofFile) {
        try {
          const uploadResult = await this.cloudinaryService.uploadImageToFolder(proofFile, 'ctu_proofs');
          registration.proofUrl = uploadResult.secure_url;
        } catch (error) {
          throw new BadRequestException(
            `Proof file upload failed: ${error.message}`,
          );
        }
      } else if (proofSubmissionDto.proofUrl) {
        // If no file but proofUrl provided in DTO, use it directly
        registration.proofUrl = proofSubmissionDto.proofUrl;
      }

      registration.proofStatus = 'PENDING';
      const updated = await this.registrationsRepository.save(registration);
      return this.findOne(updated.id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error submitting proof:', error);
      throw new InternalServerErrorException('Failed to submit proof');
    }
  }

  async verifyProof(
    verifierId: string,
    registrationId: string,
    verifyProofDto: VerifyProofDto,
  ) {
    try {
      const registration = await this.registrationsRepository.findOne({
        where: { id: registrationId },
      });
      if (!registration) {
        throw new NotFoundException(`Registration with ID ${registrationId} not found`);
      }

      if (registration.verifiedAt) {
        throw new ConflictException('Proof has already been verified');
      }

      registration.proofStatus = verifyProofDto.action;
      registration.verifiedBy = verifierId;
      registration.verifiedAt = new Date();
      if (verifyProofDto.rating) {
        registration.rating = verifyProofDto.rating;
      }
      if (verifyProofDto.feedback) {
        registration.feedback = verifyProofDto.feedback;
      }

      const updated = await this.registrationsRepository.save(registration);
      return this.findOne(updated.id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error verifying proof:', error);
      throw new InternalServerErrorException('Failed to verify proof');
    }
  }

  async getActivityRegistrations(activityId: number) {
    const registrations = await this.registrationsRepository.find({
      where: { activityId: activityId },
      relations: ['user'],
      order: { registeredAt: 'DESC' },
    });
    return registrations;
  }

  /**
   * Get user's activity history
   * @param userId - User ID
   * @returns List of activities with registration details
   */
  async getUserActivitiesByStatus(userId: string) {
    const query = this.registrationsRepository
      .createQueryBuilder('reg')
      .leftJoinAndSelect('reg.activity', 'activity')
      .leftJoinAndSelect('activity.unit', 'unit')
      .leftJoinAndSelect('activity.category', 'category')
      .where('reg.userId = :userId', { userId })
      .orderBy('activity.startTime', 'DESC');

    const registrations = await query.getMany();

    return registrations.map((reg) => ({
      activityId: reg.activity?.id,
      activityName: reg.activity?.title,
      activityDescription: reg.activity?.description || '',
      posterUrl: reg.activity?.posterUrl,
      startTime: reg.activity?.startTime,
      endTime: reg.activity?.endTime,
      organizingUnit: reg.activity?.unit?.name || 'Unknown',
      category: reg.activity?.category?.name || 'Unknown',
      isCheckedIn: !!reg?.checkInAt,
      proofStatus: reg?.proofStatus,
      registeredAt: reg?.registeredAt,
      registrationId: reg?.id,
    }));
  }

  /**
   * Get user's registration statistics
   * @param userId - User ID
   * @returns Summary with totalRegistered, totalVerified, and pendingVerification counts
   */
  async getUserStats(userId: string) {
    const registrations = await this.registrationsRepository.find({
      where: { userId },
    });

    const totalRegistered = registrations.length;

    const totalVerified = registrations.filter(
      (r) => r.proofStatus === 'VERIFIED',
    ).length;

    const pendingVerification = registrations.filter(
      (r) => r.proofStatus === 'PENDING',
    ).length;

    return {
      totalRegistered,
      totalVerified,
      pendingVerification,
    };
  }

  /**
   * API 1: Get list of activities a user has registered for
   * @param userId - User ID
   * @returns List of activities with full details including activity info and registration status
   */
  async getUserRegisteredActivities(userId: string) {
    try {
      const query = this.registrationsRepository
        .createQueryBuilder('reg')
        .leftJoinAndSelect('reg.activity', 'activity')
        .leftJoinAndSelect('activity.unit', 'unit')
        .leftJoinAndSelect('activity.category', 'category')
        .where('reg.userId = :userId', { userId })
        .orderBy('activity.startTime', 'DESC');
      const registrations = await query.getMany();

      return registrations.map((reg) => ({
        registrationId: reg.id,
        activityId: reg.activity?.id,
        activityTitle: reg.activity?.title,
        activityDescription: reg.activity?.description || '',
        posterUrl: reg.activity?.posterUrl,
        location: reg.activity?.location,
        startTime: reg.activity?.startTime,
        endTime: reg.activity?.endTime,
        maxParticipants: reg.activity?.maxParticipants,
        registrationCount: reg.activity?.registrations?.length || 0,
        organizingUnit: reg.activity?.unit?.name || 'Unknown',
        category: reg.activity?.category?.name || 'Unknown',
        categoryColor: reg.activity?.category?.color || '#000000',
        isCheckedIn: !!reg?.checkInAt,
        proofStatus: reg?.proofStatus,
        proofUrl: reg?.proofUrl,
        registeredAt: reg?.registeredAt,
        checkedInAt: reg?.checkInAt,
      }));
    } catch (error) {
      console.error('Error getting user registered activities:', error);
      throw new InternalServerErrorException('Failed to get user registered activities');
    }
  }

  /**
   * API 2: Get list of participants registered for an activity
   * @param activityId - Activity ID
   * @returns List of users registered for the activity with full details
   */
  async getActivityParticipants(activityId: number) {
    try {
      const registrations = await this.registrationsRepository.find({
        where: { activityId },
        relations: ['user'],
        order: { registeredAt: 'DESC' },
      });

      if (!registrations || registrations.length === 0) {
        return [];
      }

      return registrations.map((reg) => ({
        registrationId: reg.id,
        userId: reg.user?.id,
        fullName: reg.user?.fullName || 'Unknown',
        studentCode: reg.user?.studentCode || 'N/A',
        email: reg.user?.email,
        avatarUrl: reg.user?.avatarUrl,
        major: reg.user?.major,
        proofStatus: reg.proofStatus,
        proofUrl: reg.proofUrl || null,
        checkInAt: reg.checkInAt,
        registeredAt: reg.registeredAt,
        verifiedAt: reg.verifiedAt,
        rating: reg.rating,
        feedback: reg.feedback,
      }));
    } catch (error) {
      console.error('Error getting activity participants:', error);
      throw new InternalServerErrorException('Failed to get activity participants');
    }
  }

  /**
   * Cancel a user's registration for an activity
   * @param userId - User ID
   * @param registrationId - Registration ID
   * @returns Deleted registration
   */
  async cancelRegistration(userId: string, registrationId: string) {
    try {
      const registration = await this.registrationsRepository.findOne({
        where: { id: registrationId },
      });

      if (!registration) {
        throw new NotFoundException(
          `Registration with ID ${registrationId} not found`,
        );
      }

      if (registration.userId !== userId) {
        throw new ForbiddenException(
          'Can only cancel your own registration',
        );
      }

      const deleted = await this.registrationsRepository.softRemove(registration);

      // Remove from user activity schedule
      await this.calendarService.clearSchedule(userId, registration.activityId);

      return deleted;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.error('Error cancelling registration:', error);
      throw new InternalServerErrorException('Failed to cancel registration');
    }
  }
}
