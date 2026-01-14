import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InteractionLogsService } from './interaction_logs.service';
import { CreateInteractionLogDto } from './dto/create-interaction_log.dto';
import { UpdateInteractionLogDto } from './dto/update-interaction_log.dto';

@Controller('interaction-logs')
export class InteractionLogsController {
  constructor(private readonly interactionLogsService: InteractionLogsService) {}

  @Post()
  create(@Body() createInteractionLogDto: CreateInteractionLogDto) {
    return this.interactionLogsService.create(createInteractionLogDto);
  }

  @Get()
  findAll() {
    return this.interactionLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interactionLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInteractionLogDto: UpdateInteractionLogDto) {
    return this.interactionLogsService.update(+id, updateInteractionLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interactionLogsService.remove(+id);
  }
}
