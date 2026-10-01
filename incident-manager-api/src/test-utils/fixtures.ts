import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { Incident } from '../incidents/entities/incident.entity';
import { TicketDetailModel } from '../ticket/entities/ticket.entity';

export const TENANT = { id: 'tenant-1', name: 'Acme Corp', alias: 'acme' };

export function makeUser(
  role: UserRole = 'ANALYST',
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser {
  return {
    sub: `${role.toLowerCase()}-id`,
    email: `${role.toLowerCase()}@secureops.io`,
    role,
    tenantId: role === 'CLIENT_USER' ? TENANT.id : null,
    ...overrides,
  };
}

export function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 'incident-1',
    code: 'INC-0001',
    title: 'Suspicious login attempts',
    description: 'Multiple failed logins from unknown IP',
    client: TENANT.name,
    type: 'UNAUTHORIZED_ACCESS',
    sourceType: 'MANUAL',
    sourceRef: null,
    severity: 'HIGH',
    status: 'OPEN',
    assignedUser: null,
    detectedAt: new Date('2026-01-01T10:00:00Z'),
    resolvedAt: null,
    tenant: TENANT,
    ...overrides,
  };
}

export function makeTicket(overrides: Partial<TicketDetailModel> = {}): TicketDetailModel {
  return {
    id: 'ticket-1',
    code: 'TKT-0001',
    title: 'Reset compromised credentials',
    description: 'Rotate passwords for affected accounts',
    priority: 'HIGH',
    status: 'OPEN',
    incidentId: null,
    assignedUser: null,
    incident: null,
    tenant: TENANT,
    createdAt: new Date('2026-01-01T10:00:00Z'),
    updatedAt: new Date('2026-01-01T10:00:00Z'),
    ...overrides,
  };
}

export function mockExecutionContext(request: Record<string, unknown> = {}): ExecutionContext {
  const handler = () => undefined;
  class TestController {}
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
      getNext: () => undefined,
    }),
    getHandler: () => handler,
    getClass: () => TestController,
  } as unknown as ExecutionContext;
}
