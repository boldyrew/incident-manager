import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: { findByRole: jest.Mock };

  beforeEach(async () => {
    usersRepository = { findByRole: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: usersRepository }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('returns analysts from the repository', async () => {
    const analysts = [{ id: 'u-1', email: 'a@b.c', fullName: 'A', role: 'ANALYST' }];
    usersRepository.findByRole.mockResolvedValue(analysts);

    await expect(service.findAllAnalysts()).resolves.toBe(analysts);
    expect(usersRepository.findByRole).toHaveBeenCalledWith('ANALYST');
  });
});
