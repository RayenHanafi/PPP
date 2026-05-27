import { get, post } from "./apiClient";
import type {
  BlockchainRecord,
  BlockchainVerificationSummary,
  ChatResponse,
  DashboardStats,
  IOC,
  MalwareSample,
  PaginatedResponse,
  RegisterOrganisationPayload,
  ThreatActor,
} from "./types";

export interface PublicListParams {
  search?: string;
  type?: string;
  tlp?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ChatPayload {
  message: string;
  context_type: "public" | "contributor" | "admin";
  ioc_id?: string;
}

function toQueryString(params?: PublicListParams) {
  if (!params) {
    return "";
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function getDashboardStats() {
  return get<DashboardStats>("/dashboard/stats");
}

export function getPublicIocs(params?: PublicListParams) {
  return get<PaginatedResponse<IOC> | IOC[]>(`/iocs${toQueryString(params)}`);
}

export function getPublicIoc(id: string) {
  return get<IOC>(`/iocs/${id}`);
}

export function getPublicThreatActors(params?: PublicListParams) {
  return get<PaginatedResponse<ThreatActor> | ThreatActor[]>(
    `/threat-actors${toQueryString(params)}`,
  );
}

export function getPublicThreatActor(id: string) {
  return get<ThreatActor>(`/threat-actors/${id}`);
}

export function getPublicMalware(params?: PublicListParams) {
  return get<PaginatedResponse<MalwareSample> | MalwareSample[]>(
    `/malware${toQueryString(params)}`,
  );
}

export function getPublicMalwareSample(id: string) {
  return get<MalwareSample>(`/malware/${id}`);
}

export function registerOrganisation(payload: RegisterOrganisationPayload) {
  return post<unknown>("/register", payload);
}

export function verifyBlockchainRecord(iocId: string) {
  return get<BlockchainVerificationSummary>(`/blockchain/verify/${iocId}`);
}

export function getBlockchainRecords(iocId: string) {
  return get<BlockchainRecord[]>(`/blockchain/records/${iocId}`);
}

export function sendChatMessage(payload: ChatPayload) {
  return post<ChatResponse>("/chat", payload);
}
