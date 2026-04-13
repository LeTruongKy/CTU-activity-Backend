import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
  BadRequestException,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { CheckInRegistrationDto, ProofSubmissionDto, VerifyProofDto } from './dto/update-registration.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  /**
   * POST /registrations
   * Register a student for an activity
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() createRegistrationDto: CreateRegistrationDto) {
    const registration = await this.registrationsService.create(req.user.id, createRegistrationDto);
    return {
      message: 'Successfully registered for activity',
      registration,
    };
  }

  /**
   * PATCH /registrations/:activityId/check-in
   * Check in to an activity using QR code
   */
  @Patch(':id/check-in')
  @UseGuards(JwtAuthGuard)
  async checkIn(
    @Req() req: any,
    @Param('id') id: string,
    @Body() checkInDto: CheckInRegistrationDto,
  ) {
    if (!checkInDto.qrCode) {
      throw new BadRequestException('QR code is required');
    }
    
    // Parse activity ID from the registration
    const registration = await this.registrationsService.findOne(id);
    const checkedIn = await this.registrationsService.checkIn(
      req.user.id,
      registration.activityId,
      checkInDto.qrCode,
    );
    return {
      message: 'Check-in successful',
      registration: checkedIn,
    };
  }

  /**
   * PATCH /registrations/:id/proof
   * Submit participation proof
   */
  @Patch(':id/proof')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('proofFile'))
  async submitProof(
    @Req() req: any,
    @Param('id') id: string,
    @Body() proofSubmissionDto: ProofSubmissionDto,
    @UploadedFile() proofFile?: Express.Multer.File,
  ) {
    const registration = await this.registrationsService.submitProof(
      req.user.id,
      id,
      proofSubmissionDto,
      proofFile,
    );
    return {
      message: 'Proof submitted for verification',
      registration,
    };
  }

  /**
   * PATCH /registrations/:id/verify
   * Verify participation proof (Staff only)
   */
  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async verifyProof(
    @Req() req: any,
    @Param('id') id: string,
    @Body() verifyProofDto: VerifyProofDto,
  ) {
    const registration = await this.registrationsService.verifyProof(
      req.user.id,
      id,
      verifyProofDto,
    );
    return {
      message: 'Proof verification completed',
      registration,
    };
  }

  /**
   * GET /registrations/user/:userId
   * Get all activities registered by a user
   */
  @Get('user/:userId')
  async getUserRegisteredActivities(
    @Param('userId') userId: string,
  ) {
    const activities = await this.registrationsService.getUserRegisteredActivities(
      userId,
    );
    return {
      message: 'User registered activities retrieved successfully',
      data: activities,
      count: activities.length,
    };
  }

  /**
   * GET /registrations/activity/:activityId
   * Get all participants registered for an activity (Admin only)
   */
  @Get('activity/:activityId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async getActivityParticipants(
    @Param('activityId', ParseIntPipe) activityId: number,
  ) {
    const participants = await this.registrationsService.getActivityParticipants(
      activityId,
    );
    return {
      message: 'Activity participants retrieved successfully',
      data: participants,
      count: participants.length,
    };
  }

  /**
   * DELETE /registrations/:id
   * Cancel a registration
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancelRegistration(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const result = await this.registrationsService.cancelRegistration(req.user.id, id);
    return {
      message: 'Registration cancelled successfully',
      registration: result,
    };
  }
}
