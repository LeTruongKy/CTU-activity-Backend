import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from './entities/user_role.entity';
import { UserRolesService } from './user_roles.service';
import { UserRolesController } from './user_roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserRole])],
  controllers: [UserRolesController],
  providers: [UserRolesService],
  exports: [UserRolesService],
})
export class UserRolesModule {}
