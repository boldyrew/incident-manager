import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from './entities/user';
import { User as PrismaUser } from '@prisma/client';
import { UserRole } from 'src/common/types';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRole(role: UserRole) {
    const users = await this.prisma.user.findMany({
      where: { role },
    });
    return users.map((user) => this.mapUser(user));
  }

  async findById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException(`User ${userId} not found`);
    return this.mapUser(user);
  }

  private mapUser(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
}
