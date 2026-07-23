import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { PaginatedEvents } from './types';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const startsAt = new Date(createEventDto.startsAt);
    const endsAt = new Date(createEventDto.endsAt);

    if (startsAt >= endsAt) {
      throw new BadRequestException('Event end date must be after start date');
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      startsAt,
      endsAt,
    });

    return this.eventRepository.save(event);
  }

  async findAll(queryDto: QueryEventDto): Promise<PaginatedEvents> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.eventRepository.createQueryBuilder('event');

    if (queryDto.status) {
      queryBuilder.andWhere('event.status = :status', {
        status: queryDto.status,
      });
    }

    if (queryDto.search) {
      queryBuilder.andWhere(
        '(LOWER(event.title) LIKE LOWER(:search) OR LOWER(event.venue) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    queryBuilder.orderBy('event.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    return event;
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.findOne(id);

    const startsAt = updateEventDto.startsAt
      ? new Date(updateEventDto.startsAt)
      : event.startsAt;
    const endsAt = updateEventDto.endsAt
      ? new Date(updateEventDto.endsAt)
      : event.endsAt;

    if (startsAt >= endsAt) {
      throw new BadRequestException('Event end date must be after start date');
    }

    Object.assign(event, {
      ...updateEventDto,
      startsAt,
      endsAt,
    });

    return this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.softRemove(event);
  }
}
