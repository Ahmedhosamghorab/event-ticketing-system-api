import { UserRole } from 'src/modules/users/enums/user-role.enum';

export class AuthenticatedUser {
  id: string;
  role: UserRole;
  email?: string;
  firstName?: string;
  lastName?: string;
}
