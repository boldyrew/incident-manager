import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser } from './types/authenticated-user.type';

const DEMO_EMAILS: Record<UserRole, string> = {
  ADMIN: 'demo-admin@secureops.io',
  ANALYST: 'demo-analyst@secureops.io',
  CLIENT_USER: 'demo-client@secureops.io',
};

type AuthUserResponse = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string | null;
  isDemo?: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    if (dto.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: dto.tenantId },
        select: { id: true },
      });

      if (!tenant) {
        throw new BadRequestException('Invalid tenantId');
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const createdUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        tenantId: dto.tenantId ?? null,
        passwordHash,
      },
    });

    return this.buildAuthResponse(createdUser);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async loginAsDemo(role: UserRole) {
    const user = await this.prisma.user.findFirst({
      where: { email: DEMO_EMAILS[role] },
    });

    if (!user) {
      throw new NotFoundException(`Demo user for role ${role} not found. Run db:seed first.`);
    }

    return this.buildAuthResponse(user, { isDemo: true });
  }

  async validateToken(token: string): Promise<AuthenticatedUser> {
    try {
      return await this.jwtService.verifyAsync<AuthenticatedUser>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async buildAuthResponse(user: User, options?: { isDemo?: boolean }) {
    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      ...(options?.isDemo ? { isDemo: true } : {}),
    };

    const expiresInSeconds = Number(process.env.JWT_EXPIRES_IN_SECONDS || 86400);
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: Number.isFinite(expiresInSeconds) ? expiresInSeconds : 86400,
    });

    return {
      accessToken,
      user: this.toAuthUser(user, options),
    };
  }

  private toAuthUser(user: User, options?: { isDemo?: boolean }): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      ...(options?.isDemo ? { isDemo: true } : {}),
    };
  }
}
