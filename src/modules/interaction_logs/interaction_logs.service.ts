import { Injectable } from '@nestjs/common';
import { CreateInteractionLogDto } from './dto/create-interaction_log.dto';
import { UpdateInteractionLogDto } from './dto/update-interaction_log.dto';

@Injectable()
export class InteractionLogsService {
  create(createInteractionLogDto: CreateInteractionLogDto) {
    return 'This action adds a new interactionLog';
  }

  findAll() {
    return `This action returns all interactionLogs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} interactionLog`;
  }

  update(id: number, updateInteractionLogDto: UpdateInteractionLogDto) {
    return `This action updates a #${id} interactionLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} interactionLog`;
  }
}
