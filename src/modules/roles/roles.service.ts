import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: any) {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findAll() {
    return await this.roleRepository.find({
      relations: ['rolePermissions', 'userRoles'],
    });
  }

  async findOne(id: number) {
    return await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'userRoles'],
    });
  }

  async update(id: number, updateRoleDto: any) {
    await this.roleRepository.update(id, updateRoleDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.roleRepository.delete(id);
  }
}
