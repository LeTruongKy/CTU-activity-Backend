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

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

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

  @ManyToOne(() => Unit, { nullable: false })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location: string | null;

  @Column({ type: 'timestamp', nullable: true })
  startTime: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ type: 'integer', default: 0 })
  maxParticipants: number;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'COMPLETED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';

  @Column({ type: 'varchar', nullable: true, select: false })
  qrSecret: string | null;

  @OneToMany(() => Registration, (reg) => reg.activity)
  registrations: Registration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
