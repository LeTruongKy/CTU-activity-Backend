import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CriteriaGroup } from '../../criteria_groups/entities/criteria_group.entity';

@Entity('user_criteria')
export class UserCriteria {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @Column({ type: 'integer', nullable: false })
  criteriaGroupId: number;

  @Column({ type: 'integer', nullable: true, default: 0 })
  progressCount: number | null;

  @Column({ type: 'float', nullable: true, default: 0.0 })
  completion: number | null;

  @ManyToOne(() => User, (user) => user.userCriteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => CriteriaGroup, (cg) => cg.userCriteria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'criteriaGroupId' })
  criteriaGroup: CriteriaGroup;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
