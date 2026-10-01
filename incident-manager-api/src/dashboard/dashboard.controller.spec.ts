import { makeUser } from '../test-utils/fixtures';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: { getStats: jest.Mock; getRecentIncidents: jest.Mock };

  beforeEach(() => {
    service = { getStats: jest.fn(), getRecentIncidents: jest.fn() };
    controller = new DashboardController(service as unknown as DashboardService);
  });

  it.each(['getStats', 'getRecentIncidents'] as const)(
    '%s uses the query tenantId for staff',
    (handler) => {
      controller[handler](makeUser('ADMIN'), 'tenant-9');
      expect(service[handler]).toHaveBeenCalledWith('tenant-9');
    },
  );

  it.each(['getStats', 'getRecentIncidents'] as const)(
    "%s forces a client user to their own tenant",
    (handler) => {
      controller[handler](makeUser('CLIENT_USER', { tenantId: 'tenant-1' }), 'tenant-9');
      expect(service[handler]).toHaveBeenCalledWith('tenant-1');
    },
  );

  // NOTE: a client user without a tenant is unscoped here and sees global stats,
  // unlike resolveScopedTenantId, which throws Forbidden in that case.
  it('leaves a tenant-less client user unscoped', () => {
    controller.getStats(makeUser('CLIENT_USER', { tenantId: null }), 'tenant-9');
    expect(service.getStats).toHaveBeenCalledWith(undefined);
  });
});
