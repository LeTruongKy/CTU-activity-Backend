import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Res,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto, UpdateActivityStatusDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportService } from '../../cores/report/report.service';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
    private readonly reportService: ReportService,
  ) {}

  /**
   * POST /activities
   * Create a new activity (requires ADMIN or LCH role)
   * Can optionally upload a poster image
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH', 'CH')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Req() req: any,
    @Body() createActivityDto: CreateActivityDto,
    @UploadedFile() file?: Express.Multer.File | undefined,
  ) {
    const activity = await this.activitiesService.create(
      createActivityDto,
      req.user.id,
      file,
    );
    return {
      message: 'Activity created successfully',
      activity,
    };
  }

  /**
   * GET /activities
   * List activities with pagination, search, and filters
   */
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId', new ParseIntPipe({ optional: true })) categoryId?: number,
    @Query('unitId', new ParseIntPipe({ optional: true })) unitId?: number,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const result = await this.activitiesService.findAll({
      search,
      categoryId,
      unitId,
      status,
      page,
      limit,
    });
    return result;
  }

  /**
   * GET /activities/recommendations/:userId
   * Get recommended activities for a user based on their interests
   * ⚠️ MUST come before /:id route to avoid route conflict
   */
  @Get('recommendations/:userId')
  async getRecommendations(
    @Param('userId') userId: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const recommendations = await this.activitiesService.getRecommendedActivities(
      userId,
      limit || 10,
    );
    return {
      message: 'Recommendations retrieved successfully',
      data: recommendations,
    };
  }

  /**
   * GET /activities/:id
   * Get a single activity by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const activity = await this.activitiesService.findOneFormatted(id);
    return {
      message: 'Activity details',
      activity,
    };
  }

  /**
   * GET /activities/:id/registrations
   * Get list of students registered for an activity (organizer & admin only)
   */
  @Get(':id/registrations')
  @UseGuards(JwtAuthGuard)
  async getRegistrations(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const result = await this.activitiesService.getActivityRegistrations(
      id,
      req.user.id,
      req.user.role,
    );
    return {
      message: 'Activity registrations',
      data: result,
    };
  }

  /**
   * PATCH /activities/:id
   * Update activity details (only for draft activities)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateActivityDto: UpdateActivityDto,
    @Req() req: any,
  ) {
    const activity = await this.activitiesService.update(
      id,
      updateActivityDto,
      req.user.id,
    );
    return {
      message: 'Activity updated successfully',
      activity,
    };
  }

  /**
   * PATCH /activities/:id/status
   * Update activity status (workflow: PENDING → PUBLIC/CANCEL → COMPLETE)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateActivityStatusDto,
    @Req() req: any,
  ) {
    const activity = await this.activitiesService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
      req.user.role,
    );
    return {
      message: `Activity status updated to ${updateStatusDto.status}`,
      activity,
    };
  }

  /**
   * GET /activities/:id/report/export
   * Export activity participants list to Excel file
   * Requires ADMIN, LCH, or CH role and must be activity creator/approver
   */
  @Get(':id/report/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH', 'CH')
  async exportActivityReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: any,
  ) {
    const activity = await this.activitiesService.findOne(id);
    
    // Check authorization: only creator, approver, or ADMIN can export
    if (
      activity.createdBy !== req.user.id &&
      activity.approvedBy !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      return res.status(403).json({
        message: 'You do not have permission to export this activity report',
      });
    }

    const buffer = await this.reportService.generateActivityParticipantsReport(id);
    const filename = this.reportService.getReportFilename(id, activity.title);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    return res.end(buffer);
  }

  /**
   * DELETE /activities/:id
   * Delete an activity (creator only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.activitiesService.remove(id, req.user.id);
  }
}
