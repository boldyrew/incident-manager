import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';

const reflector = new Reflector();

export function rolesOf(controller: { prototype: object }, handler: string): string[] | undefined {
  return reflector.get(ROLES_KEY, controller.prototype[handler]);
}
