import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagsRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new BadRequestException(`Tag with name "${createTagDto.name}" already exists`);
    }

    const tag = this.tagsRepository.create(createTagDto);
    return await this.tagsRepository.save(tag);
  }

  async findAll(): Promise<Tag[]> {
    return await this.tagsRepository.find({
      relations: ['activityTags', 'userInterests'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Tag> {
    const tag = await this.tagsRepository.findOne({
      where: { id },
      relations: ['activityTags', 'userInterests'],
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async update(id: number, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.tagsRepository.findOne({
        where: { name: updateTagDto.name },
      });

      if (existingTag) {
        throw new BadRequestException(`Tag with name "${updateTagDto.name}" already exists`);
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagsRepository.save(tag);
  }

  async remove(id: number): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagsRepository.remove(tag);
  }

  // ✅ NEW: Find multiple tags by IDs
  async findByIds(ids: number[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return await this.tagsRepository.findByIds(ids);
  }
}

