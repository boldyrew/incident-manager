import { IncidentActivityRecorder } from './incident-activity.recorder';
import { IncidentActivityRepository } from './incident-activity/incident-activity.repository';

describe('IncidentActivityRecorder', () => {
  let repository: { create: jest.Mock };
  let recorder: IncidentActivityRecorder;
  const created = { id: 'act-1' };

  beforeEach(() => {
    repository = { create: jest.fn().mockResolvedValue(created) };
    recorder = new IncidentActivityRecorder(repository as unknown as IncidentActivityRepository);
  });

  it('records INCIDENT_OPENED', async () => {
    await expect(recorder.recordIncidentOpened('inc-1', 'u-1', 'HIGH', 'OPEN')).resolves.toBe(
      created,
    );
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        incidentId: 'inc-1',
        userId: 'u-1',
        type: 'INCIDENT_OPENED',
        metadata: { severity: 'HIGH', status: 'OPEN' },
      }),
    );
  });

  it.each([
    ['recordStatusUpdated', 'STATUS_UPDATED', 'OPEN', 'RESOLVED'],
    ['recordSeverityUpdated', 'SEVERITY_UPDATED', 'LOW', 'HIGH'],
    ['recordDescriptionUpdated', 'DESCRIPTION_UPDATED', null, 'new'],
    ['recordTitleUpdated', 'TITLE_UPDATED', 'old', 'new'],
  ] as const)('%s records %s for a change', async (method, type, from, to) => {
    await (recorder[method] as (...args: unknown[]) => Promise<unknown>)('inc-1', 'u-1', from, to);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type, metadata: { from, to } }),
    );
  });

  it.each([
    ['recordStatusUpdated', 'OPEN'],
    ['recordSeverityUpdated', 'HIGH'],
    ['recordDescriptionUpdated', 'same'],
    ['recordTitleUpdated', 'same'],
  ] as const)('%s resolves null when nothing changed', async (method, value) => {
    await expect(
      (recorder[method] as (...args: unknown[]) => Promise<unknown>)('inc-1', 'u-1', value, value),
    ).resolves.toBeNull();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('records ASSIGNEE_UPDATED, including clearing', async () => {
    await recorder.recordAssigneeUpdated('inc-1', 'u-1', null);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ASSIGNEE_UPDATED', metadata: { assignedUserId: null } }),
    );
  });

  it('records COMMENT_ADDED', async () => {
    await recorder.recordCommentAdded('inc-1', undefined, 'note');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'COMMENT_ADDED', userId: null, metadata: { body: 'note' } }),
    );
  });
});
