import { HealthController } from './health.controller';

describe('HealthController', () => {
  const controller = new HealthController();

  beforeEach(() => jest.useFakeTimers().setSystemTime(new Date('2026-03-15T12:00:00.000Z')));
  afterEach(() => jest.useRealTimers());

  it.each(['check', 'checkHealth'] as const)('%s returns an ok payload', (handler) => {
    expect(controller[handler]()).toEqual({
      status: 'ok',
      uptime: expect.any(Number),
      timestamp: '2026-03-15T12:00:00.000Z',
    });
  });
});
