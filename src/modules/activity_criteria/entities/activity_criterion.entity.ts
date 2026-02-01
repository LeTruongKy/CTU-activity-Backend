import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Activity } from '../../activities/entities/activity.entity';
import { Criterion } from '../../criteria/entities/criterion.entity';

@Entity('activity_criteria')
export class ActivityCriterion {
  @PrimaryColumn({ type: 'integer' })
  activityId: number;

  @PrimaryColumn({ type: 'integer' })
  criterionId: number;

  @ManyToOne(() => Activity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @ManyToOne(() => Criterion, (criterion) => criterion.activityCriteria, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'criterionId' })
  criterion: Criterion;

  @CreateDateColumn()
  createdAt: Date;
}
