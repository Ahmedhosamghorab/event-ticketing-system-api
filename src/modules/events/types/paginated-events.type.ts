import { Event } from '../entities/event.entity';

export interface PaginatedEvents {
  data: Event[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
