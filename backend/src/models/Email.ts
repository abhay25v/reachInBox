import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EmailStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RESCHEDULED = 'RESCHEDULED',
}

@Entity('emails')
export class Email {
  @ObjectIdColumn()
  _id!: ObjectId;

  get id(): string {
    return this._id.toString();
  }

  @Column()
  subject!: string;

  @Column()
  body!: string;

  @Column()
  recipientEmail!: string;

  @Column()
  status!: EmailStatus;

  @Column({ nullable: true })
  scheduledAt!: Date;

  @Column({ nullable: true })
  sentAt?: Date;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  jobId?: string; // BullMQ job ID

  @Column()
  userId!: string;

  @Column({ nullable: true })
  batchId?: string; // Group emails from same campaign

  @Column({ default: 0 })
  retryCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
