import { Injectable } from '@nestjs/common';
import { CreateActivityTagDto } from './dto/create-activity_tag.dto';
import { UpdateActivityTagDto } from './dto/update-activity_tag.dto';

@Injectable()
export class ActivityTagsService {
  create(createActivityTagDto: CreateActivityTagDto) {
    return 'This action adds a new activityTag';
  }

  findAll() {
    return `This action returns all activityTags`;
  }

  findOne(id: number) {
    return `This action returns a #${id} activityTag`;
  }

  update(id: number, updateActivityTagDto: UpdateActivityTagDto) {
    return `This action updates a #${id} activityTag`;
  }

  remove(id: number) {
    return `This action removes a #${id} activityTag`;
  }
}
