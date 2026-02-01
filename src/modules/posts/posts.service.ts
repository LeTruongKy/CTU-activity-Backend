import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: any) {
    const post = this.postRepository.create(createPostDto);
    return await this.postRepository.save(post);
  }

  async findAll(type?: string) {
    const query = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.activity', 'activity');

    if (type) {
      query.where('post.type = :type', { type });
    }

    return await query.orderBy('post.publishedAt', 'DESC').getMany();
  }

  async findOne(id: number) {
    return await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'activity'],
    });
  }

  async update(id: number, updatePostDto: any) {
    await this.postRepository.update(id, updatePostDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.postRepository.delete(id);
  }
}
