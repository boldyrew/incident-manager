import { NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: { register: jest.Mock; login: jest.Mock; loginAsDemo: jest.Mock };
  const originalDemoFlag = process.env.DEMO_MODE_ENABLED;

  beforeEach(() => {
    service = { register: jest.fn(), login: jest.fn(), loginAsDemo: jest.fn() };
    controller = new AuthController(service as unknown as AuthService);
  });

  afterEach(() => {
    if (originalDemoFlag === undefined) delete process.env.DEMO_MODE_ENABLED;
    else process.env.DEMO_MODE_ENABLED = originalDemoFlag;
  });

  it('delegates register and login', () => {
    const registerDto = { email: 'a@b.c', password: 'p', fullName: 'A', role: 'ANALYST' as const };
    const loginDto = { email: 'a@b.c', password: 'p' };
    controller.register(registerDto);
    controller.login(loginDto);
    expect(service.register).toHaveBeenCalledWith(registerDto);
    expect(service.login).toHaveBeenCalledWith(loginDto);
  });

  it.each([undefined, 'false', '1'])('hides demo login when DEMO_MODE_ENABLED=%p', (flag) => {
    if (flag === undefined) delete process.env.DEMO_MODE_ENABLED;
    else process.env.DEMO_MODE_ENABLED = flag;

    expect(() => controller.loginAsDemo({ role: 'ADMIN' })).toThrow(NotFoundException);
    expect(service.loginAsDemo).not.toHaveBeenCalled();
  });

  it('allows demo login when DEMO_MODE_ENABLED=true', () => {
    process.env.DEMO_MODE_ENABLED = 'true';
    controller.loginAsDemo({ role: 'ANALYST' });
    expect(service.loginAsDemo).toHaveBeenCalledWith('ANALYST');
  });
});
