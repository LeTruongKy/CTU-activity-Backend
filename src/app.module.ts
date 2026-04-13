import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitsModule } from './modules/units/units.module';
import { UsersModule } from './modules/users/users.module';
import { CriteriaGroupsModule } from './modules/criteria_groups/criteria_groups.module';
import { CriteriaModule } from './modules/criteria/criteria.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ActivityCriteriaModule } from './modules/activity_criteria/activity_criteria.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { StudentProgressModule } from './modules/student_progress/student_progress.module';
import { TagsModule } from './modules/tags/tags.module';
import { UserInterestsModule } from './modules/user_interests/user_interests.module';
import { ActivityTagsModule } from './modules/activity_tags/activity_tags.module';
import { UserCriteriaModule } from './modules/user_criteria/user-criteria.module';
import { UserActivityScheduleModule } from './modules/user_activity_schedule/user-activity-schedule.module';
import { User } from './modules/users/entities/user.entity';
import { Unit } from './modules/units/entities/unit.entity';
import { Activity } from './modules/activities/entities/activity.entity';
import { Registration } from './modules/registrations/entities/registration.entity';
import { ActivityCategory } from './modules/activity_categories/entities/activity_category.entity';
import { Role } from './modules/roles/entities/role.entity';
import { Permission } from './modules/permissions/entities/permission.entity';
import { RolePermission } from './modules/role_permissions/entities/role_permission.entity';
import { UserRole } from './modules/user_roles/entities/user_role.entity';
import { Criterion } from './modules/criteria/entities/criterion.entity';
import { CriteriaGroup } from './modules/criteria_groups/entities/criteria_group.entity';
import { ActivityCriterion } from './modules/activity_criteria/entities/activity_criterion.entity';
import { Tag } from './modules/tags/entities/tag.entity';
import { ActivityTag } from './modules/activity_tags/entities/activity_tag.entity';
import { UserInterest } from './modules/user_interests/entities/user_interest.entity';
import { UserCriteria } from './modules/user_criteria/entities/user_criteria.entity';
import { UserActivitySchedule } from './modules/user_activity_schedule/entities/user_activity_schedule.entity';
import { ActivityCategoriesModule } from './modules/activity_categories/activity_categories.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolePermissionsModule } from './modules/role_permissions/role_permissions.module';
import { UserRolesModule } from './modules/user_roles/user_roles.module';
import { DatabasesModule } from './databases/databases.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = process.env.NODE_ENV !== 'production';
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') || '5432'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          entities: [
            User,
            Unit,
            Activity,
            ActivityCategory,
            Registration,
            Role,
            Permission,
            RolePermission,
            UserRole,
            Criterion,
            CriteriaGroup,
            ActivityCriterion,
            Tag,
            ActivityTag,
            UserInterest,
            UserCriteria,
            UserActivitySchedule,
          ],
          migrations: ['dist/migrations/*.js'],
          migrationsRun: false, // Disabled - use manual migrations instead
          synchronize: false, // ⚠️ TEMPORARILY DISABLED - Fix DB orphaned data first, then re-enable
          logging: isDevelopment ? ['error'] : false, // Only log errors to avoid noise
          // ✅ Foreign key constraints enabled
          supportBigNumbers: true,
          bigNumberStrings: false,
          dateStrings: false,
          poolSize: 10,
          extra: {
            // ✅ Ensures TypeORM respects CASCADE deletes
            statement_timeout: 30000,
          },
        };
      },
    }),
    UnitsModule,
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserRolesModule,
    CriteriaGroupsModule,
    CriteriaModule,
    ActivitiesModule,
    ActivityCategoriesModule,
    ActivityCriteriaModule,
    RegistrationsModule,
    StudentProgressModule,
    TagsModule,
    UserInterestsModule,
    ActivityTagsModule,
    UserCriteriaModule,
    UserActivityScheduleModule,
    DatabasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
