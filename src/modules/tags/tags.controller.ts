import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagsService.create(createTagDto);
    return {
      message: 'Tag created successfully',
      tag,
    };
  }

  @Get()
  async findAll() {
    const tags = await this.tagsService.findAll();
    return {
      message: 'Tags retrieved successfully',
      data: tags,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const tag = await this.tagsService.findOne(id);
    return {
      message: 'Tag retrieved successfully',
      tag,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    const tag = await this.tagsService.update(id, updateTagDto);
    return {
      message: 'Tag updated successfully',
      tag,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.tagsService.remove(id);
    return {
      message: 'Tag deleted successfully',
    };
  }
}

