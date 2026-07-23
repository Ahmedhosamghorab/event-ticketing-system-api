import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseBuilder } from 'src/common/helpers/response-builder.helper';
import { UserRole } from 'src/modules/users/enums/user-role.enum';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new event (Admin only)' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 400, description: 'Validation or date range error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createEventDto: CreateEventDto) {
    const event = await this.eventsService.create(createEventDto);
    return ResponseBuilder.success(event, 'Event created successfully');
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get list of events (paginated & filterable)' })
  @ApiResponse({
    status: 200,
    description: 'List of events retrieved successfully',
  })
  async findAll(@Query() queryDto: QueryEventDto) {
    const result = await this.eventsService.findAll(queryDto);
    return ResponseBuilder.paginated(
      result.data,
      result.meta,
      'Events retrieved successfully',
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const event = await this.eventsService.findOne(id);
    return ResponseBuilder.success(event, 'Event retrieved successfully');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update an existing event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventsService.update(id, updateEventDto);
    return ResponseBuilder.success(event, 'Event updated successfully');
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an event (Admin only)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.eventsService.remove(id);
    return ResponseBuilder.success(null, 'Event deleted successfully');
  }
}
