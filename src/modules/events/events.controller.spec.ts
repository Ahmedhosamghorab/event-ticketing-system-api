import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventStatus } from './enums/event-status.enum';

describe('EventsController', () => {
  let controller: EventsController;
  let service: jest.Mocked<EventsService>;

  const mockEvent = {
    id: 'event-uuid-1',
    title: 'Festival',
    description: 'Music',
    venue: 'Park',
    startsAt: new Date('2026-09-01T10:00:00.000Z'),
    endsAt: new Date('2026-09-01T18:00:00.000Z'),
    status: EventStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockEvent),
            findAll: jest.fn().mockResolvedValue({
              data: [mockEvent],
              meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
            }),
            findOne: jest.fn().mockResolvedValue(mockEvent),
            update: jest
              .fn()
              .mockResolvedValue({ ...mockEvent, title: 'Updated' }),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event and return formatted response', async () => {
      const dto = {
        title: 'Festival',
        description: 'Music',
        venue: 'Park',
        startsAt: '2026-09-01T10:00:00.000Z',
        endsAt: '2026-09-01T18:00:00.000Z',
      };

      const res = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(res.data).toEqual(mockEvent);
      expect(res.message).toBe('Event created successfully');
    });
  });

  describe('findAll', () => {
    it('should return paginated events response', async () => {
      const res = await controller.findAll({});

      expect(service.findAll).toHaveBeenCalledWith({});
      expect(res.data).toEqual([mockEvent]);
      expect(res.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });
  });

  describe('findOne', () => {
    it('should return event details by ID', async () => {
      const res = await controller.findOne('event-uuid-1');

      expect(service.findOne).toHaveBeenCalledWith('event-uuid-1');
      expect(res.data).toEqual(mockEvent);
    });
  });

  describe('update', () => {
    it('should update event and return response', async () => {
      const dto = { title: 'Updated' };
      const res = await controller.update('event-uuid-1', dto);

      expect(service.update).toHaveBeenCalledWith('event-uuid-1', dto);
      expect(res.data.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete event and return response', async () => {
      const res = await controller.remove('event-uuid-1');

      expect(service.remove).toHaveBeenCalledWith('event-uuid-1');
      expect(res.message).toBe('Event deleted successfully');
    });
  });
});
