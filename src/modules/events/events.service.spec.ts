import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { EventStatus } from './enums/event-status.enum';

describe('EventsService', () => {
  let service: EventsService;
  let repository: jest.Mocked<Repository<Event>>;

  const mockEvent: Partial<Event> = {
    id: 'event-uuid-1',
    title: 'Test Concert',
    description: 'A great concert',
    venue: 'Test Stadium',
    startsAt: new Date('2026-09-01T10:00:00.000Z'),
    endsAt: new Date('2026-09-01T18:00:00.000Z'),
    status: EventStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockEvent], 1]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((event) =>
                Promise.resolve({ id: 'event-uuid-1', ...event }),
              ),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            softRemove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event successfully', async () => {
      const dto = {
        title: 'New Event',
        description: 'Description',
        venue: 'Venue',
        startsAt: '2026-09-01T10:00:00.000Z',
        endsAt: '2026-09-01T12:00:00.000Z',
      };

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
    });

    it('should throw BadRequestException if startsAt >= endsAt', async () => {
      const dto = {
        title: 'Invalid Date Event',
        description: 'Description',
        venue: 'Venue',
        startsAt: '2026-09-01T12:00:00.000Z',
        endsAt: '2026-09-01T10:00:00.000Z',
      };

      await expect(service.create(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated events list', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [mockEvent],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return event by id', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);

      const result = await service.findOne('event-uuid-1');

      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update event', async () => {
      repository.findOne.mockResolvedValue({ ...mockEvent } as Event);

      const dto = { title: 'Updated Title' };
      const result = await service.update('event-uuid-1', dto);

      expect(result.title).toBe('Updated Title');
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft remove event', async () => {
      repository.findOne.mockResolvedValue(mockEvent as Event);

      await service.remove('event-uuid-1');

      expect(repository.softRemove).toHaveBeenCalledWith(mockEvent);
    });
  });
});
