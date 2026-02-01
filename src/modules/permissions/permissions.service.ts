import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: any) {
    const permission = this.permissionRepository.create(createPermissionDto);
    return await this.permissionRepository.save(permission);
  }

  async findAll() {
    return await this.permissionRepository.find({
      relations: ['rolePermissions'],
    });
  }

  async findOne(id: number) {
    return await this.permissionRepository.findOne({
      where: { id },
      relations: ['rolePermissions'],
    });
  }

  async update(id: number, updatePermissionDto: any) {
    await this.permissionRepository.update(id, updatePermissionDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.permissionRepository.delete(id);
  }
}
