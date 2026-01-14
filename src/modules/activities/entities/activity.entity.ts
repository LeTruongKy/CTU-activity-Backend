import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Registration } from '../../registrations/entities/registration.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  startTime: Date;

  @Column()
  status: string; // e.g., PENDING, APPROVED, PUBLISHED

  @OneToMany(() => Registration, (reg) => reg.activity)
  registrations: Registration[];
}
