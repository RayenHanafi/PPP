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

export function getAdminIocs(token: string) {
  return get<IOC[]>("/admin/iocs", { token });
}

export function getAdminMalware(token: string) {
  return get<MalwareSample[]>("/admin/malware", { token });
}

export function getAdminThreatActors(token: string) {
  return get<ThreatActor[]>("/admin/threat-actors", { token });
}
