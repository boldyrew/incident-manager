import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { makeUser, mockExecutionContext } from '../../test-utils/fixtures';
import { CurrentUser } from './current-user.decorator';

function getParamFactory() {
  class TestController {
    handler(@CurrentUser() _user: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, TestController, 'handler');
  return args[Object.keys(args)[0]].factory;
}

describe('CurrentUser decorator', () => {
  const factory = getParamFactory();

  it('returns the authenticated user from the request', () => {
    const user = makeUser('ADMIN');
    expect(factory(undefined, mockExecutionContext({ user }))).toBe(user);
  });

  it('throws when used without JwtAuthGuard', () => {
    expect(() => factory(undefined, mockExecutionContext({}))).toThrow(
      'CurrentUser used without JwtAuthGuard',
    );
  });
});
