import {
  PrismaClient,
  IncidentSeverity,
  IncidentStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function seedIncidents() {
  const incidents = [
    {
      code: 'INC-0001',
      title: 'Suspicious Login Attempts from Unknown IP',
      description:
        'Multiple failed login attempts detected from IP 192.168.45.221 targeting admin accounts. Brute force pattern identified with 347 attempts in 10 minutes.',
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      client: 'Apex Financial Group',
      assignedTo: 'Sarah Chen',
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
      assignedTo: 'James Walker',
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
      assignedTo: 'Maria Rodriguez',
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
      assignedTo: null,
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
      assignedTo: 'David Kim',
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
      assignedTo: 'Sarah Chen',
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
      assignedTo: 'James Walker',
      detectedAt: new Date('2024-01-16T13:40:00Z'),
    },
  ];

  const createdIncidents = [];

  for (const incident of incidents) {
    const createdIncident = await prisma.incident.create({ data: {
      code: incident.code,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      client: incident.client,
      assignedTo: incident.assignedTo,
      detectedAt: incident.detectedAt,
    } });
    createdIncidents.push(createdIncident);
  }

  console.log(`Seeded ${incidents.length} incidents successfully`);

  return createdIncidents;
}

async function seedTickets(incidentMap: Map<string, string>) {
  const ticketClient = (prisma as any).ticket;

  const tickets = [
    {
      code: 'TKT-0001',
      title: 'Block Suspicious Source IP',
      description:
        'Add perimeter firewall rule to block source IP 192.168.45.221 and related subnet for brute-force campaign containment.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Network Team',
      incidentCode: 'INC-0001',
    },
    {
      code: 'TKT-0002',
      title: 'Reimage Infected Endpoint WS-042',
      description:
        'Perform full disk wipe and controlled reimage of compromised workstation WS-042, then validate endpoint hardening baseline.',
      priority: 'CRITICAL',
      status: 'OPEN',
      assignedTo: 'Endpoint Team',
      incidentCode: 'INC-0002',
    },
    {
      code: 'TKT-0003',
      title: 'Reset Compromised User Credentials',
      description:
        'Force password reset and revoke active sessions for finance users impacted by phishing credential harvest.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Identity Team',
      incidentCode: 'INC-0003',
    },
    {
      code: 'TKT-0004',
      title: 'Review Egress Rules for Exfiltration Channel',
      description:
        'Audit and tighten outbound ACLs and proxy policies to prevent traffic to suspicious domain patterns.',
      priority: 'CRITICAL',
      status: 'OPEN',
      assignedTo: 'SOC Team',
      incidentCode: 'INC-0004',
    },
    {
      code: 'TKT-0005',
      title: 'Patch Affected Linux Hosts',
      description:
        'Apply glibc updates and validate mitigation for CVE-2023-4911 on all production Linux assets.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      assignedTo: 'Platform Team',
      incidentCode: 'INC-0005',
    },
    {
      code: 'TKT-0006',
      title: 'Validate Ransomware IOC Coverage',
      description:
        'Confirm EDR signatures and SIEM detections include latest LockBit indicators across all client environments.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      assignedTo: 'Threat Intel',
      incidentCode: 'INC-0006',
    },
    {
      code: 'TKT-0007',
      title: 'Harden API Token Rotation Policy',
      description:
        'Enforce stricter JWT expiration and automatic rotation to reduce replay attempts with stale tokens.',
      priority: 'LOW',
      status: 'CLOSED',
      assignedTo: 'AppSec Team',
      incidentCode: 'INC-0007',
    },
  ];

  for (const ticket of tickets) {
    const incidentId = incidentMap.get(ticket.incidentCode);

    if (!incidentId) {
      throw new Error(`Missing incident mapping for ${ticket.incidentCode}`);
    }

    await ticketClient.create({
      data: {
        code: ticket.code,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        incidentId,
      },
    });
  }

  console.log(`Seeded ${tickets.length} tickets successfully`);
}

async function main() {
  const ticketClient = (prisma as any).ticket;

  await ticketClient.deleteMany();
  await prisma.incident.deleteMany();

  const incidents = await seedIncidents();
  const incidentMap = new Map(incidents.map((incident) => [incident.code, incident.id]));

  await seedTickets(incidentMap);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
