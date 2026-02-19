import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
  async updateMe(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.usersService.update(req.user.id, updateUserDto);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
