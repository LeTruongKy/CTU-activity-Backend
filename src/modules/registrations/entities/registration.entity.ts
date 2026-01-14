import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.registrations)
  user: User;

  @ManyToOne(() => Activity, (activity) => activity.registrations)
  activity: Activity;

  @Column({ nullable: true })
  checkInAt: Date;

  @Column({ nullable: true })
  proofUrl: string;
}
