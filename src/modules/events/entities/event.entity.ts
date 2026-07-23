import { Column, Entity } from 'typeorm';
import { EventStatus } from '../enums/event-status.enum';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('events')
export class Event extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  venue: string;

  @Column({
    type: 'timestamp',
  })
  startsAt: Date;

  @Column({
    type: 'timestamp',
  })
  endsAt: Date;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;
}
