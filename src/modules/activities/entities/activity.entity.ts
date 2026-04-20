import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { ActivityCategory } from '../../activity_categories/entities/activity_category.entity';
import { Unit } from '../../units/entities/unit.entity';
import { User } from '../../users/entities/user.entity';
import { ActivityCriterion } from '../../activity_criteria/entities/activity_criterion.entity';
import { ActivityTag } from '../../activity_tags/entities/activity_tag.entity';
import { CriteriaGroup } from '../../criteria_groups/entities/criteria_group.entity';
import { UserActivitySchedule } from '../../user_activity_schedule/entities/user_activity_schedule.entity';

@Entity('activities')
@Index(['criteriaGroupId', 'startTime'])
export class Activity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'integer', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => ActivityCategory, (cat) => cat.activities, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: ActivityCategory;

  @Column({ type: 'integer', nullable: false })
  unitId: number;

  @ManyToOne(() => Unit, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  // âœ… createdBy: Explicitly set UUID column for creator reference
  @Column({ type: 'uuid', nullable: false })
  createdBy: string;

  // âœ… creator: Relationship to User entity (lazy-loaded)
  @ManyToOne(() => User, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  posterUrl: string | null;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ type: 'integer', nullable: true })
  maxParticipants: number | null;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PUBLISHED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver: User | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  /**
   * ðŸŽ¯ CRITERIA GROUP LINK
   * Links activity to a criteria group for automatic criteria tracking
   */
  @Column({ type: 'integer', nullable: true })
  criteriaGroupId: number | null;

  @ManyToOne(() => CriteriaGroup, (cg) => cg.activities, { nullable: true })
  @JoinColumn({ name: 'criteriaGroupId' })
  criteriaGroup: CriteriaGroup | null;

  /**
   * ðŸ” QR CODE FIELDS (SECURE)
   */
  @Column({ type: 'varchar', unique: true, nullable: true, select: false })
  qrSecret: string | null; // Unique secret for this activity

  @Column({ type: 'text', nullable: true })
  qrCodeUrl: string | null; // Generated QR image

  @Column({ type: 'timestamp', nullable: true })
  qrExpiration: Date | null; // Expires after activity end + grace period

  @Column({ type: 'boolean', default: false })
  requiresProof: boolean; // Whether proof submission needed

  @Column({ type: 'integer', default: 0 })
  pointsValue: number; // SV5T points awarded

  @OneToMany(() => Registration, (reg) => reg.activity, { cascade: ['remove'] })
  registrations: Registration[];

  @OneToMany(() => ActivityCriterion, (ac) => ac.activity, { cascade: ['remove'] })
  activityCriteria: ActivityCriterion[];

  @OneToMany(() => ActivityTag, (at) => at.activity, { cascade: ['remove'] })
  activityTags: ActivityTag[];

  @OneToMany(() => UserActivitySchedule, (uas) => uas.activity, { cascade: ['remove'] })
  userSchedules: UserActivitySchedule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
