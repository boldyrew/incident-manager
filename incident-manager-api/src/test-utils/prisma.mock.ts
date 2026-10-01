import { PrismaService } from '../prisma/prisma.service';

const modelMethods = [
  'create',
  'findMany',
  'findUnique',
  'findFirst',
  'update',
  'delete',
  'count',
] as const;

type ModelMock = Record<(typeof modelMethods)[number], jest.Mock>;

export type PrismaMock = {
  incident: ModelMock;
  incidentActivity: ModelMock;
  ticket: ModelMock;
  ticketActivity: ModelMock;
  tenant: ModelMock;
  user: ModelMock;
  $queryRaw: jest.Mock;
  $transaction: jest.Mock;
};

function createModelMock(): ModelMock {
  return Object.fromEntries(modelMethods.map((method) => [method, jest.fn()])) as ModelMock;
}

export function createPrismaMock(): PrismaMock {
  return {
    incident: createModelMock(),
    incidentActivity: createModelMock(),
    ticket: createModelMock(),
    ticketActivity: createModelMock(),
    tenant: createModelMock(),
    user: createModelMock(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };
}

export function asPrismaService(mock: PrismaMock): PrismaService {
  return mock as unknown as PrismaService;
}
