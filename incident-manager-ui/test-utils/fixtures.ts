import type { AuthUser, UserRole } from '@/context/auth-context';
import type { Incident } from '@/types/incident';
import type { IncidentActivity } from '@/types/incident-activity';
import type { TicketBase, TicketDetailModel } from '@/types/ticket';
import type { TicketActivity } from '@/types/ticket-activity';
import type { Tenant } from '@/types/tenant';
import type { User } from '@/types/user';

export const TENANT = { id: 'tenant-1', name: 'Acme Corp', alias: 'acme' };

export function makeAuthUser(role: UserRole = 'ANALYST', overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: `${role.toLowerCase()}-id`,
    email: `${role.toLowerCase()}@secureops.io`,
    fullName: 'Jane Analyst',
    role,
    tenantId: role === 'CLIENT_USER' ? TENANT.id : null,
    ...overrides,
  };
}

export function makeAnalyst(overrides: Partial<User> = {}): User {
  return {
    id: 'analyst-1',
    email: 'bob@secureops.io',
    fullName: 'Bob Builder',
    role: 'ANALYST',
    ...overrides,
  };
}

export function makeIncident(overrides: Partial<Incident> = {}): Incident {
  return {
    id: 'incident-1',
    code: 'INC-0001',
    title: 'Suspicious login attempts from unknown IP',
    description: 'Multiple failed logins',
    severity: 'HIGH',
    status: 'OPEN',
    client: TENANT.name,
    detectedAt: '2026-03-15T10:30:00.000Z',
    assignedUser: null,
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
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-15T11:00:00.000Z',
    ...overrides,
  };
}

export function makeTicketBase(overrides: Partial<TicketBase> = {}): TicketBase {
  const { description: _description, ...base } = makeTicket();
  return { ...base, ...overrides };
}

export function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    ...TENANT,
    industry: 'Finance',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    openIncidents: 3,
    criticalIncidents: 1,
    resolvedThisMonth: 5,
    ...overrides,
  };
}

const activityBase = {
  userId: 'analyst-id',
  actor: { id: 'analyst-id', fullName: 'Jane Analyst', email: 'jane@secureops.io' },
  plainData: null,
  createdAt: '2026-03-15T12:00:00.000Z',
  updatedAt: '2026-03-15T12:00:00.000Z',
};

export function makeIncidentActivity<T extends IncidentActivity['type']>(
  type: T,
  metadata: Extract<IncidentActivity, { type: T }>['metadata'],
  overrides: Partial<IncidentActivity> = {},
): IncidentActivity {
  return {
    ...activityBase,
    id: `act-${type}`,
    incidentId: 'incident-1',
    type,
    metadata,
    ...overrides,
  } as IncidentActivity;
}

export function makeTicketActivity<T extends TicketActivity['type']>(
  type: T,
  metadata: Extract<TicketActivity, { type: T }>['metadata'],
  overrides: Partial<TicketActivity> = {},
): TicketActivity {
  return {
    ...activityBase,
    id: `act-${type}`,
    ticketId: 'ticket-1',
    type,
    metadata,
    ...overrides,
  } as TicketActivity;
}
