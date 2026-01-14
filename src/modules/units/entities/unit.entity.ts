import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('units')
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; // e.g., 'LCH' or 'CH'

  @Column({ nullable: true })
  parentId: string;

  @ManyToOne(() => Unit, (unit) => unit.children, { nullable: true })
  parent: Unit;

  @OneToMany(() => Unit, (unit) => unit.parent)
  children: Unit[];

  @OneToMany(() => User, (user) => user.unit)
  users: User[];
}
