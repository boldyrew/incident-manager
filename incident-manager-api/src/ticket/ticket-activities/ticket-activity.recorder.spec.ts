import { TicketActivityRecorder } from './ticket-activity.recorder';
import { TicketActivityRepository } from './ticket-activity/ticket-activity.repository';

describe('TicketActivityRecorder', () => {
  let repository: { create: jest.Mock };
  let recorder: TicketActivityRecorder;
  const created = { id: 'act-1' };

  beforeEach(() => {
    repository = { create: jest.fn().mockResolvedValue(created) };
    recorder = new TicketActivityRecorder(repository as unknown as TicketActivityRepository);
  });

  it('records TICKET_OPENED', async () => {
    await expect(recorder.recordTicketOpened('t-1', 'u-1', 'HIGH', 'OPEN')).resolves.toBe(created);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: 't-1',
        userId: 'u-1',
        type: 'TICKET_OPENED',
        metadata: { priority: 'HIGH', status: 'OPEN' },
      }),
    );
  });

  it.each([
    ['recordStatusUpdated', 'STATUS_UPDATED', 'OPEN', 'CLOSED'],
    ['recordPriorityUpdated', 'PRIORITY_UPDATED', 'LOW', 'CRITICAL'],
    ['recordDescriptionUpdated', 'DESCRIPTION_UPDATED', 'old', null],
    ['recordTitleUpdated', 'TITLE_UPDATED', 'old', 'new'],
  ] as const)('%s records %s for a change', async (method, type, from, to) => {
    await (recorder[method] as (...args: unknown[]) => Promise<unknown>)('t-1', 'u-1', from, to);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type, metadata: { from, to } }),
    );
  });

  it.each([
    ['recordStatusUpdated', 'OPEN'],
    ['recordPriorityUpdated', 'LOW'],
    ['recordDescriptionUpdated', null],
    ['recordTitleUpdated', 'same'],
  ] as const)('%s resolves null when nothing changed', async (method, value) => {
    await expect(
      (recorder[method] as (...args: unknown[]) => Promise<unknown>)('t-1', 'u-1', value, value),
    ).resolves.toBeNull();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('records ASSIGNEE_UPDATED', async () => {
    await recorder.recordAssigneeUpdated('t-1', 'u-1', 'u-2');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ASSIGNEE_UPDATED', metadata: { assignedUserId: 'u-2' } }),
    );
  });

  it('records INCIDENT_LINKED', async () => {
    await recorder.recordIncidentLinked('t-1', 'u-1', 'inc-1');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'INCIDENT_LINKED', metadata: { incidentId: 'inc-1' } }),
    );
  });

  it('records COMMENT_ADDED', async () => {
    await recorder.recordCommentAdded('t-1', 'u-1', 'note');
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'COMMENT_ADDED', metadata: { body: 'note' } }),
    );
  });
});
