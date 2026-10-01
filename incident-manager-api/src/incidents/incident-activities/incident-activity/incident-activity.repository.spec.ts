import { asPrismaService, createPrismaMock, PrismaMock } from '../../../test-utils/prisma.mock';
import { incidentActivitySelect } from '../incident-activity.mapper';
import { IncidentActivityRepository } from './incident-activity.repository';

const record = {
  id: 'act-1',
  type: 'COMMENT_ADDED',
  userId: 'u-1',
  incidentId: 'inc-1',
  plainData: 'Comment added',
  metadata: { body: 'hi' },
  createdAt: new Date(),
  updatedAt: new Date(),
  user: null,
};

describe('IncidentActivityRepository', () => {
  let prisma: PrismaMock;
  let repository: IncidentActivityRepository;

  beforeEach(() => {
    prisma = createPrismaMock();
    repository = new IncidentActivityRepository(asPrismaService(prisma));
  });

  it('creates an activity and parses the result', async () => {
    prisma.incidentActivity.create.mockResolvedValue(record);
    const data = { type: 'COMMENT_ADDED', metadata: { body: 'hi' } } as never;

    const activity = await repository.create(data);

    expect(prisma.incidentActivity.create).toHaveBeenCalledWith({
      data,
      select: incidentActivitySelect,
    });
    expect(activity).toMatchObject({ id: 'act-1', type: 'COMMENT_ADDED', metadata: { body: 'hi' } });
  });

  it('lists activities for an incident, newest first', async () => {
    prisma.incidentActivity.findMany.mockResolvedValue([record]);

    const activities = await repository.findByIncidentId('inc-1');

    expect(prisma.incidentActivity.findMany).toHaveBeenCalledWith({
      where: { incidentId: 'inc-1' },
      orderBy: { createdAt: 'desc' },
      select: incidentActivitySelect,
    });
    expect(activities).toHaveLength(1);
  });
});
