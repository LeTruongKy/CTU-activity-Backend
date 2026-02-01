import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ 
    type: 'enum',
    enum: ['LCH', 'CH'],
    default: 'CH'
  })
  type: 'LCH' | 'CH';

  @Column({ type: 'integer', nullable: true })
  parentId: number | null;

  @ManyToOne(() => Unit, (unit) => unit.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Unit;

  @OneToMany(() => Unit, (unit) => unit.parent)
  children: Unit[];

  @OneToMany(() => User, (user) => user.unit)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
