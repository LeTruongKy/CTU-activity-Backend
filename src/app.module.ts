import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UnitsModule } from './modules/units/units.module';
import { UsersModule } from './modules/users/users.module';
import { UnitTenuresModule } from './modules/unit_tenures/unit_tenures.module';
import { CriteriaGroupsModule } from './modules/criteria_groups/criteria_groups.module';
import { CriteriaModule } from './modules/criteria/criteria.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ActivityCriteriaModule } from './modules/activity_criteria/activity_criteria.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { TagsModule } from './modules/tags/tags.module';
import { UserInterestsModule } from './modules/user_interests/user_interests.module';
import { ActivityTagsModule } from './modules/activity_tags/activity_tags.module';
import { InteractionLogsModule } from './modules/interaction_logs/interaction_logs.module';
import { ActivityApprovalsModule } from './modules/activity_approvals/activity_approvals.module';
import { PostsModule } from './modules/posts/posts.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { User } from './modules/users/entities/user.entity';
import { Unit } from './modules/units/entities/unit.entity';
import { Activity } from './modules/activities/entities/activity.entity';
import { Registration } from './modules/registrations/entities/registration.entity';
import { ActivityCategory } from './modules/activity_categories/entities/activity_category.entity';
import { Role } from './modules/roles/entities/role.entity';
import { Permission } from './modules/permissions/entities/permission.entity';
import { RolePermission } from './modules/role_permissions/entities/role_permission.entity';
import { UserRole } from './modules/user_roles/entities/user_role.entity';
import { UnitTenure } from './modules/unit_tenures/entities/unit_tenure.entity';
import { Criterion } from './modules/criteria/entities/criterion.entity';
import { CriteriaGroup } from './modules/criteria_groups/entities/criteria_group.entity';
import { ActivityCriterion } from './modules/activity_criteria/entities/activity_criterion.entity';
import { Tag } from './modules/tags/entities/tag.entity';
import { ActivityTag } from './modules/activity_tags/entities/activity_tag.entity';
import { UserInterest } from './modules/user_interests/entities/user_interest.entity';
import { InteractionLog } from './modules/interaction_logs/entities/interaction_log.entity';
import { ActivityApproval } from './modules/activity_approvals/entities/activity_approval.entity';
import { Post } from './modules/posts/entities/post.entity';
import { Attachment } from './modules/attachments/entities/attachment.entity';
import { ActivityCategoriesModule } from './modules/activity_categories/activity_categories.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolePermissionsModule } from './modules/role_permissions/role_permissions.module';
import { UserRolesModule } from './modules/user_roles/user_roles.module';
import { DatabasesModule } from './databases/databases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') || '5432'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Unit,
          UnitTenure,
          Activity,
          ActivityCategory,
          ActivityApproval,
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
          InteractionLog,
          Post,
          Attachment,
        ],
        synchronize: true,
      }),
    }),
    UnitsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    RolePermissionsModule,
    UserRolesModule,
    UnitTenuresModule,
    CriteriaGroupsModule,
    CriteriaModule,
    ActivitiesModule,
    ActivityCategoriesModule,
    ActivityCriteriaModule,
    ActivityApprovalsModule,
    RegistrationsModule,
    TagsModule,
    UserInterestsModule,
    ActivityTagsModule,
    InteractionLogsModule,
    PostsModule,
    AttachmentsModule,
    DatabasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
