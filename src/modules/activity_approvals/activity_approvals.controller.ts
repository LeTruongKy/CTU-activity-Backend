import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ActivityApprovalsService } from './activity_approvals.service';

@Controller('activity-approvals')
export class ActivityApprovalsController {
  constructor(private readonly approvalsService: ActivityApprovalsService) {}

  @Post()
  async create(@Body() createApprovalDto: any) {
    return await this.approvalsService.create(createApprovalDto);
  }

  @Get()
  async findAll(@Query('activityId') activityId?: number) {
    return await this.approvalsService.findAll(activityId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.approvalsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.approvalsService.remove(id);
  }
}
