import Anthropic from '@anthropic-ai/sdk';
import { GeneratedIncident, IncidentType, Severity, Status } from './types';

const VALID_TYPES = new Set<string>([
  'UNAUTHORIZED_ACCESS',
  'PHISHING',
  'MALWARE',
  'DATA_BREACH',
  'SERVICE_OUTAGE',
  'OTHER',
]);

const SYSTEM_PROMPT = `You are a cybersecurity incident simulation engine.
Your sole job is to output a single valid JSON object describing a realistic security incident.
No markdown fences, no explanation — raw JSON only.

The JSON must match this exact shape:
{
  "title":       string,   // short, specific incident title (max 80 chars)
  "description": string,   // 2-4 sentence technical summary an analyst would write
  "type":        string    // one of: UNAUTHORIZED_ACCESS, PHISHING, MALWARE, DATA_BREACH, SERVICE_OUTAGE, OTHER
}`;

export class AiService {
  private readonly client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  async generateIncident(severity: Severity, status: Status): Promise<GeneratedIncident> {
    const userPrompt = `Generate a ${severity} severity security incident with status "${status}".
Make it realistic for a managed security operations center (SOC).
Vary the attack type — ransomware, phishing, DDoS, insider threat, data exfiltration,
brute-force, supply-chain compromise, credential stuffing, unauthorized access, etc.
Set the "type" field to the most fitting value from: UNAUTHORIZED_ACCESS, PHISHING, MALWARE, DATA_BREACH, SERVICE_OUTAGE, OTHER.`;

    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const cleaned = raw.replace(/```(?:json)?|```/g, '').trim();

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Claude returned invalid JSON: ${cleaned.slice(0, 200)}`);
    }

    for (const field of ['title', 'description', 'type'] as const) {
      if (!parsed[field]) {
        throw new Error(`Claude response missing field: "${field}"`);
      }
    }

    const type = String(parsed.type);
    if (!VALID_TYPES.has(type)) {
      throw new Error(`Claude returned unknown incident type: "${type}"`);
    }

    return {
      title: String(parsed.title),
      description: String(parsed.description),
      type: type as IncidentType,
    };
  }
}
