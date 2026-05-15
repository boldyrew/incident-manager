import { UserRole } from 'src/common/types';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}
