import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user_role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async create(createUserRoleDto: any) {
    const userRole = this.userRoleRepository.create(createUserRoleDto);
    return await this.userRoleRepository.save(userRole);
  }

  async findAll() {
    return await this.userRoleRepository.find({
      relations: ['user', 'role', 'unit'],
    });
  }

  async findByUser(userId: string) {
    return await this.userRoleRepository.find({
      where: { userId },
      relations: ['role', 'unit'],
    });
  }

  async remove(id: number) {
    await this.userRoleRepository.delete(id);
  }
}
