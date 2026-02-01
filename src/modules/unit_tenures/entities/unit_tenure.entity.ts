import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';
import { User } from '../../users/entities/user.entity';

@Entity('unit_tenures')
export class UnitTenure {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'integer', nullable: false })
  unitId: number;

  @ManyToOne(() => Unit, { nullable: false })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @Column({ type: 'uuid', nullable: false })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: false })
  position: string;

  @Column({ type: 'date', nullable: false })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
