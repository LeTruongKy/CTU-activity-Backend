import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivityCriteriaService } from './activity_criteria.service';
import { CreateActivityCriterionDto } from './dto/create-activity_criterion.dto';
import { UpdateActivityCriterionDto } from './dto/update-activity_criterion.dto';

@Controller('activity-criteria')
export class ActivityCriteriaController {
  constructor(private readonly activityCriteriaService: ActivityCriteriaService) {}

  @Post()
  create(@Body() createActivityCriterionDto: CreateActivityCriterionDto) {
    return this.activityCriteriaService.create(createActivityCriterionDto);
  }

  @Get()
  findAll() {
    return this.activityCriteriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityCriteriaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityCriterionDto: UpdateActivityCriterionDto) {
    return this.activityCriteriaService.update(+id, updateActivityCriterionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityCriteriaService.remove(+id);
  }
}
