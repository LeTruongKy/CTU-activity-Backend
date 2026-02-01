import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: any) {
    return await this.postsService.create(createPostDto);
  }

  @Get()
  async findAll(@Query('type') type?: string) {
    return await this.postsService.findAll(type);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.postsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updatePostDto: any) {
    return await this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.postsService.remove(id);
  }
}
