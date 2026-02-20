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
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { ActivityCategory } from '../../activity_categories/entities/activity_category.entity';
import { Unit } from '../../units/entities/unit.entity';
import { User } from '../../users/entities/user.entity';
import { ActivityApproval } from '../../activity_approvals/entities/activity_approval.entity';

@Entity('activities')
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

  // ✅ createdBy: Explicitly set UUID column for creator reference
  @Column({ type: 'uuid', nullable: false })
  createdBy: string;

  // ✅ creator: Relationship to User entity (lazy-loaded)
  @ManyToOne(() => User, { nullable: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string | null;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ type: 'integer', nullable: true })
  maxParticipants: number | null;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approvedBy' })
  approver: User | null;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  qrSecret: string | null;

  @OneToMany(() => Registration, (reg) => reg.activity, { cascade: ['remove'] })
  registrations: Registration[];

  @OneToMany(() => ActivityApproval, (approval) => approval.activity, { cascade: ['remove'] })
  approvals: ActivityApproval[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
