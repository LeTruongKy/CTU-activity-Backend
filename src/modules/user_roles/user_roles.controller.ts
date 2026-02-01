import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UserRolesService } from './user_roles.service';

@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  async create(@Body() createUserRoleDto: any) {
    return await this.userRolesService.create(createUserRoleDto);
  }

  @Get()
  async findAll() {
    return await this.userRolesService.findAll();
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return await this.userRolesService.findByUser(userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.userRolesService.remove(id);
  }
}
