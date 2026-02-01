import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityTag } from '../../activity_tags/entities/activity_tag.entity';
import { UserInterest } from '../../user_interests/entities/user_interest.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  name: string;

  @OneToMany(() => ActivityTag, (at) => at.tag)
  activityTags: ActivityTag[];

  @OneToMany(() => UserInterest, (ui) => ui.tag)
  userInterests: UserInterest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
