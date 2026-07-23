import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserRole } from '../enums/user-role.enum';

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Filter users by role',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Search term for user email, first name, or last name',
    example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
