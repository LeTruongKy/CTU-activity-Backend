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
import { User } from './modules/users/entities/user.entity';
import { Unit } from './modules/units/entities/unit.entity';
import { Activity } from './modules/activities/entities/activity.entity';
import { Registration } from './modules/registrations/entities/registration.entity';

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
          Activity,
          Registration,
          // Add more entities as they are implemented
        ],
        synchronize: true,
      }),
    }),
    UnitsModule,
    UsersModule,
    UnitTenuresModule,
    CriteriaGroupsModule,
    CriteriaModule,
    ActivitiesModule,
    ActivityCriteriaModule,
    RegistrationsModule,
    TagsModule,
    UserInterestsModule,
    ActivityTagsModule,
    InteractionLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
