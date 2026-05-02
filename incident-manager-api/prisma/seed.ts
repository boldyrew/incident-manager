import { PrismaClient, IncidentSeverity, IncidentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.incident.deleteMany();

  const incidents = [
    {
      incidentId: 'INC-0001',
      title: 'Suspicious Login Attempts from Unknown IP',
      description:
        'Multiple failed login attempts detected from IP 192.168.45.221 targeting admin accounts. Brute force pattern identified with 347 attempts in 10 minutes.',
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      client: 'Apex Financial Group',
      assignedTo: 'Sarah Chen',
      detectedAt: new Date('2024-01-15T09:23:00Z'),
    },
    {
      incidentId: 'INC-0002',
      title: 'Malware Detected on Endpoint',
      description:
        'Trojan.GenericKD malware detected on workstation WS-042. Endpoint isolated from network pending full investigation and remediation.',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.OPEN,
      client: 'Meridian Healthcare',
      assignedTo: 'James Walker',
      detectedAt: new Date('2024-01-15T11:45:00Z'),
    },
    {
      incidentId: 'INC-0003',
      title: 'Phishing Email Campaign Targeting Finance Department',
      description:
        'Coordinated phishing campaign detected targeting 23 employees in the finance department. 3 users clicked malicious links leading to credential harvesting page.',
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      client: 'GlobalTech Solutions',
      assignedTo: 'Maria Rodriguez',
      detectedAt: new Date('2024-01-14T14:30:00Z'),
    },
    {
      incidentId: 'INC-0004',
      title: 'Unusual Outbound Traffic Detected',
      description:
        'Anomalous outbound traffic to suspicious domain cdn-assets-update[.]net detected. Potential data exfiltration in progress — 2.3GB transferred over 4 hours.',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.OPEN,
      client: 'Nexus Retail Corp',
      assignedTo: null,
      detectedAt: new Date('2024-01-15T08:15:00Z'),
    },
    {
      incidentId: 'INC-0005',
      title: 'Privilege Escalation Detected',
      description:
        'Unauthorized privilege escalation on server SRV-DB-01. User account "jsmith" gained root access exploiting CVE-2023-4911 (Looney Tunables glibc vulnerability).',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.IN_PROGRESS,
      client: 'Apex Financial Group',
      assignedTo: 'David Kim',
      detectedAt: new Date('2024-01-13T16:55:00Z'),
    },
    {
      incidentId: 'INC-0006',
      title: 'Ransomware Attempt Blocked',
      description:
        'Endpoint protection successfully blocked ransomware execution attempt. Malicious payload (LockBit variant) quarantined. No encryption occurred.',
      severity: IncidentSeverity.MEDIUM,
      status: IncidentStatus.RESOLVED,
      client: 'Meridian Healthcare',
      assignedTo: 'Sarah Chen',
      detectedAt: new Date('2024-01-12T10:20:00Z'),
    },
    {
      incidentId: 'INC-0007',
      title: 'Unauthorized API Access Attempt',
      description:
        'Multiple unauthorized API calls detected using expired JWT tokens. Rate limiting and IP block applied. No data was accessed.',
      severity: IncidentSeverity.LOW,
      status: IncidentStatus.CLOSED,
      client: 'GlobalTech Solutions',
      assignedTo: 'James Walker',
      detectedAt: new Date('2024-01-10T13:40:00Z'),
    },
  ];

  for (const incident of incidents) {
    await prisma.incident.create({ data: incident });
  }

  console.log(`Seeded ${incidents.length} incidents successfully`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
