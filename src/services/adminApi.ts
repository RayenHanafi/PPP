import { get, post } from "./apiClient";
import type {
  DashboardStats,
  IOC,
  MalwareSample,
  Organisation,
  OrganisationListResponse,
  ThreatActor,
} from "./types";

export function getAdminStats(token: string) {
  return get<DashboardStats>("/admin/stats", { token });
}

export function getOrganisations(token: string) {
  return get<OrganisationListResponse>("/admin/organisations", { token });
}

export function approveOrganisation(token: string, organisationId: string) {
  return post<Organisation>(`/admin/approve/${organisationId}`, undefined, {
    token,
  });
}

export function revokeOrganisation(token: string, organisationId: string) {
  return post<Organisation>(`/admin/revoke/${organisationId}`, undefined, {
    token,
  });
}

export function updateOrganisationTrustScore(
  token: string,
  organisationId: string,
  trustScore: number,
) {
  return post<Organisation>(
    `/admin/organisations/${organisationId}/trust-score`,
    { trust_score: trustScore },
    { token },
  );
}

export function getAdminIocs(token: string) {
  return get<IOC[]>("/admin/iocs", { token });
}

export function getAdminMalware(token: string) {
  return get<MalwareSample[]>("/admin/malware", { token });
}

export function getAdminThreatActors(token: string) {
  return get<ThreatActor[]>("/admin/threat-actors", { token });
}

export function getPendingIocs(token: string) {
  return get<IOC[]>("/admin/moderation/iocs", { token });
}

export function approveIoc(token: string, iocId: string) {
  return post<IOC>(`/admin/moderation/iocs/${iocId}/approve`, undefined, { token });
}

export function rejectIoc(token: string, iocId: string) {
  return post<IOC>(`/admin/moderation/iocs/${iocId}/reject`, undefined, { token });
}

export function getPendingMalware(token: string) {
  return get<MalwareSample[]>("/admin/moderation/malware", { token });
}

export function approveMalware(token: string, malwareId: string) {
  return post<MalwareSample>(`/admin/moderation/malware/${malwareId}/approve`, undefined, { token });
}

export function rejectMalware(token: string, malwareId: string) {
  return post<MalwareSample>(`/admin/moderation/malware/${malwareId}/reject`, undefined, { token });
}

export function getPendingThreatActors(token: string) {
  return get<ThreatActor[]>("/admin/moderation/threat-actors", { token });
}

export function approveThreatActor(token: string, actorId: string) {
  return post<ThreatActor>(`/admin/moderation/threat-actors/${actorId}/approve`, undefined, { token });
}

export function rejectThreatActor(token: string, actorId: string) {
  return post<ThreatActor>(`/admin/moderation/threat-actors/${actorId}/reject`, undefined, { token });
}
