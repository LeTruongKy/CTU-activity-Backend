import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Activity } from '../../activities/entities/activity.entity';
import { User } from '../../users/entities/user.entity';

@Entity('activity_approvals')
export class ActivityApproval {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'integer', nullable: false })
  activityId: number;

  @ManyToOne(() => Activity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['APPROVED', 'REJECTED', 'REQUEST_CHANGE'],
    nullable: false,
  })
  action: 'APPROVED' | 'REJECTED' | 'REQUEST_CHANGE';

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn()
  timestamp: Date;
}
