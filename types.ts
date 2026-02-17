
export enum DiagramType {
  FLOWCHART = 'flowchart',
  ARCHITECTURE = 'architecture',
  SEQUENCE = 'sequence',
  USER_JOURNEY = 'userJourney',
  SERVICE_BLUEPRINT = 'serviceBlueprint'
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  SECURITY_AUDITOR = 'security_auditor',
  SUPPORT_TIER_3 = 'support_t3'
}

export interface UserQuotas {
  diagramsUsed: number;
  uploadsUsed: number;
  revisionsUsed: number;
  exportsUsed: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'apple' | 'microsoft';
  role?: 'user' | 'admin' | AdminRole;
  quotas: UserQuotas;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  beforeValue?: any;
  afterValue?: any;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  approvalRequired: boolean;
}

export interface DiagramVersion {
  id: string;
  code: string;
  timestamp: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  currentCode: string;
  type: DiagramType;
  versions: DiagramVersion[];
  createdAt: string;
}
