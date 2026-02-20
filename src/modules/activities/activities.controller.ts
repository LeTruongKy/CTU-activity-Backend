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
  ParseIntPipe,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto, UpdateActivityStatusDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  /**
   * POST /activities
   * Create a new activity (requires ADMIN or LCH role)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LCH')
  async create(@Req() req: any, @Body() createActivityDto: CreateActivityDto) {
    const activity = await this.activitiesService.create(createActivityDto, req.user.id);
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
  @UseGuards(JwtAuthGuard)
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
   * Update activity status (workflow: DRAFT → PENDING → APPROVED → PUBLISHED → COMPLETED/CANCELLED)
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
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
   * DELETE /activities/:id
   * Delete an activity (creator only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return await this.activitiesService.remove(id, req.user.id);
  }
}
