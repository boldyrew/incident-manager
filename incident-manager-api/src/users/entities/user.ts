export type UserRole = 'ADMIN' | 'ANALYST' | 'CLIENT_USER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}