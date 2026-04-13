import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('user_activity_schedule')
@Index(['userId', 'startTime', 'endTime']) // For conflict detection queries
export class UserActivitySchedule {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'integer', nullable: false })
  activityId: number;

  @Column({ type: 'timestamp', nullable: false })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: false })
  endTime: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  /**
   * 🔗 Foreign Key: User (CASCADE delete)
   * When user is deleted, all their schedules are deleted
   */
  @ManyToOne(() => User, { 
    nullable: false,
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  /**
   * 🔗 Foreign Key: Activity (CASCADE delete)
   * When activity is deleted, all its schedules are deleted
   */
  @ManyToOne(() => Activity, (activity) => activity.userSchedules, { 
    nullable: false,
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
