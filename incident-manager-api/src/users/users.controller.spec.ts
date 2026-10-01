import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: { findAllAnalysts: jest.Mock };

  beforeEach(async () => {
    service = { findAllAnalysts: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('returns analysts', async () => {
    const analysts = [{ id: 'u-1', email: 'a@b.c', fullName: 'A', role: 'ANALYST' }];
    service.findAllAnalysts.mockResolvedValue(analysts);
    await expect(controller.findAllAnalysts()).resolves.toBe(analysts);
  });
});
