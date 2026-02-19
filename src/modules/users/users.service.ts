import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: any) {
    try {
      const newUser = this.usersRepository.create(userData);
      await this.usersRepository.save(newUser);
      return newUser;
    } catch (error) {
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Only update fields that are provided (not undefined)
    const updateData: any = {};
    if (updateUserDto.fullName !== undefined) {
      updateData.fullName = updateUserDto.fullName;
    }
    if (updateUserDto.major !== undefined) {
      updateData.major = updateUserDto.major;
    }
    if (updateUserDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateUserDto.avatarUrl;
    }
    if (updateUserDto.unitId !== undefined) {
      updateData.unitId = updateUserDto.unitId;
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

  async remove(id: string) {
    await this.usersRepository.delete(id);
  }
}
