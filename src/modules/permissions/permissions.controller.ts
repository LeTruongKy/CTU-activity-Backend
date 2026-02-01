import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  async create(@Body() createPermissionDto: any) {
    return await this.permissionsService.create(createPermissionDto);
  }

  @Get()
  async findAll() {
    return await this.permissionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.permissionsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updatePermissionDto: any) {
    return await this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.permissionsService.remove(id);
  }
}
