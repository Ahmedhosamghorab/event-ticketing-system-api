import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from 'src/modules/users/enums/user-role.enum';

export class UserPayloadDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: 'John', nullable: true })
  firstName?: string;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName?: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: UserPayloadDto })
  user: UserPayloadDto;
}
