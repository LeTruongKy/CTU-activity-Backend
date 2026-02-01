import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Unit } from '../../units/entities/unit.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { UserRole } from '../../user_roles/entities/user_role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  studentCode: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  major: string | null;

  @Column({ type: 'enum', enum: ['ACTIVE', 'BANNED'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'BANNED';

  @Column({ type: 'integer', nullable: true })
  unitId: number | null;

  @ManyToOne(() => Unit, (unit) => unit.users, { nullable: true })
  @JoinColumn({ name: 'unitId' })
  unit: Unit;

  @OneToMany(() => Registration, (reg) => reg.user)
  registrations: Registration[];

  @OneToMany(() => UserRole, (ur) => ur.user)
  userRoles: UserRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
