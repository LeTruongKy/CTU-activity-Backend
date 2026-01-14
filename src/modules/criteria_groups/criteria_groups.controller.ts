import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CriteriaGroupsService } from './criteria_groups.service';
import { CreateCriteriaGroupDto } from './dto/create-criteria_group.dto';
import { UpdateCriteriaGroupDto } from './dto/update-criteria_group.dto';

@Controller('criteria-groups')
export class CriteriaGroupsController {
  constructor(private readonly criteriaGroupsService: CriteriaGroupsService) {}

  @Post()
  create(@Body() createCriteriaGroupDto: CreateCriteriaGroupDto) {
    return this.criteriaGroupsService.create(createCriteriaGroupDto);
  }

  @Get()
  findAll() {
    return this.criteriaGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.criteriaGroupsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCriteriaGroupDto: UpdateCriteriaGroupDto) {
    return this.criteriaGroupsService.update(+id, updateCriteriaGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.criteriaGroupsService.remove(+id);
  }
}
