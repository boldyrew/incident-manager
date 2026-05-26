import { UserRole } from 'src/common/types';

export interface UserBase {
  id: string;
  email: string;
  fullName: string;
}

export interface User extends UserBase {
  role: UserRole;
}
