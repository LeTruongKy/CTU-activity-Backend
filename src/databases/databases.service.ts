import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { genSaltSync, hashSync } from 'bcryptjs';

import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { RolePermission } from 'src/modules/role_permissions/entities/role_permission.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/modules/user_roles/entities/user_role.entity';
import { ActivityCategory } from 'src/modules/activity_categories/entities/activity_category.entity';

import {
  INIT_ROLES,
  INIT_PERMISSIONS,
  INIT_ROLE_PERMISSIONS,
  INIT_UNITS,
  INIT_USERS,
  INIT_USER_ROLES,
  INIT_CRITERIA_GROUPS,
  INIT_CRITERIA,
  INIT_ACTIVITY_CATEGORIES,
  INIT_TAGS,
} from './sampleData';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,

    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,

    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,

    @InjectRepository(ActivityCategory)
    private activityCategoryRepository: Repository<ActivityCategory>,

    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const shouldInit =
      this.configService.get<boolean>('SHOULD_INIT_DATA') || false;

    if (shouldInit) {
      this.logger.log('Starting database initialization...');

      try {
        // Check if data already exists
        const roleCount = await this.roleRepository.count();

        if (roleCount === 0) {
          this.logger.log('Initializing roles...');
          await this.roleRepository.insert(INIT_ROLES);
          this.logger.log(`✓ Inserted ${INIT_ROLES.length} roles`);
        } else {
          this.logger.warn('Roles already exist, skipping initialization');
          return;
        }

        // Initialize permissions
        const permissionCount = await this.permissionRepository.count();
        if (permissionCount === 0) {
          this.logger.log('Initializing permissions...');
          await this.permissionRepository.insert(INIT_PERMISSIONS);
          this.logger.log(`✓ Inserted ${INIT_PERMISSIONS.length} permissions`);
        }

        // Initialize role permissions
        const rolePermissionCount = await this.rolePermissionRepository.count();
        if (rolePermissionCount === 0) {
          this.logger.log('Initializing role permissions...');
          await this.rolePermissionRepository.insert(INIT_ROLE_PERMISSIONS);
          this.logger.log(
            `✓ Inserted ${INIT_ROLE_PERMISSIONS.length} role permissions`,
          );
        }

        // Initialize units
        const unitCount = await this.unitRepository.count();
        if (unitCount === 0) {
          this.logger.log('Initializing units...');
          await this.unitRepository.insert(INIT_UNITS);
          this.logger.log(`✓ Inserted ${INIT_UNITS.length} units`);
        }

        // Initialize users
        const userCount = await this.userRepository.count();
        if (userCount === 0) {
          this.logger.log('Initializing users...');
          // Hash passwords using default password from environment
          const initPassword = this.configService.get<string>(
            'INIT_PASSWORD',
            'InitPassword@123',
          );
          const salt = genSaltSync(10);
          const hashedPassword = hashSync(initPassword, salt);

          const usersWithHashedPasswords = INIT_USERS.map((user) => ({
            ...user,
            passwordHash: hashedPassword as string,
          }));

          await this.userRepository.insert(usersWithHashedPasswords);
          this.logger.log(`✓ Inserted ${INIT_USERS.length} users`);
        }

        // Initialize user roles
        const userRoleCount = await this.userRoleRepository.count();
        if (userRoleCount === 0) {
          this.logger.log('Initializing user roles...');
          await this.userRoleRepository.insert(INIT_USER_ROLES);
          this.logger.log(`✓ Inserted ${INIT_USER_ROLES.length} user roles`);
        }

        // Initialize activity categories
        const categoryCount = await this.activityCategoryRepository.count();
        if (categoryCount === 0) {
          this.logger.log('Initializing activity categories...');
          await this.activityCategoryRepository.insert(
            INIT_ACTIVITY_CATEGORIES,
          );
          this.logger.log(
            `✓ Inserted ${INIT_ACTIVITY_CATEGORIES.length} activity categories`,
          );
        }

        this.logger.log('✅ Database initialization completed successfully!');
      } catch (error) {
        this.logger.error('❌ Error during database initialization:', error);
        throw error;
      }
    } else {
      this.logger.warn(
        'SHOULD_INIT_DATA is disabled. Set it to true in .env to initialize data.',
      );
    }
  }
}
