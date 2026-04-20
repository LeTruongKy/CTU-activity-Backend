import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { genSaltSync, hashSync } from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSV5tDto } from './dto/update-user-svg5t.dto';
import { UpdateUserInterestsDto } from './dto/update-user-interests.dto';
import { CloudinaryService } from '../../cores/cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(userData: CreateUserDto) {
    try {
      // Check if email already exists
      const existingUser = await this.usersRepository.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }

      // Hash password
      const salt = genSaltSync(10);
      const hashedPassword = hashSync(userData.password, salt);

      const newUser = this.usersRepository.create({
        ...userData,
        passwordHash: hashedPassword,
      });
      const saved = await this.usersRepository.save(newUser);
      
      // Return user without password
      const { passwordHash, refreshToken, ...result } = saved;
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'fullName', 'studentCode', 'passwordHash', 'avatarUrl', 'status', 'unitId'],
    });
  }

  async findByStudentCode(studentCode: string) {
    return await this.usersRepository.findOne({
      where: { studentCode },
    });
  }

  async findById(id: string) {
    return await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'studentCode', 'refreshToken', 'avatarUrl', 'status', 'unitId'],
    });
  }

  async findOneWithRelations(id: string) {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['unit', 'userRoles', 'userRoles.role'],
    });
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne({
      where: { id },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, avatarFile?: Express.Multer.File) {
    // Only update fields that are provided (not undefined)
    const updateData: any = {};
    if (updateUserDto.fullName !== undefined) {
      updateData.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.major !== undefined) {
      updateData.major = updateUserDto.major;
    }
    if (updateUserDto.studentCode !== undefined) {
      // Check if studentCode already exists for other users
      const existingUser = await this.usersRepository.findOne({
        where: { studentCode: updateUserDto.studentCode },
      });
      if (existingUser && existingUser.id !== id) {
        throw new BadRequestException('Student code already exists');
      }
      updateData.studentCode = updateUserDto.studentCode;
    }
    if (updateUserDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateUserDto.avatarUrl;
    }
    if (updateUserDto.unitId !== undefined) {
      updateData.unitId = updateUserDto.unitId;
    }

    // Handle avatar file upload to Cloudinary
    if (avatarFile) {
      try {
        const uploadResult = await this.cloudinaryService.uploadImageToFolder(
          avatarFile,
          'ctu_avatars',
        );
        updateData.avatarUrl = uploadResult.secure_url;
      } catch (error) {
        throw new BadRequestException(
          `Avatar upload failed: ${error.message}`,
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      // If no fields to update, just return the user as-is
      return await this.findOneWithRelations(id);
    }

    await this.usersRepository.update(id, updateData);
    return await this.findOneWithRelations(id);
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    await this.usersRepository.update(id, { refreshToken });
  }

  async updateSV5tFields(id: string, updateSV5tDto: UpdateUserSV5tDto) {
    const updateData: any = {};
    if (updateSV5tDto.gpa !== undefined) {
      updateData.gpa = updateSV5tDto.gpa;
    }
    if (updateSV5tDto.drl !== undefined) {
      updateData.drl = updateSV5tDto.drl;
    }
    if (updateSV5tDto.creditCount !== undefined) {
      updateData.creditCount = updateSV5tDto.creditCount;
    }
    if (updateSV5tDto.isDisabled !== undefined) {
      updateData.isDisabled = updateSV5tDto.isDisabled;
    }

    await this.usersRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async updateUserInterests(userId: string, categoryIds: number[]) {
    // This method is for future implementation
    // Currently a placeholder for updating user interest categories
    // Will be implemented when user_interests table is fully set up
    return { message: 'User interests updated successfully', categoryIds };
  }

  async lockUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    await this.usersRepository.update(userId, { status: 'BANNED' });
    return { message: 'User locked successfully', userId };
  }

  async unlockUser(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    
    await this.usersRepository.update(userId, { status: 'ACTIVE' });
    return { message: 'User unlocked successfully', userId };
  }

  async remove(id: string) {
    await this.usersRepository.delete(id);
  }
}
