import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role_permission.entity';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rpRepository: Repository<RolePermission>,
  ) {}

  async create(createRolePermissionDto: any) {
    const rp = this.rpRepository.create(createRolePermissionDto);
    return await this.rpRepository.save(rp);
  }

  async findAll() {
    return await this.rpRepository.find({
      relations: ['role', 'permission'],
    });
  }

  async findByRole(roleId: number) {
    return await this.rpRepository.find({
      where: { roleId },
      relations: ['permission'],
    });
  }

  async remove(roleId: number, permissionId: number) {
    await this.rpRepository.delete({ roleId, permissionId });
  }
}
