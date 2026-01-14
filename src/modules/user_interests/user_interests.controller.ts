import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserInterestsService } from './user_interests.service';
import { CreateUserInterestDto } from './dto/create-user_interest.dto';
import { UpdateUserInterestDto } from './dto/update-user_interest.dto';

@Controller('user-interests')
export class UserInterestsController {
  constructor(private readonly userInterestsService: UserInterestsService) {}

  @Post()
  create(@Body() createUserInterestDto: CreateUserInterestDto) {
    return this.userInterestsService.create(createUserInterestDto);
  }

  @Get()
  findAll() {
    return this.userInterestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userInterestsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserInterestDto: UpdateUserInterestDto) {
    return this.userInterestsService.update(+id, updateUserInterestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userInterestsService.remove(+id);
  }
}
