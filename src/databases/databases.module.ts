import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { Role } from '../modules/roles/entities/role.entity';
import { Permission } from '../modules/permissions/entities/permission.entity';
import { RolePermission } from '../modules/role_permissions/entities/role_permission.entity';
import { Unit } from '../modules/units/entities/unit.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserRole } from '../modules/user_roles/entities/user_role.entity';
import { ActivityCategory } from '../modules/activity_categories/entities/activity_category.entity';
import { CriteriaGroup } from '../modules/criteria_groups/entities/criteria_group.entity';
import { Criterion } from '../modules/criteria/entities/criterion.entity';
import { SV5TSeederService } from './sv5t-seeder.service';

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
      CriteriaGroup,
      Criterion,
    ]),
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService, SV5TSeederService],
  exports: [DatabasesService, SV5TSeederService],
})
export class DatabasesModule {}
