import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Activity } from '../../activities/entities/activity.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('activity_tags')
export class ActivityTag {
  @PrimaryColumn({ type: 'integer' })
  activityId: number;

  @PrimaryColumn({ type: 'integer' })
  tagId: number;

  @ManyToOne(() => Activity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @ManyToOne(() => Tag, (tag) => tag.activityTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tagId' })
  tag: Tag;

  @CreateDateColumn()
  createdAt: Date;
}
