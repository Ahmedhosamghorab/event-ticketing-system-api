import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { EventStatus } from '../enums/event-status.enum';

export class QueryEventDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: EventStatus,
    description: 'Filter events by status',
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @ApiPropertyOptional({
    description: 'Search term for event title or venue',
    example: 'Music Festival',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
