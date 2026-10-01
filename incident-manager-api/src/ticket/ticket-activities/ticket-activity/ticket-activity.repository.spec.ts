import { asPrismaService, createPrismaMock, PrismaMock } from '../../../test-utils/prisma.mock';
import { ticketActivitySelect } from '../ticket-activity.mapper';
import { TicketActivityRepository } from './ticket-activity.repository';

const record = {
  id: 'act-1',
  type: 'COMMENT_ADDED',
  userId: 'u-1',
  ticketId: 't-1',
  plainData: 'Comment added',
  metadata: { body: 'hi' },
  createdAt: new Date(),
  updatedAt: new Date(),
  user: null,
};

describe('TicketActivityRepository', () => {
  let prisma: PrismaMock;
  let repository: TicketActivityRepository;

  beforeEach(() => {
    prisma = createPrismaMock();
    repository = new TicketActivityRepository(asPrismaService(prisma));
  });

  it('creates an activity and parses the result', async () => {
    prisma.ticketActivity.create.mockResolvedValue(record);
    const data = { type: 'COMMENT_ADDED', metadata: { body: 'hi' } } as never;

    const activity = await repository.create(data);

    expect(prisma.ticketActivity.create).toHaveBeenCalledWith({ data, select: ticketActivitySelect });
    expect(activity).toMatchObject({ id: 'act-1', type: 'COMMENT_ADDED' });
  });

  it('lists activities for a ticket, newest first', async () => {
    prisma.ticketActivity.findMany.mockResolvedValue([record]);

    await expect(repository.findByTicketId('t-1')).resolves.toHaveLength(1);
    expect(prisma.ticketActivity.findMany).toHaveBeenCalledWith({
      where: { ticketId: 't-1' },
      orderBy: { createdAt: 'desc' },
      select: ticketActivitySelect,
    });
  });

  describe('createMany', () => {
    it('short-circuits on an empty list', async () => {
      await expect(repository.createMany([])).resolves.toEqual([]);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('creates all activities in one transaction', async () => {
      prisma.ticketActivity.create.mockImplementation((args) => args);
      prisma.$transaction.mockResolvedValue([record, { ...record, id: 'act-2' }]);
      const items = [
        { ticketId: 't-1', type: 'COMMENT_ADDED', metadata: { body: 'a' } },
        { ticketId: 't-1', type: 'COMMENT_ADDED', metadata: { body: 'b' } },
      ] as never[];

      const result = await repository.createMany(items);

      expect(prisma.ticketActivity.create).toHaveBeenCalledTimes(2);
      expect(prisma.$transaction).toHaveBeenCalledWith([
        { data: items[0], select: ticketActivitySelect },
        { data: items[1], select: ticketActivitySelect },
      ]);
      expect(result.map((a) => a.id)).toEqual(['act-1', 'act-2']);
    });
  });
});
