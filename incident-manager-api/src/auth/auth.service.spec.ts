import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma.mock';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function makeDbUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'jane@secureops.io',
    fullName: 'Jane Analyst',
    role: 'ANALYST',
    tenantId: null,
    passwordHash: 'hashed',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaMock;
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };
  const originalExpiry = process.env.JWT_EXPIRES_IN_SECONDS;

  beforeEach(async () => {
    prisma = createPrismaMock();
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
      verifyAsync: jest.fn(),
    };
    jest.clearAllMocks();
    delete process.env.JWT_EXPIRES_IN_SECONDS;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  afterAll(() => {
    if (originalExpiry === undefined) delete process.env.JWT_EXPIRES_IN_SECONDS;
    else process.env.JWT_EXPIRES_IN_SECONDS = originalExpiry;
  });

  describe('register', () => {
    const dto = {
      email: 'new@secureops.io',
      password: 'P@ssw0rd!',
      fullName: 'New User',
      role: 'ANALYST' as const,
    };

    it('rejects an email that is already in use', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(service.register(dto)).rejects.toThrow(
        new BadRequestException('Email already in use'),
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown tenantId', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.tenant.findUnique.mockResolvedValue(null);
      await expect(service.register({ ...dto, tenantId: 'missing' })).rejects.toThrow(
        'Invalid tenantId',
      );
    });

    it('hashes the password, creates the user and returns a token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.tenant.findUnique.mockResolvedValue({ id: 'tenant-1' });
      mockedBcrypt.hash.mockResolvedValue('hashed-pw' as never);
      const created = makeDbUser({ email: dto.email, tenantId: 'tenant-1' });
      prisma.user.create.mockResolvedValue(created);

      const result = await service.register({ ...dto, tenantId: 'tenant-1' });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          fullName: dto.fullName,
          role: dto.role,
          tenantId: 'tenant-1',
          passwordHash: 'hashed-pw',
        },
      });
      expect(result).toEqual({
        accessToken: 'signed-token',
        user: {
          id: created.id,
          email: created.email,
          fullName: created.fullName,
          role: created.role,
          tenantId: 'tenant-1',
        },
      });
    });

    it('stores a null tenant when none is provided', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(makeDbUser());

      await service.register(dto);

      expect(prisma.tenant.findUnique).not.toHaveBeenCalled();
      expect(prisma.user.create.mock.calls[0][0].data.tenantId).toBeNull();
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'x@y.z', password: 'p' })).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
    });

    it('rejects a wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue(makeDbUser());
      mockedBcrypt.compare.mockResolvedValue(false as never);
      await expect(service.login({ email: 'jane@secureops.io', password: 'bad' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('bad', 'hashed');
    });

    it('signs a token with the user payload', async () => {
      const user = makeDbUser({ role: 'CLIENT_USER', tenantId: 'tenant-1' });
      prisma.user.findUnique.mockResolvedValue(user);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.login({ email: user.email, password: 'good' });

      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, email: user.email, role: 'CLIENT_USER', tenantId: 'tenant-1' },
        { expiresIn: 86400 },
      );
      expect(result.accessToken).toBe('signed-token');
      expect(result.user).not.toHaveProperty('passwordHash');
    });

    it('uses JWT_EXPIRES_IN_SECONDS when it is numeric', async () => {
      process.env.JWT_EXPIRES_IN_SECONDS = '3600';
      prisma.user.findUnique.mockResolvedValue(makeDbUser());
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await service.login({ email: 'jane@secureops.io', password: 'good' });

      expect(jwtService.signAsync.mock.calls[0][1]).toEqual({ expiresIn: 3600 });
    });

    it('falls back to 86400 when JWT_EXPIRES_IN_SECONDS is not numeric', async () => {
      process.env.JWT_EXPIRES_IN_SECONDS = 'one-day';
      prisma.user.findUnique.mockResolvedValue(makeDbUser());
      mockedBcrypt.compare.mockResolvedValue(true as never);

      await service.login({ email: 'jane@secureops.io', password: 'good' });

      expect(jwtService.signAsync.mock.calls[0][1]).toEqual({ expiresIn: 86400 });
    });
  });

  describe('loginAsDemo', () => {
    it.each([
      ['ADMIN', 'demo-admin@secureops.io'],
      ['ANALYST', 'demo-analyst@secureops.io'],
      ['CLIENT_USER', 'demo-client@secureops.io'],
    ] as const)('looks up the %s demo account', async (role, email) => {
      prisma.user.findFirst.mockResolvedValue(makeDbUser({ role, email }));
      await service.loginAsDemo(role);
      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email } });
    });

    it('throws NotFound when the demo user is not seeded', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      await expect(service.loginAsDemo('ADMIN')).rejects.toThrow(NotFoundException);
    });

    it('flags the token payload and the user as demo', async () => {
      prisma.user.findFirst.mockResolvedValue(makeDbUser({ role: 'ADMIN' }));

      const result = await service.loginAsDemo('ADMIN');

      expect(jwtService.signAsync.mock.calls[0][0]).toMatchObject({ isDemo: true });
      expect(result.user.isDemo).toBe(true);
    });
  });

  describe('validateToken', () => {
    it('returns the verified payload', async () => {
      const payload = { sub: 'user-1', email: 'a@b.c', role: 'ADMIN', tenantId: null };
      jwtService.verifyAsync.mockResolvedValue(payload);
      await expect(service.validateToken('tok')).resolves.toBe(payload);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('tok');
    });

    it('maps verification errors to Unauthorized', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
      await expect(service.validateToken('tok')).rejects.toThrow(
        new UnauthorizedException('Invalid or expired token'),
      );
    });
  });
});
