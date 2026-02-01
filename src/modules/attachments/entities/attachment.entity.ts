import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('attachments')
export class Attachment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fileName: string;

  @Column({ type: 'varchar', nullable: false })
  fileUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fileType: string | null;

  @Column({ type: 'varchar', length: 50, nullable: false })
  relatedType: string; // 'POST', 'ACTIVITY', 'PROOF'

  @Column({ type: 'integer', nullable: false })
  relatedId: number;

  @CreateDateColumn()
  createdAt: Date;
}
