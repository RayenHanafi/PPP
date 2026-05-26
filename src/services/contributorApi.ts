import { get, post } from "./apiClient";
import type { ContributorMe, IOC, MalwareSample, ThreatActor } from "./types";

export interface IocSubmissionPayload {
  type: "ip" | "url" | "hash" | "email";
  value: string;
  description: string;
  tlp: "red" | "amber" | "green" | "white";
  confidence: number;
  first_seen?: string | null;
  last_seen?: string | null;
  tags: string[];
  source_context?: string | null;
}

export interface MalwareSubmissionPayload {
  name: string;
  family: string;
  description: string;
  hash_md5?: string | null;
  hash_sha256?: string | null;
  capabilities: string[];
  tlp?: "red" | "amber" | "green" | "white";
}

export interface ThreatActorSubmissionPayload {
  name: string;
  aliases: string[];
  motivation: "espionage" | "financial" | "hacktivism" | "sabotage";
  country?: string | null;
  description: string;
  tlp?: "red" | "amber" | "green" | "white";
}

export function getContributorMe(token: string) {
  return get<ContributorMe>("/contributor/me", { token });
}

export function getContributorIocs(token: string) {
  return get<IOC[]>("/contributor/iocs", { token });
}

export function createContributorIoc(token: string, payload: IocSubmissionPayload) {
  return post<IOC>("/contributor/iocs", payload, { token });
}

export function markContributorIocFalsePositive(token: string, iocId: string) {
  return post<IOC>(`/contributor/iocs/${iocId}/false-positive`, undefined, {
    token,
  });
}

export function getContributorMalware(token: string) {
  return get<MalwareSample[]>("/contributor/malware", { token });
}

export function createContributorMalware(
  token: string,
  payload: MalwareSubmissionPayload,
) {
  return post<MalwareSample>("/contributor/malware", payload, { token });
}

export function markContributorMalwareFalsePositive(token: string, malwareId: string) {
  return post<MalwareSample>(
    `/contributor/malware/${malwareId}/false-positive`,
    undefined,
    { token },
  );
}

export function getContributorThreatActors(token: string) {
  return get<ThreatActor[]>("/contributor/threat-actors", { token });
}

export function createContributorThreatActor(
  token: string,
  payload: ThreatActorSubmissionPayload,
) {
  return post<ThreatActor>("/contributor/threat-actors", payload, { token });
}

export function markContributorThreatActorFalsePositive(
  token: string,
  threatActorId: string,
) {
  return post<ThreatActor>(
    `/contributor/threat-actors/${threatActorId}/false-positive`,
    undefined,
    { token },
  );
}
