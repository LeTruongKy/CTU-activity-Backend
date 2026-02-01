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

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer', nullable: true })
  activityId: number | null;

  @ManyToOne(() => Activity, { nullable: true })
  @JoinColumn({ name: 'activityId' })
  activity: Activity | null;

  @Column({
    type: 'enum',
    enum: ['ANNOUNCEMENT', 'RECAP', 'GUIDE'],
    default: 'ANNOUNCEMENT',
  })
  type: 'ANNOUNCEMENT' | 'RECAP' | 'GUIDE';

  @CreateDateColumn()
  publishedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
