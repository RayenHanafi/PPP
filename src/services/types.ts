export type AuthRole = "admin" | "contributor" | null;

export interface AuthUser {
  id?: string;
  email?: string;
  org_id?: string;
  organisation_name?: string;
}

export interface AuthState {
  token: string | null;
  role: AuthRole;
  mustChangePassword?: boolean;
  user?: AuthUser;
}

export interface Organisation {
  id: string;
  name: string;
  siret: string;
  email: string;
  website?: string | null;
  description?: string | null;
  country?: string | null;
  trust_score: number;
  status: "pending" | "approved" | "revoked";
  created_at: string;
}

export interface RegisterOrganisationPayload {
  name: string;
  siret: string;
  email: string;
  website?: string | null;
  description?: string | null;
  country?: string | null;
}

export interface ContributorMe {
  id: string;
  email: string;
  org_id: string;
  organisation?: Organisation;
  must_change_password: boolean;
}

export type TlpLevel = "red" | "amber" | "green" | "white";

export type IocStatus =
  | "approved"
  | "validated"
  | "pending"
  | "rejected"
  | "revoked"
  | "false_positive"
  | "deprecated";

export interface BlockchainRecord {
  id?: string;
  ioc_id?: string;
  tx_hash: string;
  block_number: number;
  event_type?: "IOC_APPROVED" | "IOC_FALSE_POSITIVE" | string;
  recorded_at: string;
  etherscan_url?: string | null;
  chain_id?: number | null;
  contract_address?: string | null;
  block_hash?: string | null;
  log_index?: number | null;
}

export interface BlockchainVerificationSummary {
  verified: boolean;
  current_status: "approved" | "false_positive" | "no_blockchain_record";
  latest_tx_hash: string | null;
  block_number: number | null;
  chain_id: number | null;
  contract_address: string | null;
  etherscan_url: string | null;
  latest_recorded_at: string | null;
  latest_event_type: "IOC_APPROVED" | "IOC_FALSE_POSITIVE" | string | null;
  content_hash: string;
  history_length: number;
  is_valid: boolean;
}

export interface IOC {
  id: string;
  type: "ip" | "url" | "hash" | "email";
  value: string;
  description: string;
  org_id: string;
  tlp: TlpLevel;
  confidence: number;
  first_seen?: string | null;
  last_seen?: string | null;
  tags: string[];
  source_context?: string | null;
  status: IocStatus;
  submitted_at: string;
  country_code?: string | null;
  asn?: string | null;
  abuse_score?: number | null;
  organisation?: Organisation;
  blockchain_records?: BlockchainRecord[];
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  motivation: "espionage" | "financial" | "hacktivism" | "sabotage";
  country?: string | null;
  description: string;
  org_id: string;
  tlp: TlpLevel | string;
  status: "approved" | "validated" | "pending" | "rejected" | "false_positive";
  submitted_at: string;
  organisation?: Organisation;
}

export interface MalwareSample {
  id: string;
  name: string;
  family: "stealer" | "ransomware" | "botnet" | "rat" | "dropper" | "other" | string;
  description: string;
  hash_md5?: string | null;
  hash_sha256?: string | null;
  capabilities: string[];
  org_id: string;
  tlp: TlpLevel | string;
  status: "approved" | "validated" | "pending" | "rejected" | "false_positive";
  submitted_at: string;
  organisation?: Organisation;
}

export interface PaginatedResponse<T> {
  total?: number;
  items?: T[];
}

export interface DashboardStats {
  total_iocs?: number;
  total_threat_actors?: number;
  total_malware_samples?: number;
  total_blockchain_records?: number;
  pending_iocs?: number;
  pending_threat_actors?: number;
  pending_malware_samples?: number;
  pending_submissions?: number;
  by_type?: Record<string, number>;
  by_tlp?: Record<string, number>;
  recent_iocs?: IOC[];
}

export interface OrganisationListResponse {
  total: number;
  items: Organisation[];
}

export interface ChatResponse {
  response: string;
  answer?: string;
  sources?: unknown[];
  confidence?: string;
}
