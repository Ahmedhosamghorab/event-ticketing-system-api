import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { EventStatus } from '../enums/event-status.enum';

export class CreateEventDto {
  @ApiProperty({
    example: 'Summer Music Festival',
    description: 'Title of the event',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'A three-day outdoor music festival featuring local bands.',
    description: 'Detailed description of the event',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'Central Park Arena, New York',
    description: 'Venue location of the event',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  venue: string;

  @ApiProperty({
    example: '2026-08-01T18:00:00.000Z',
    description: 'Event start date and time (ISO 8601 string)',
  })
  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @ApiProperty({
    example: '2026-08-03T23:00:00.000Z',
    description: 'Event end date and time (ISO 8601 string)',
  })
  @IsDateString()
  @IsNotEmpty()
  endsAt: string;

  @ApiPropertyOptional({
    enum: EventStatus,
    default: EventStatus.DRAFT,
    description: 'Status of the event',
  })
  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;
}
