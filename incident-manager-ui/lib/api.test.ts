import * as api from './api';

const API_URL = 'http://localhost:3001';

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> } = {}) {
  const res = {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: jest.fn().mockResolvedValue({ ok: true }),
    ...response,
  };
  const fetchMock = jest.fn().mockResolvedValue(res);
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function lastCall(fetchMock: jest.Mock) {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  return { url: url as string, init: init as RequestInit };
}

describe('api client', () => {
  describe('request handling', () => {
    it('sends JSON headers without auth when there is no token', async () => {
      const fetchMock = mockFetch();
      await api.getTickets();
      expect(lastCall(fetchMock).init.headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('adds the bearer token from localStorage', async () => {
      localStorage.setItem('access_token', 'tok-123');
      const fetchMock = mockFetch();
      await api.getTickets();
      expect(lastCall(fetchMock).init.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer tok-123',
      });
    });

    it('returns the parsed JSON body', async () => {
      mockFetch({ json: jest.fn().mockResolvedValue([{ id: 't-1' }]) });
      await expect(api.getTickets()).resolves.toEqual([{ id: 't-1' }]);
    });

    it('returns undefined for 204 responses without parsing', async () => {
      const json = jest.fn();
      mockFetch({ status: 204, json });
      await expect(api.deleteIncident('inc-1')).resolves.toBeUndefined();
      expect(json).not.toHaveBeenCalled();
    });

    it('throws on non-2xx responses', async () => {
      mockFetch({ ok: false, status: 403, statusText: 'Forbidden' });
      await expect(api.getIncident('inc-1')).rejects.toThrow('API error: 403 Forbidden');
    });
  });

  describe('getIncidents', () => {
    it('omits the query string without filters', async () => {
      const fetchMock = mockFetch();
      await api.getIncidents();
      expect(lastCall(fetchMock).url).toBe(`${API_URL}/incidents`);
    });

    it('serialises only the provided filters', async () => {
      const fetchMock = mockFetch();
      await api.getIncidents({ severity: 'HIGH', status: 'OPEN', search: 'phish ing', tenantId: 't-1' });
      expect(lastCall(fetchMock).url).toBe(
        `${API_URL}/incidents?severity=HIGH&status=OPEN&search=phish+ing&tenantId=t-1`,
      );
    });
  });

  it.each([
    ['getDashboardStats', '/dashboard/stats'],
    ['getRecentIncidents', '/dashboard/recent-incidents'],
  ] as const)('%s adds tenantId only when provided', async (fn, path) => {
    const fetchMock = mockFetch();
    await api[fn]();
    expect(lastCall(fetchMock).url).toBe(`${API_URL}${path}`);
    await api[fn]('t-1');
    expect(lastCall(fetchMock).url).toBe(`${API_URL}${path}?tenantId=t-1`);
  });

  describe('endpoints', () => {
    const cases: [string, () => Promise<unknown>, string, string | undefined, unknown][] = [
      ['getIncident', () => api.getIncident('i1'), '/incidents/i1', undefined, undefined],
      ['createIncident', () => api.createIncident({ title: 't' } as never), '/incidents', 'POST', { title: 't' }],
      ['updateIncident', () => api.updateIncident('i1', { title: 't' }), '/incidents/i1', 'PATCH', { title: 't' }],
      ['deleteIncident', () => api.deleteIncident('i1'), '/incidents/i1', 'DELETE', undefined],
      ['assignIncident', () => api.assignIncident('i1', null), '/incidents/i1/assign', 'PATCH', { userId: null }],
      ['updateIncidentTitle', () => api.updateIncidentTitle('i1', 'x'), '/incidents/i1/title', 'PATCH', { title: 'x' }],
      ['updateIncidentDescription', () => api.updateIncidentDescription('i1', 'd'), '/incidents/i1/description', 'PATCH', { description: 'd' }],
      ['updateIncidentStatus', () => api.updateIncidentStatus('i1', 'CLOSED'), '/incidents/i1/status', 'PATCH', { status: 'CLOSED' }],
      ['updateIncidentSeverity', () => api.updateIncidentSeverity('i1', 'LOW'), '/incidents/i1/severity', 'PATCH', { severity: 'LOW' }],
      ['getIncidentActivities', () => api.getIncidentActivities('i1'), '/incidents/i1/activities', undefined, undefined],
      ['addIncidentComment', () => api.addIncidentComment('i1', 'hi'), '/incidents/i1/comments', 'POST', { body: 'hi' }],
      ['getTickets', () => api.getTickets(), '/tickets', undefined, undefined],
      ['createTicket', () => api.createTicket({ title: 't', tenantId: 'x' }), '/tickets', 'POST', { title: 't', tenantId: 'x' }],
      ['getTicket', () => api.getTicket('t1'), '/tickets/t1', undefined, undefined],
      ['updateTicketTitle', () => api.updateTicketTitle('t1', 'x'), '/tickets/t1/title', 'PATCH', { title: 'x' }],
      ['updateTicketDescription', () => api.updateTicketDescription('t1', 'd'), '/tickets/t1/description', 'PATCH', { description: 'd' }],
      ['getTicketActivities', () => api.getTicketActivities('t1'), '/tickets/t1/activities', undefined, undefined],
      ['getAnalysts', () => api.getAnalysts(), '/users/analysts', undefined, undefined],
      ['assignTicket', () => api.assignTicket('t1', 'u1'), '/tickets/t1/assign', 'PATCH', { userId: 'u1' }],
      ['linkIncident', () => api.linkIncident('t1', 'i1'), '/tickets/t1/link-incident', 'PATCH', { incidentId: 'i1' }],
      ['updateTicketStatus', () => api.updateTicketStatus('t1', 'OPEN'), '/tickets/t1/status', 'PATCH', { status: 'OPEN' }],
      ['updateTicketPriority', () => api.updateTicketPriority('t1', 'HIGH'), '/tickets/t1/priority', 'PATCH', { priority: 'HIGH' }],
      ['addTicketComment', () => api.addTicketComment('t1', 'hi'), '/tickets/t1/comments', 'POST', { body: 'hi' }],
      ['getTenants', () => api.getTenants(), '/tenants', undefined, undefined],
      ['getTenantStats', () => api.getTenantStats(), '/tenants/stats', undefined, undefined],
      ['createTenant', () => api.createTenant({ name: 'n', alias: 'a' }), '/tenants', 'POST', { name: 'n', alias: 'a' }],
    ];

    it.each(cases)('%s calls the right endpoint', async (_name, call, path, method, body) => {
      const fetchMock = mockFetch();
      await call();
      const { url, init } = lastCall(fetchMock);
      expect(url).toBe(`${API_URL}${path}`);
      expect(init.method).toBe(method);
      expect(init.body === undefined ? undefined : JSON.parse(init.body as string)).toEqual(body);
    });
  });
});
