import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors, UploadedFile, ParseUUIDPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSV5tDto } from './dto/update-user-svg5t.dto';
import { UpdateUserInterestsDto } from './dto/update-user-interests.dto';
import { UserLockDto } from './dto/user-lock.dto';
import { SV5tService } from './sv5t.service';
import { RegistrationsService } from '../registrations/registrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly sv5tService: SV5tService,
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me/profile')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const user = await this.usersService.findOneWithRelations(req.user.id);
    if (!user) {
      return {
        message: 'User not found',
        user: null,
      };
    }
    return {
      message: 'User account information',
      user: {
        user_id: user.id,
        email: user.email,
        fullName: user.fullName,
        studentCode: user.studentCode,
        major: user.major,
        unitId: user.unitId,
        unitName: user.unit?.name,
        avatarUrl: user.avatarUrl,
        status: user.status,
        createdAt: user.createdAt?.toISOString(),
      },
    };
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateMe(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ) {
    const updated = await this.usersService.update(req.user.id, updateUserDto, avatarFile);
    if (!updated) {
      return {
        message: 'Failed to update profile',
        user: null,
      };
    }
    return {
      message: 'Profile updated successfully',
      user: {
        user_id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        major: updated.major,
        avatarUrl: updated.avatarUrl,
        updatedAt: updated.updatedAt?.toISOString(),
      },
    };
  }

  /**
   * GET /users/me/activities
   * Get all activities for the current user with optional status filtering
   * Query params:
   *   - status (optional): REGISTERED, CHECKED_IN, CANCELLED
   */
  @Get('me/activities')
  @UseGuards(JwtAuthGuard)
  async getUserActivities(
    @Req() req: any,
  ) {
    const activities = await this.registrationsService.getUserActivitiesByStatus(
      req.user.id,
    );
    return {
      statusCode: 200,
      message: 'User activities retrieved successfully',
      data: activities,
    };
  }

  /**
   * GET /users/me/stats
   * Get user's activity registration statistics
   * Returns: { totalRegistered, totalVerified, pendingVerification }
   */
  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Req() req: any) {
    const stats = await this.registrationsService.getUserStats(req.user.id);
    return {
      statusCode: 200,
      message: 'User statistics retrieved successfully',
      data: stats,
    };
  }

  /**
   * GET /users/me/sv5t-progress
   * Get SV5T (Sinh viên 5 tốt) progress for the current user
   * Comprehensive calculation of 5 standards: Ethics, Academic, Fitness, Volunteering, Integration
   */
  @Get('me/sv5t-progress')
  @UseGuards(JwtAuthGuard)
  async getSV5tProgress(@Req() req: any) {
    const progress = await this.sv5tService.calculateSV5TProgress(req.user.id);
    return {
      statusCode: 200,
      message: 'SV5T progress calculated successfully',
      data: progress,
    };
  }

  /**
   * POST /users/me/interests
   * Update user's preferred activity categories (Many-to-Many)
   */
  @Post('me/interests')
  @UseGuards(JwtAuthGuard)
  async updateUserInterests(
    @Req() req: any,
    @Body() updateInterestsDto: UpdateUserInterestsDto,
  ) {
    await this.usersService.updateUserInterests(req.user.id, updateInterestsDto.categoryIds);
    return {
      statusCode: 200,
      message: 'User interests updated successfully',
      data: {
        user_id: req.user.id,
        categoryIds: updateInterestsDto.categoryIds,
      },
    };
  }

  /**
   * PATCH /users/:id/sv5t (Admin only)
   * Update user's SV5T tracking fields (GPA, DRL, Credit Count, Disability status)
   */
  @Patch(':id/sv5t')
  @UseGuards(JwtAuthGuard)
  async updateUserSV5tFields(
    @Param('id') id: string,
    @Body() updateSV5tDto: UpdateUserSV5tDto,
  ) {
    const updated = await this.usersService.updateSV5tFields(id, updateSV5tDto);
    if (!updated) {
      return {
        statusCode: 400,
        message: 'Failed to update SV5T fields',
      };
    }
    return {
      statusCode: 200,
      message: 'SV5T fields updated successfully',
      data: {
        user_id: updated.id,
        gpa: updated.gpa,
        drl: updated.drl,
        creditCount: updated.creditCount,
        isDisabled: updated.isDisabled,
        sv5tEligible: updated.sv5tEligible,
      },
    };
  }

  // ============================================================
  // SV5T (Student of 5 Merits) Endpoints with :userId
  // MUST be before generic :id routes
  // ============================================================

  /**
   * Get comprehensive SV5T progress for a user
   * Shows all groups, criteria, and eligibility status
   */
  @Get(':userId/sv5t/progress')
  async getSV5TProgress(@Param('userId') userId: string) {
    const progress = await this.sv5tService.calculateSV5TProgress(userId);
    return {
      message: 'SV5T progress calculated successfully',
      data: progress,
    };
  }

  /**
   * Get SV5T summary (quick status check)
   * Returns only essential information for dashboard/overview
   */
  @Get(':userId/sv5t/summary')
  async getSV5TSummary(@Param('userId') userId: string) {
    const summary = await this.sv5tService.getSV5TSummary(userId);
    return {
      message: 'SV5T summary retrieved successfully',
      data: summary,
    };
  }

  /**
   * Get progress for a specific criteria group
   */
  @Get(':userId/sv5t/groups/:groupId')
  async getGroupProgress(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ) {
    const groupProgress = await this.sv5tService.getGroupProgress(userId, parseInt(groupId, 10));
    return {
      message: 'Group progress retrieved successfully',
      data: groupProgress,
    };
  }

  /**
   * Get all criteria that the user has completed
   */
  @Get(':userId/sv5t/completed-criteria')
  async getCompletedCriteria(@Param('userId') userId: string) {
    const completedCriteria = await this.sv5tService.getCompletedCriteria(userId);
    return {
      message: `User has completed ${completedCriteria.length} criteria`,
      data: completedCriteria,
    };
  }

  /**
   * Get user's activity history relevant to SV5T
   * Shows which activities contributed to SV5T progress
   */
  @Get(':userId/sv5t/activity-history')
  async getActivityHistory(@Param('userId') userId: string) {
    const activityHistory = await this.sv5tService.getUserActivityHistory(userId);
    return {
      message: 'Activity history retrieved successfully',
      data: activityHistory,
    };
  }

  /**
   * Check if a specific group is completed
   */
  @Get(':userId/sv5t/groups/:groupId/completed')
  async isGroupCompleted(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ) {
    const isCompleted = await this.sv5tService.isGroupCompleted(userId, parseInt(groupId, 10));
    return {
      message: 'Group completion status retrieved',
      data: { isCompleted },
    };
  }

  /**
   * Get remaining criteria needed for a group
   * Useful for showing users what they need to do next
   */
  @Get(':userId/sv5t/groups/:groupId/remaining')
  async getRemainingCriteria(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ) {
    const remainingCriteria = await this.sv5tService.getRemainingCriteria(
      userId,
      parseInt(groupId, 10),
    );
    return {
      message: `Group has ${remainingCriteria.length} pending criteria`,
      data: remainingCriteria,
    };
  }

  /**
   * PATCH /users/:id/lock
   * Lock a user (set status to BANNED) - requires ADMIN or LCH role
   */
  @Patch(':id/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async lockUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() userLockDto: UserLockDto,
  ) {
    return this.usersService.lockUser(id);
  }

  /**
   * PATCH /users/:id/unlock
   * Unlock a user (set status to ACTIVE) - requires ADMIN or LCH role
   */
  @Patch(':id/unlock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async unlockUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() userLockDto: UserLockDto,
  ) {
    return this.usersService.unlockUser(id);
  }

  // ============================================================
  // Generic Routes (MUST be last!)
  // ============================================================

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.remove(id);
  }

}