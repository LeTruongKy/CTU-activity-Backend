import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserInterestDto } from './dto/create-user_interest.dto';
import { UserInterest } from './entities/user_interest.entity';
import { TagsService } from '../tags/tags.service';

@Injectable()
export class UserInterestsService {
  constructor(
    @InjectRepository(UserInterest)
    private readonly userInterestsRepository: Repository<UserInterest>,
    private readonly tagsService: TagsService,
  ) {}

  async create(createUserInterestDto: CreateUserInterestDto): Promise<UserInterest[]> {
    const { userId, tagIds, weight = 1.0 } = createUserInterestDto;

    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('tagIds must not be empty');
    }

    // Validate all tags exist
    const tags = await this.tagsService.findByIds(tagIds);
    if (tags.length !== tagIds.length) {
      throw new NotFoundException('Some tags not found');
    }

    // Delete existing interests for this user
    await this.userInterestsRepository.delete({ userId });

    // Create new interests
    const interests = tagIds.map((tagId) =>
      this.userInterestsRepository.create({
        userId,
        tagId,
        weight,
      }),
    );

    return await this.userInterestsRepository.save(interests);
  }

  async findAll(): Promise<UserInterest[]> {
    return await this.userInterestsRepository.find({
      relations: ['user', 'tag'],
    });
  }

  async findOne(id: number): Promise<UserInterest> {
    const interest = await this.userInterestsRepository.findOne({
      where: { id },
      relations: ['user', 'tag'],
    });

    if (!interest) {
      throw new NotFoundException(`UserInterest with ID ${id} not found`);
    }

    return interest;
  }

  async update(id: number, updateUserInterestDto: any): Promise<UserInterest> {
    const interest = await this.findOne(id);

    if (updateUserInterestDto.tagId) {
      const tag = await this.tagsService.findOne(updateUserInterestDto.tagId);
      if (!tag) {
        throw new NotFoundException('Tag not found');
      }
    }

    Object.assign(interest, updateUserInterestDto);
    return await this.userInterestsRepository.save(interest);
  }

  async remove(id: number): Promise<void> {
    const interest = await this.findOne(id);
    await this.userInterestsRepository.remove(interest);
  }

  // ✅ NEW: Get interests for a specific user
  async findByUserId(userId: string): Promise<UserInterest[]> {
    return await this.userInterestsRepository.find({
      where: { userId },
      relations: ['tag'],
    });
  }

  // ✅ NEW: Delete all interests for a user and create new ones
  async updateUserInterests(
    userId: string,
    tagIds: number[],
    weight: number = 1.0,
  ): Promise<UserInterest[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('tagIds must not be empty');
    }

    // Validate all tags exist
    const tags = await this.tagsService.findByIds(tagIds);
    if (tags.length !== tagIds.length) {
      throw new NotFoundException('Some tags not found');
    }

    // Delete existing interests
    await this.userInterestsRepository.delete({ userId });

    // Create new interests
    const interests = tagIds.map((tagId) =>
      this.userInterestsRepository.create({
        userId,
        tagId,
        weight,
      }),
    );

    return await this.userInterestsRepository.save(interests);
  }

  // ✅ NEW: Increment weight for user's interests (for interaction tracking)
  async incrementWeight(
    userId: string,
    tagIds: number[],
    increment: number = 1,
  ): Promise<UserInterest[]> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('tagIds must not be empty');
    }

    if (increment <= 0) {
      throw new BadRequestException('increment must be greater than 0');
    }

    // Validate all tags exist
    const tags = await this.tagsService.findByIds(tagIds);
    if (tags.length !== tagIds.length) {
      throw new NotFoundException('Some tags not found');
    }

    const updatedInterests: UserInterest[] = [];

    // Update or create interest for each tag
    for (const tagId of tagIds) {
      let interest = await this.userInterestsRepository.findOne({
        where: { userId, tagId },
      });

      if (interest) {
        // Increment existing weight, cap at 100
        interest.weight = Math.min(interest.weight + increment, 100);
      } else {
        // Create new interest with weight
        interest = this.userInterestsRepository.create({
          userId,
          tagId,
          weight: Math.min(increment, 100),
        });
      }

      const saved = await this.userInterestsRepository.save(interest);
      updatedInterests.push(saved);
    }

    return updatedInterests;
  }
}


