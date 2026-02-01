import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CriteriaGroup } from '../../criteria_groups/entities/criteria_group.entity';
import { ActivityCriterion } from '../../activity_criteria/entities/activity_criterion.entity';

@Entity('criteria')
export class Criterion {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'integer', nullable: false })
  groupId: number;

  @ManyToOne(() => CriteriaGroup, (group) => group.criteria, {
    nullable: false,
  })
  @JoinColumn({ name: 'groupId' })
  group: CriteriaGroup;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @OneToMany(() => ActivityCriterion, (ac) => ac.criterion)
  activityCriteria: ActivityCriterion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
