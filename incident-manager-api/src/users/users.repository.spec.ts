import { NotFoundException } from '@nestjs/common';
import { asPrismaService, createPrismaMock, PrismaMock } from '../test-utils/prisma.mock';
import { UsersRepository } from './users.repository';

const dbUser = {
  id: 'u-1',
  email: 'jane@secureops.io',
  fullName: 'Jane Analyst',
  role: 'ANALYST',
  tenantId: null,
  passwordHash: 'secret-hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersRepository', () => {
  let prisma: PrismaMock;
  let repository: UsersRepository;

  beforeEach(() => {
    prisma = createPrismaMock();
    repository = new UsersRepository(asPrismaService(prisma));
  });

  it('findByRole filters by role and hides sensitive fields', async () => {
    prisma.user.findMany.mockResolvedValue([dbUser]);

    await expect(repository.findByRole('ANALYST')).resolves.toEqual([
      { id: 'u-1', email: 'jane@secureops.io', fullName: 'Jane Analyst', role: 'ANALYST' },
    ]);
    expect(prisma.user.findMany).toHaveBeenCalledWith({ where: { role: 'ANALYST' } });
  });

  it('findById returns the mapped user', async () => {
    prisma.user.findUnique.mockResolvedValue(dbUser);
    const user = await repository.findById('u-1');
    expect(user).not.toHaveProperty('passwordHash');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' } });
  });

  it('findById throws NotFound for an unknown user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(repository.findById('missing')).rejects.toThrow(
      new NotFoundException('User missing not found'),
    );
  });
});
