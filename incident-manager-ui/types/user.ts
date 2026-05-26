export interface UserBase {
  id: string;
  email: string;
  fullName: string;
}

export type UserRole = 'ADMIN' | 'ANALYST' | 'CLIENT_USER';

export interface User extends UserBase {
  role: UserRole;
}