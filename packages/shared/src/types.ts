import type {
  CampaignStatus,
  JobStatus,
  LeadStatus,
  SenderStatus,
} from "./constants";

export interface DashboardStats {
  activeCampaigns: number;
  scheduledCampaigns: number;
  queuedToday: number;
  sentToday: number;
  replies: number;
  connectedSenders: number;
  totalLeads: number;
  failedToday: number;
}

/** Canonical merge-variable map for template rendering. Standard fields are
 *  first-class keys; everything else from import becomes a custom field. */
export interface LeadVars {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  website?: string | null;
  linkedin?: string | null;
  job_title?: string | null;
  location?: string | null;
  phone?: string | null;
  industry?: string | null;
  [custom: string]: string | null | undefined;
}

export interface TestConnectionResult {
  smtp: { ok: boolean; message: string; latencyMs?: number };
  imap: { ok: boolean; message: string; latencyMs?: number };
}

export interface SenderCsvRow {
  senderName: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecurity: "tls" | "ssl" | "none";
  imapHost?: string;
  imapPort?: number;
  imapUsername?: string;
  imapPassword?: string;
  dailyLimit: number;
  hourlyLimit: number;
  timezone?: string;
  signature?: string;
}

export interface ActivityItem {
  id: string;
  type:
    | "lead_imported"
    | "sender_added"
    | "sender_failed"
    | "template_created"
    | "campaign_created"
    | "campaign_started"
    | "campaign_paused"
    | "campaign_resumed"
    | "campaign_completed"
    | "campaign_archived"
    | "email_sent"
    | "email_failed"
    | "reply_received";
  message: string;
  campaignId?: string | null;
  createdAt: string;
}

export interface CampaignWithStats {
  id: string;
  name: string;
  status: CampaignStatus;
  totalLeads: number;
  sentCount: number;
  failedCount: number;
  repliedCount: number;
  pendingCount: number;
  scheduledAt: string | null;
  createdAt: string;
}

export interface QueueJobPayload {
  jobId: string;
  campaignId: string;
}

export type {
  CampaignStatus,
  JobStatus,
  LeadStatus,
  SenderStatus,
};
