import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';
import { Registration } from '../../registrations/entities/registration.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studentCode: string;

  @Column()
  email: string;

  @ManyToOne(() => Unit, (unit) => unit.users)
  unit: Unit;

  @OneToMany(() => Registration, (reg) => reg.user)
  registrations: Registration[];
}
