import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { CriteriaGroup } from '../../criteria_groups/entities/criteria_group.entity';

@Entity('registrations')
@Index(['userId', 'activityId'], { unique: true }) // CRITICAL: Prevent double-counting
@Index(['userId', 'proofStatus'])
@Index(['criteriaGroupId', 'proofStatus'])
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.registrations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'integer', nullable: false })
  activityId: number;

  @ManyToOne(() => Activity, (activity) => activity.registrations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  /**
   * 🎯 CRITERIA GROUP REFERENCE (cached from Activity for fast queries)
   */
  @Column({ type: 'integer', nullable: true })
  criteriaGroupId: number | null;

  @ManyToOne(() => CriteriaGroup, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'criteriaGroupId' })
  criteriaGroup: CriteriaGroup | null;

  /**
   * ✅ PROOF STATUS ONLY (no redundant status field)
   */
  @Column({
    type: 'enum',
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  })
  proofStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';

  /**
   * 🔐 QR CHECK-IN
   */
  @Column({ type: 'timestamp', nullable: true })
  checkInAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  qrSignature: string | null; // Signed QR for verification (activityId:secret:timestamp:signature)

  /**
   * 📝 PROOF SUBMISSION
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  proofUrl: string | null;

  @Column({ type: 'timestamp', nullable: true })
  proofSubmittedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verifiedBy' })
  verifier: User | null;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date | null;

  /**
   * 💬 FEEDBACK
   */
  @Column({ type: 'integer', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  feedback: string | null;

  @CreateDateColumn()
  registeredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
