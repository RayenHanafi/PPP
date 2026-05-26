export type VisibilityTlp = "green" | "white";
export type ThreatStatus = "validated";

export interface DashboardStat {
  label: string;
  value: string;
  detail: string;
}

export interface IocRecord {
  id: string;
  type: "ip" | "url" | "hash" | "email";
  value: string;
  description: string;
  tlp: VisibilityTlp;
  status: ThreatStatus;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
  tags: string[];
  countryCode: string;
  asn: string;
}

export interface ThreatActorRecord {
  id: string;
  name: string;
  aliases: string[];
  motivation: "espionage" | "financial" | "hacktivism" | "sabotage";
  country: string;
  description: string;
  tlp: VisibilityTlp;
  status: ThreatStatus;
}

export interface MalwareRecord {
  id: string;
  name: string;
  family: "stealer" | "ransomware" | "botnet" | "rat" | "dropper" | "other";
  description: string;
  hashSha256: string;
  capabilities: string[];
  tlp: VisibilityTlp;
  status: ThreatStatus;
}

export interface BlockchainRecord {
  id: string;
  iocId: string;
  txHash: string;
  blockNumber: string;
  eventType: string;
}

export const dashboardStats: DashboardStat[] = [
  {
    label: "Validated IOCs",
    value: "1,284",
    detail: "Only green and white intelligence is public.",
  },
  {
    label: "Active Threat Actors",
    value: "92",
    detail: "Filtered to validated public profiles.",
  },
  {
    label: "Verified Malware Samples",
    value: "147",
    detail: "Hash-backed records with safe visibility.",
  },
  {
    label: "Blockchain Proofs",
    value: "913",
    detail: "Traceable transactions for validated IOCs.",
  },
];

export const iocRecords: IocRecord[] = [
  {
    id: "ioc-1",
    type: "ip",
    value: "185.199.109.153",
    description:
      "Observed in phishing infrastructure associated with credential harvesting.",
    tlp: "white",
    status: "validated",
    confidence: 96,
    firstSeen: "2026-03-18",
    lastSeen: "2026-04-09",
    tags: ["phishing", "infrastructure", "credential-theft"],
    countryCode: "NL",
    asn: "AS14061",
  },
  {
    id: "ioc-2",
    type: "url",
    value: "https://secure-update-check[.]com/login",
    description:
      "Clone login portal used in lure campaigns targeting finance teams.",
    tlp: "green",
    status: "validated",
    confidence: 88,
    firstSeen: "2026-03-25",
    lastSeen: "2026-04-10",
    tags: ["phishing", "web", "credential-harvest"],
    countryCode: "US",
    asn: "AS16509",
  },
  {
    id: "ioc-3",
    type: "hash",
    value: "7d4f6c1e2c9e4b1d5a9f7a8c3b6d1e4f7a0c2e9d1f8a4b5c6d7e8f9a1b2c3d4e",
    description: "Dropper artifact linked to a lateral movement chain.",
    tlp: "green",
    status: "validated",
    confidence: 91,
    firstSeen: "2026-02-28",
    lastSeen: "2026-04-07",
    tags: ["dropper", "lateral-movement", "windows"],
    countryCode: "DE",
    asn: "AS3320",
  },
];

export const threatActorRecords: ThreatActorRecord[] = [
  {
    id: "ta-1",
    name: "Silver Warden",
    aliases: ["SW-12", "Velvet Gate"],
    motivation: "espionage",
    country: "Eastern Europe",
    description:
      "Focuses on long-term access and selective exfiltration from public-sector targets.",
    tlp: "white",
    status: "validated",
  },
  {
    id: "ta-2",
    name: "North Harbor",
    aliases: ["NH-Delta"],
    motivation: "financial",
    country: "West Africa",
    description:
      "Runs phishing kits and identity abuse campaigns aimed at payment systems.",
    tlp: "green",
    status: "validated",
  },
  {
    id: "ta-3",
    name: "Broken Signal",
    aliases: ["BS-7", "Signal Static"],
    motivation: "hacktivism",
    country: "Unknown",
    description:
      "Targets public-facing services with noisy defacement and disruption activity.",
    tlp: "white",
    status: "validated",
  },
];

export const malwareRecords: MalwareRecord[] = [
  {
    id: "mw-1",
    name: "GlassLocker",
    family: "ransomware",
    description: "Encrypts user data while disabling local recovery options.",
    hashSha256:
      "d91c4e9f7d3a8b1c2e4f6a7d8c9b0e1f2a3c4d5e6f7890123456789abcdefabcd",
    capabilities: ["file-encryption", "shadow-copy-deletion", "persistence"],
    tlp: "white",
    status: "validated",
  },
  {
    id: "mw-2",
    name: "CloudSnare",
    family: "stealer",
    description:
      "Harvests browser secrets and session tokens from exposed endpoints.",
    hashSha256:
      "a12b34c56d78e90f1a2b3c4d5e6f78901a2b3c4d5e6f78901a2b3c4d5e6f78901",
    capabilities: ["credential-theft", "browser-data", "clipboard-monitoring"],
    tlp: "green",
    status: "validated",
  },
  {
    id: "mw-3",
    name: "RelayBot",
    family: "botnet",
    description:
      "Maintains command-and-control connectivity for distributed relay activity.",
    hashSha256:
      "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff00",
    capabilities: ["c2-communication", "proxying", "autostart"],
    tlp: "white",
    status: "validated",
  },
];

export const blockchainRecords: BlockchainRecord[] = [
  {
    id: "bc-1",
    iocId: "ioc-1",
    txHash:
      "0x8c1f7fd21a93a7b38d0f7e2c5f4e1c9a3d4b5f60718293ac4ef0b1c2d3e4f506",
    blockNumber: "#19,184,220",
    eventType: "IOC verified",
  },
  {
    id: "bc-2",
    iocId: "ioc-2",
    txHash:
      "0xa3c5d7e9f1b2c4d6e8f0a1b3c5d7e9f1023456789abcdef0123456789abcdef0",
    blockNumber: "#19,184,442",
    eventType: "IOC verified",
  },
  {
    id: "bc-3",
    iocId: "ioc-3",
    txHash:
      "0x19f0e3d7c5b1a8976543210fedcba9876543210fedcba9876543210fedcba987",
    blockNumber: "#19,184,511",
    eventType: "IOC verified",
  },
];

export const allowedPublicTlps: VisibilityTlp[] = ["green", "white"];

export function isPublicRecord(record: { tlp: string; status: string }) {
  return (
    allowedPublicTlps.includes(record.tlp as VisibilityTlp) &&
    record.status === "validated"
  );
}
