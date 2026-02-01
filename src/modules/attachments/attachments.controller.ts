import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post()
  async create(@Body() createAttachmentDto: any) {
    return await this.attachmentsService.create(createAttachmentDto);
  }

  @Get()
  async findAll(
    @Query('relatedType') relatedType?: string,
    @Query('relatedId') relatedId?: number,
  ) {
    return await this.attachmentsService.findAll(relatedType, relatedId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.attachmentsService.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.attachmentsService.remove(id);
  }
}
