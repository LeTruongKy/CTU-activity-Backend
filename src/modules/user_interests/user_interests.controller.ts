import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserInterestsService } from './user_interests.service';
import { CreateUserInterestDto } from './dto/create-user_interest.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-interests')
export class UserInterestsController {
  constructor(private readonly userInterestsService: UserInterestsService) {}

  @Post()
  async create(@Body() createUserInterestDto: CreateUserInterestDto) {
    const interests = await this.userInterestsService.create(createUserInterestDto);
    return {
      message: 'User interests created successfully',
      interests,
    };
  }

  @Get()
  async findAll() {
    const interests = await this.userInterestsService.findAll();
    return {
      message: 'User interests retrieved successfully',
      data: interests,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const interest = await this.userInterestsService.findOne(id);
    return {
      message: 'User interest retrieved successfully',
      interest,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserInterestDto: any,
  ) {
    const interest = await this.userInterestsService.update(id, updateUserInterestDto);
    return {
      message: 'User interest updated successfully',
      interest,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userInterestsService.remove(id);
    return {
      message: 'User interest deleted successfully',
    };
  }

  // âœ… NEW: Get interests for a specific user
  @Get('by-user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    const interests = await this.userInterestsService.findByUserId(userId);
    return {
      message: 'User interests retrieved successfully',
      data: interests,
    };
  }

  // âœ… NEW: Update/Create interests for current user
  @Post('me/update')
  @UseGuards(JwtAuthGuard)
  async updateMyInterests(
    @Req() req: any,
    @Body() body: { tagIds: number[]; weight?: number },
  ) {
    const interests = await this.userInterestsService.updateUserInterests(
      req.user.id,
      body.tagIds,
      body.weight || 1.0,
    );
    return {
      message: 'Your interests updated successfully',
      interests,
    };
  }

  // âœ… NEW: Get interests for current authenticated user
  @Get('me/interests')
  @UseGuards(JwtAuthGuard)
  async getMyInterests(@Req() req: any) {
    const interests = await this.userInterestsService.findByUserId(req.user.id);
    return {
      message: 'Your interests retrieved successfully',
      data: interests,
    };
  }
}
