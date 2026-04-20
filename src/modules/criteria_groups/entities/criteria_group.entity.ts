import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Criterion } from '../../criteria/entities/criterion.entity';
import { Activity } from '../../activities/entities/activity.entity';

@Entity('criteria_groups')
export class CriteriaGroup {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', nullable: true, default: 1 })
  requiredCount: number | null;

  @OneToMany(() => Criterion, (criterion) => criterion.group)
  criteria: Criterion[];

  @OneToMany(() => Activity, (activity) => activity.criteriaGroup, { nullable: true })
  activities: Activity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
