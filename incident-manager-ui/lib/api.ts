import { Incident, CreateIncidentPayload, UpdateIncidentPayload } from '@/types/incident';
import {
  TicketBase,
  TicketDetailModel,
  TicketPriority,
  TicketStatus,
  CreateTicketPayload,
} from '@/types/ticket';
import type { TicketActivity } from '@/types/ticket-activity';
import { User } from '@/types/user';
import { Tenant, TenantStats, CreateTenantPayload } from '@/types/tenant';
import { DashboardStats, RecentIncident } from '@/types/dashboard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface GetIncidentsParams {
  severity?: string;
  status?: string;
  search?: string;
  tenantId?: string;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function getIncidents(params: GetIncidentsParams = {}): Promise<Incident[]> {
  const q = new URLSearchParams();
  if (params.severity) q.set('severity', params.severity);
  if (params.status) q.set('status', params.status);
  if (params.search) q.set('search', params.search);
  if (params.tenantId) q.set('tenantId', params.tenantId);
  const qs = q.toString();
  return request<Incident[]>(`/incidents${qs ? `?${qs}` : ''}`);
}

export async function getIncident(id: string): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`);
}

export async function createIncident(data: CreateIncidentPayload): Promise<Incident> {
  return request<Incident>('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIncident(id: string, data: UpdateIncidentPayload): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteIncident(id: string): Promise<void> {
  return request<void>(`/incidents/${id}`, { method: 'DELETE' });
}

export async function assignIncident(incidentId: string, userId: string | null): Promise<void> {
  return request<void>(`/incidents/${incidentId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ userId }),
  });
}

export async function getTickets(): Promise<TicketBase[]> {
  return request<TicketBase[]>(`/tickets`);
}

export async function createTicket(data: CreateTicketPayload): Promise<TicketBase> {
  return request<TicketBase>('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getTicket(id: string): Promise<TicketDetailModel> {
  return request<TicketDetailModel>(`/tickets/${id}`);
}

export async function updateTicketTitle(
  ticketId: string,
  title: string,
): Promise<TicketDetailModel> {
  return request<TicketDetailModel>(`/tickets/${ticketId}/title`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  });
}

export async function updateTicketDescription(
  ticketId: string,
  description: string,
): Promise<TicketDetailModel> {
  return request<TicketDetailModel>(`/tickets/${ticketId}/description`, {
    method: 'PATCH',
    body: JSON.stringify({ description }),
  });
}

export async function getTicketActivities(ticketId: string): Promise<TicketActivity[]> {
  return request<TicketActivity[]>(`/tickets/${ticketId}/activities`);
}

export async function getAnalysts(): Promise<User[]> {
  return request<User[]>(`/users/analysts`);
}

export async function assignTicket(ticketId: string, userId: string | null): Promise<void> {
  return request<void>(`/tickets/${ticketId}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ userId }),
  });
}

export async function linkIncident(ticketId: string, incidentId: string): Promise<void> {
  return request<void>(`/tickets/${ticketId}/link-incident`, {
    method: 'PATCH',
    body: JSON.stringify({ incidentId }),
  });
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<void> {
  return request<void>(`/tickets/${ticketId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority,
): Promise<void> {
  return request<void>(`/tickets/${ticketId}/priority`, {
    method: 'PATCH',
    body: JSON.stringify({ priority }),
  });
}

export async function addTicketComment(ticketId: string, body: string): Promise<void> {
  return request<void>(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function getDashboardStats(tenantId?: string): Promise<DashboardStats> {
  const q = new URLSearchParams();
  if (tenantId) q.set('tenantId', tenantId);
  const qs = q.toString();
  return request<DashboardStats>(`/dashboard/stats${qs ? `?${qs}` : ''}`);
}

export async function getRecentIncidents(tenantId?: string): Promise<RecentIncident[]> {
  const q = new URLSearchParams();
  if (tenantId) q.set('tenantId', tenantId);
  const qs = q.toString();
  return request<RecentIncident[]>(`/dashboard/recent-incidents${qs ? `?${qs}` : ''}`);
}

export async function getTenants(): Promise<Tenant[]> {
  return request<Tenant[]>('/tenants');
}

export async function getTenantStats(): Promise<TenantStats> {
  return request<TenantStats>('/tenants/stats');
}

export async function createTenant(data: CreateTenantPayload): Promise<Tenant> {
  return request<Tenant>('/tenants', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}