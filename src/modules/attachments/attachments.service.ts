import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attachment } from './entities/attachment.entity';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
  ) {}

  async create(createAttachmentDto: any) {
    const attachment = this.attachmentRepository.create(createAttachmentDto);
    return await this.attachmentRepository.save(attachment);
  }

  async findAll(relatedType?: string, relatedId?: number) {
    const query = this.attachmentRepository.createQueryBuilder('attachment');

    if (relatedType) {
      query.where('attachment.relatedType = :relatedType', { relatedType });
    }

    if (relatedId) {
      query.andWhere('attachment.relatedId = :relatedId', { relatedId });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    return await this.attachmentRepository.findOneBy({ id });
  }

  async remove(id: number) {
    await this.attachmentRepository.delete(id);
  }
}
