import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { makeUser, mockExecutionContext } from '../../test-utils/fixtures';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it.each([[undefined], [[]]])('allows access when no roles are required (%p)', (roles) => {
    reflector.getAllAndOverride.mockReturnValue(roles);
    expect(guard.canActivate(mockExecutionContext({}))).toBe(true);
  });

  it('reads roles from the handler and class metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = mockExecutionContext({});
    guard.canActivate(context);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it('allows a user with a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN', 'ANALYST']);
    expect(guard.canActivate(mockExecutionContext({ user: makeUser('ANALYST') }))).toBe(true);
  });

  it('forbids a user without a required role', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(mockExecutionContext({ user: makeUser('CLIENT_USER') }))).toThrow(
      ForbiddenException,
    );
  });

  it('forbids a request without a user', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    expect(() => guard.canActivate(mockExecutionContext({}))).toThrow('Insufficient permissions');
  });
});
