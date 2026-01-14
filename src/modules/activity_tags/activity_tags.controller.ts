import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActivityTagsService } from './activity_tags.service';
import { CreateActivityTagDto } from './dto/create-activity_tag.dto';
import { UpdateActivityTagDto } from './dto/update-activity_tag.dto';

@Controller('activity-tags')
export class ActivityTagsController {
  constructor(private readonly activityTagsService: ActivityTagsService) {}

  @Post()
  create(@Body() createActivityTagDto: CreateActivityTagDto) {
    return this.activityTagsService.create(createActivityTagDto);
  }

  @Get()
  findAll() {
    return this.activityTagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityTagsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateActivityTagDto: UpdateActivityTagDto) {
    return this.activityTagsService.update(+id, updateActivityTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityTagsService.remove(+id);
  }
}
