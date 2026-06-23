import { AiService } from './ai.service';
import { LambdaEvent, Severity, Status } from './types';

const SEVERITY_WEIGHTS: { value: Severity; weight: number }[] = [
  { value: 'LOW', weight: 35 },
  { value: 'MEDIUM', weight: 35 },
  { value: 'HIGH', weight: 20 },
  { value: 'CRITICAL', weight: 10 },
];

const INITIAL_STATUSES: Status[] = ['OPEN', 'IN_PROGRESS'];

function weightedRandom<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

const aiService = new AiService();

export async function handler(event: LambdaEvent = {}): Promise<{ code: string }> {
  const severity: Severity = event.severity ?? weightedRandom(SEVERITY_WEIGHTS);
  const status: Status =
    event.status ?? INITIAL_STATUSES[Math.floor(Math.random() * INITIAL_STATUSES.length)];

  // Step 2 — generate incident via Claude
  let incident: Awaited<ReturnType<typeof aiService.generateIncident>>;
  try {
    incident = await aiService.generateIncident(severity, status);
  } catch (err) {
    const msg = `[SIMULATOR] ERROR at step 2: ${(err as Error).message}`;
    console.error(msg);
    throw new Error(msg);
  }

  // Step 3 — post to backend integration endpoint
  const backendUrl = process.env.BACKEND_URL;
  const apiKey = process.env.INTEGRATION_API_KEY;
  const tenantId = process.env.TENANT_ID;

  if (!backendUrl || !apiKey || !tenantId) {
    const msg = '[SIMULATOR] ERROR at step 3: Missing required env vars (BACKEND_URL, INTEGRATION_API_KEY, TENANT_ID)';
    console.error(msg);
    throw new Error(msg);
  }

  const payload = {
    title: incident.title,
    description: incident.description,
    type: incident.type,
    severity,
    status,
    tenantId,
  };

  let createdIncident: { code: string };
  try {
    const res = await fetch(`${backendUrl}/integrations/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`POST /integrations/incidents failed: ${res.status} ${body}`);
    }

    createdIncident = (await res.json()) as { code: string };
  } catch (err) {
    const msg = `[SIMULATOR] ERROR at step 3: ${(err as Error).message}`;
    console.error(msg);
    throw new Error(msg);
  }

  // Step 4 — log success
  const code = createdIncident.code ?? 'UNKNOWN';
  console.log(`[SIMULATOR] Incident created: ${code} | ${severity} | ${status} | "${incident.title}"`);

  return { code };
}
