import { UnauthorizedException } from '@nestjs/common';
import { mockExecutionContext } from '../../test-utils/fixtures';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  const originalKey = process.env.INTEGRATION_API_KEY;
  const guard = new ApiKeyGuard();

  afterEach(() => {
    if (originalKey === undefined) delete process.env.INTEGRATION_API_KEY;
    else process.env.INTEGRATION_API_KEY = originalKey;
  });

  it('rejects when the integration key is not configured', () => {
    delete process.env.INTEGRATION_API_KEY;
    expect(() =>
      guard.canActivate(mockExecutionContext({ headers: { 'x-api-key': 'anything' } })),
    ).toThrow(new UnauthorizedException('Integration API key is not configured'));
  });

  it('rejects a missing header', () => {
    process.env.INTEGRATION_API_KEY = 'secret';
    expect(() => guard.canActivate(mockExecutionContext({ headers: {} }))).toThrow(
      'Invalid or missing API key',
    );
  });

  it('rejects a wrong key', () => {
    process.env.INTEGRATION_API_KEY = 'secret';
    expect(() =>
      guard.canActivate(mockExecutionContext({ headers: { 'x-api-key': 'wrong' } })),
    ).toThrow('Invalid or missing API key');
  });

  it('accepts the configured key', () => {
    process.env.INTEGRATION_API_KEY = 'secret';
    expect(guard.canActivate(mockExecutionContext({ headers: { 'x-api-key': 'secret' } }))).toBe(
      true,
    );
  });
});
