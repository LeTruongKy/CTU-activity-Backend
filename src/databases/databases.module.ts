import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { RolePermission } from 'src/modules/role_permissions/entities/role_permission.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { UserRole } from 'src/modules/user_roles/entities/user_role.entity';
import { ActivityCategory } from 'src/modules/activity_categories/entities/activity_category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      Permission,
      RolePermission,
      Unit,
      User,
      UserRole,
      ActivityCategory,
    ]),
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
