import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.registrations, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer', nullable: false })
  activityId: number;

  @ManyToOne(() => Activity, (activity) => activity.registrations, {
    nullable: false,
  })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({
    type: 'enum',
    enum: ['REGISTERED', 'CHECKED_IN', 'CANCELLED'],
    default: 'REGISTERED',
  })
  status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';

  @Column({ type: 'timestamp', nullable: true })
  checkInAt: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  proofUrl: string | null;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  })
  proofStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';

  @Column({ type: 'integer', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
