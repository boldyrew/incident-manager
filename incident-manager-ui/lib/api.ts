import {
  Incident,
  CreateIncidentPayload,
  UpdateIncidentPayload,
} from '@/types/incident';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface GetIncidentsParams {
  severity?: string;
  status?: string;
  search?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function getIncidents(
  params: GetIncidentsParams = {},
): Promise<Incident[]> {
  const q = new URLSearchParams();
  if (params.severity) q.set('severity', params.severity);
  if (params.status) q.set('status', params.status);
  if (params.search) q.set('search', params.search);
  const qs = q.toString();
  return request<Incident[]>(`/incidents${qs ? `?${qs}` : ''}`);
}

export async function getIncident(id: string): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`);
}

export async function createIncident(
  data: CreateIncidentPayload,
): Promise<Incident> {
  return request<Incident>('/incidents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIncident(
  id: string,
  data: UpdateIncidentPayload,
): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteIncident(id: string): Promise<void> {
  return request<void>(`/incidents/${id}`, { method: 'DELETE' });
}
