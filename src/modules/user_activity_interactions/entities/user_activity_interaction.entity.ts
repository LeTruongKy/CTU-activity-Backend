import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum InteractionType {
  VIEW = 'VIEW',
  REGISTER = 'REGISTER',
  CHECK_IN = 'CHECK_IN',
}

@Entity('user_activity_interactions')
@Index(['userId', 'activityId']) // Find all interactions for user on activity
@Index(['userId', 'createdAt']) // Get user's recent interactions
export class UserActivityInteraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('int')
  activityId: number;

  @Column({
    type: 'enum',
    enum: InteractionType,
  })
  action: InteractionType;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Activity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;
}
