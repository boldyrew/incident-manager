import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { makeUser, mockExecutionContext } from '../../test-utils/fixtures';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let authService: { validateToken: jest.Mock };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    authService = { validateToken: jest.fn() };
    guard = new JwtAuthGuard(authService as unknown as AuthService);
  });

  it('rejects a request without an authorization header', async () => {
    const context = mockExecutionContext({ headers: {} });
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Missing bearer token'),
    );
    expect(authService.validateToken).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer scheme', async () => {
    const context = mockExecutionContext({ headers: { authorization: 'Basic abc' } });
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches the token payload to the request', async () => {
    const user = makeUser('ADMIN');
    authService.validateToken.mockResolvedValue(user);
    const request: Record<string, unknown> = { headers: { authorization: 'Bearer token-123' } };

    await expect(guard.canActivate(mockExecutionContext(request))).resolves.toBe(true);
    expect(authService.validateToken).toHaveBeenCalledWith('token-123');
    expect(request.user).toBe(user);
  });

  it('propagates validation errors', async () => {
    authService.validateToken.mockRejectedValue(new UnauthorizedException('Invalid or expired token'));
    const context = mockExecutionContext({ headers: { authorization: 'Bearer bad' } });
    await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
  });
});
