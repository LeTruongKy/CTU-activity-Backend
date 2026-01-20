import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';
import { ActivityCategory } from '../../activity_categories/entities/activity_category.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'varchar', length: 50 })
  status: string; // e.g., PENDING, APPROVED, PUBLISHED

  @Column({ type: 'integer', nullable: true })
  categoryId: number | null;

  @ManyToOne(() => ActivityCategory, (cat) => cat.activities, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: ActivityCategory;

  @OneToMany(() => Registration, (reg) => reg.activity)
  registrations: Registration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
