import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { RolePermissionsService } from './role_permissions.service';

@Controller('role-permissions')
export class RolePermissionsController {
  constructor(private readonly rpService: RolePermissionsService) {}

  @Post()
  async create(@Body() createRolePermissionDto: any) {
    return await this.rpService.create(createRolePermissionDto);
  }

  @Get()
  async findAll() {
    return await this.rpService.findAll();
  }

  @Get('role/:roleId')
  async findByRole(@Param('roleId') roleId: number) {
    return await this.rpService.findByRole(roleId);
  }

  @Delete(':roleId/:permissionId')
  async remove(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
  ) {
    return await this.rpService.remove(roleId, permissionId);
  }
}
