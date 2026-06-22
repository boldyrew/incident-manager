import {
  PrismaClient,
  IncidentSeverity,
  IncidentSourceType,
  IncidentStatus,
  IncidentType,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

const TENANT_SEEDS = [
  { name: 'Apex Financial Group', alias: 'apex-financial' },
  { name: 'Meridian Healthcare', alias: 'meridian-healthcare' },
  { name: 'GlobalTech Solutions', alias: 'globaltech' },
  { name: 'Nexus Retail Corp', alias: 'nexus-retail' },
] as const;

async function seedTenants(): Promise<Map<string, string>> {
  const byClientName = new Map<string, string>();

  for (const row of TENANT_SEEDS) {
    const tenant = await prisma.tenant.create({
      data: { name: row.name, alias: row.alias },
    });
    byClientName.set(row.name, tenant.id);
  }

  console.log(`Seeded ${TENANT_SEEDS.length} tenants successfully`);

  return byClientName;
}

async function seedIncidents(tenantIdByClient: Map<string, string>) {
  const incidents = [
    {
      code: 'INC-0001',
      title: 'Suspicious Login Attempts from Unknown IP',
      description:
        'Multiple failed login attempts detected from IP 192.168.45.221 targeting admin accounts. Brute force pattern identified with 347 attempts in 10 minutes.',
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      client: 'Apex Financial Group',
      type: IncidentType.UNAUTHORIZED_ACCESS,
      sourceType: IncidentSourceType.MANUAL,
      detectedAt: new Date('2024-01-10T09:23:00Z'),
    },
    {
      code: 'INC-0002',
      title: 'Malware Detected on Endpoint',
      description:
        'Trojan.GenericKD malware detected on workstation WS-042. Endpoint isolated from network pending full investigation and remediation.',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.OPEN,
      client: 'Meridian Healthcare',
      type: IncidentType.MALWARE,
      sourceType: IncidentSourceType.SIEM,
      sourceRef: 'splunk:evt-9f3a2c1b',
      detectedAt: new Date('2024-01-11T11:45:00Z'),
    },
    {
      code: 'INC-0003',
      title: 'Phishing Email Campaign Targeting Finance Department',
      description:
        'Coordinated phishing campaign detected targeting 23 employees in the finance department. 3 users clicked malicious links leading to credential harvesting page.',
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      client: 'GlobalTech Solutions',
      type: IncidentType.PHISHING,
      sourceType: IncidentSourceType.MANUAL,
      detectedAt: new Date('2024-01-12T14:30:00Z'),
    },
    {
      code: 'INC-0004',
      title: 'Unusual Outbound Traffic Detected',
      description:
        'Anomalous outbound traffic to suspicious domain cdn-assets-update[.]net detected. Potential data exfiltration in progress — 2.3GB transferred over 4 hours.',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.OPEN,
      client: 'Nexus Retail Corp',
      type: IncidentType.DATA_BREACH,
      sourceType: IncidentSourceType.MONITORING,
      sourceRef: 'netflow:alert-7742',
      detectedAt: new Date('2024-01-13T08:15:00Z'),
    },
    {
      code: 'INC-0005',
      title: 'Privilege Escalation Detected',
      description:
        'Unauthorized privilege escalation on server SRV-DB-01. User account "jsmith" gained root access exploiting CVE-2023-4911 (Looney Tunables glibc vulnerability).',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.IN_PROGRESS,
      client: 'Apex Financial Group',
      type: IncidentType.UNAUTHORIZED_ACCESS,
      sourceType: IncidentSourceType.SIEM,
      sourceRef: 'crowdstrike:inc-88210',
      detectedAt: new Date('2024-01-14T16:55:00Z'),
    },
    {
      code: 'INC-0006',
      title: 'Ransomware Attempt Blocked',
      description:
        'Endpoint protection successfully blocked ransomware execution attempt. Malicious payload (LockBit variant) quarantined. No encryption occurred.',
      severity: IncidentSeverity.MEDIUM,
      status: IncidentStatus.RESOLVED,
      client: 'Meridian Healthcare',
      type: IncidentType.MALWARE,
      sourceType: IncidentSourceType.MANUAL,
      detectedAt: new Date('2024-01-15T10:20:00Z'),
    },
    {
      code: 'INC-0007',
      title: 'Unauthorized API Access Attempt',
      description:
        'Multiple unauthorized API calls detected using expired JWT tokens. Rate limiting and IP block applied. No data was accessed.',
      severity: IncidentSeverity.LOW,
      status: IncidentStatus.CLOSED,
      client: 'GlobalTech Solutions',
      type: IncidentType.UNAUTHORIZED_ACCESS,
      sourceType: IncidentSourceType.API,
      sourceRef: 'waf:req-block-44129',
      detectedAt: new Date('2024-01-16T13:40:00Z'),
    },
  ];

  const createdIncidents = [];

  for (const incident of incidents) {
    const tenantId = tenantIdByClient.get(incident.client);
    if (!tenantId) {
      throw new Error(`No tenant seed for client "${incident.client}"`);
    }

    const createdIncident = await prisma.incident.create({
      data: {
        code: incident.code,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        client: incident.client,
        tenantId,
        type: incident.type,
        sourceType: incident.sourceType,
        sourceRef: incident.sourceRef,
        detectedAt: incident.detectedAt,
      },
    });
    createdIncidents.push(createdIncident);
  }

  console.log(`Seeded ${incidents.length} incidents successfully`);

  return createdIncidents;
}

async function seedTickets(
  incidentMap: Map<string, { id: string; tenantId: string | null }>,
) {
  const tickets = [
    {
      code: 'TKT-0001',
      title: 'Block Suspicious Source IP',
      description:
        'Add perimeter firewall rule to block source IP 192.168.45.221 and related subnet for brute-force campaign containment.',
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      incidentCode: 'INC-0001',
    },
    {
      code: 'TKT-0002',
      title: 'Reimage Infected Endpoint WS-042',
      description:
        'Perform full disk wipe and controlled reimage of compromised workstation WS-042, then validate endpoint hardening baseline.',
      priority: TicketPriority.CRITICAL,
      status: TicketStatus.OPEN,
      incidentCode: 'INC-0002',
    },
    {
      code: 'TKT-0003',
      title: 'Reset Compromised User Credentials',
      description:
        'Force password reset and revoke active sessions for finance users impacted by phishing credential harvest.',
      priority: TicketPriority.HIGH,
      status: TicketStatus.IN_PROGRESS,
      incidentCode: 'INC-0003',
    },
    {
      code: 'TKT-0004',
      title: 'Review Egress Rules for Exfiltration Channel',
      description:
        'Audit and tighten outbound ACLs and proxy policies to prevent traffic to suspicious domain patterns.',
      priority: TicketPriority.CRITICAL,
      status: TicketStatus.OPEN,
      incidentCode: 'INC-0004',
    },
    {
      code: 'TKT-0005',
      title: 'Patch Affected Linux Hosts',
      description:
        'Apply glibc updates and validate mitigation for CVE-2023-4911 on all production Linux assets.',
      priority: TicketPriority.CRITICAL,
      status: TicketStatus.IN_PROGRESS,
      incidentCode: 'INC-0005',
    },
    {
      code: 'TKT-0006',
      title: 'Validate Ransomware IOC Coverage',
      description:
        'Confirm EDR signatures and SIEM detections include latest LockBit indicators across all client environments.',
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      incidentCode: 'INC-0006',
    },
    {
      code: 'TKT-0007',
      title: 'Harden API Token Rotation Policy',
      description:
        'Enforce stricter JWT expiration and automatic rotation to reduce replay attempts with stale tokens.',
      priority: TicketPriority.LOW,
      status: TicketStatus.CLOSED,
      incidentCode: 'INC-0007',
    },
  ];

  for (const ticket of tickets) {
    const incident = incidentMap.get(ticket.incidentCode);

    if (!incident) {
      throw new Error(`Missing incident mapping for ${ticket.incidentCode}`);
    }

    await prisma.ticket.create({
      data: {
        code: ticket.code,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        incidentId: incident.id,
        tenantId: incident.tenantId,
      },
    });
  }

  console.log(`Seeded ${tickets.length} tickets successfully`);
}

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.tenant.deleteMany();

  const tenantIdByClient = await seedTenants();
  const incidents = await seedIncidents(tenantIdByClient);
  const incidentMap = new Map(
    incidents.map((incident) => [
      incident.code,
      { id: incident.id, tenantId: incident.tenantId },
    ]),
  );

  await seedTickets(incidentMap);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
