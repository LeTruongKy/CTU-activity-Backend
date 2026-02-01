import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('interaction_logs')
export class InteractionLog {
  @PrimaryGeneratedColumn('increment')
  id: bigint;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer', nullable: false })
  activityId: number;

  @ManyToOne(() => Activity, { nullable: false })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ type: 'varchar', length: 50, nullable: false })
  actionType: string; // 'VIEW', 'CLICK', 'SHARE'

  @CreateDateColumn()
  timestamp: Date;
}
