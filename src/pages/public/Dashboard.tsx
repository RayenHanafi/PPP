import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { SectionHeading } from "../../components/public-dashboard/SectionHeading";
import { StatsGrid } from "../../components/public-dashboard/StatsGrid";
import { IntelCard } from "../../components/public-dashboard/IntelCard";
import { IntelTable } from "../../components/public-dashboard/IntelTable";
import { Badge, Button, Card, CardContent } from "../../components/ui";
import {
  publicApi,
  type DashboardStats,
  type IOC,
  type MalwareSample,
  type ThreatActor,
} from "../../services";

const publicTlps = new Set(["green", "white"]);
const publicStatuses = new Set(["approved", "validated"]);

function normalizeIocListResponse(
  payload: Awaited<ReturnType<typeof publicApi.getPublicIocs>>,
) {
  return Array.isArray(payload) ? payload : payload.items ?? [];
}

function normalizeThreatActorListResponse(
  payload: Awaited<ReturnType<typeof publicApi.getPublicThreatActors>>,
) {
  return Array.isArray(payload) ? payload : payload.items ?? [];
}

function normalizeMalwareListResponse(
  payload: Awaited<ReturnType<typeof publicApi.getPublicMalware>>,
) {
  return Array.isArray(payload) ? payload : payload.items ?? [];
}

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function PublicDashboard() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [latestIocs, setLatestIocs] = useState<IOC[]>([]);
  const [iocsLoading, setIocsLoading] = useState(true);
  const [iocsError, setIocsError] = useState<string | null>(null);

  const [latestThreatActors, setLatestThreatActors] = useState<ThreatActor[]>([]);
  const [threatActorsLoading, setThreatActorsLoading] = useState(true);
  const [threatActorsError, setThreatActorsError] = useState<string | null>(null);

  const [latestMalware, setLatestMalware] = useState<MalwareSample[]>([]);
  const [malwareLoading, setMalwareLoading] = useState(true);
  const [malwareError, setMalwareError] = useState<string | null>(null);
  const [blockchainRows, setBlockchainRows] = useState<
    Array<{
      id: string;
      primary: string;
      secondary: string;
      status: string;
      visibility: string;
      href: string;
    }>
  >([]);
  const [blockchainLoading, setBlockchainLoading] = useState(true);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);

    try {
      const data = await publicApi.getDashboardStats();
      setStatsData(data);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setStatsError(caughtError.message);
      } else {
        setStatsError("Unable to load dashboard statistics.");
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadLatestIocs = useCallback(async () => {
    setIocsLoading(true);
    setIocsError(null);

    try {
      const response = await publicApi.getPublicIocs();
      const rows = normalizeIocListResponse(response)
        .filter((ioc) => publicTlps.has(ioc.tlp) && publicStatuses.has(ioc.status))
        .slice(0, 3);
      setLatestIocs(rows);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setIocsError(caughtError.message);
      } else {
        setIocsError("Unable to load latest public IOCs.");
      }
      setLatestIocs([]);
    } finally {
      setIocsLoading(false);
    }
  }, []);

  const loadLatestThreatActors = useCallback(async () => {
    setThreatActorsLoading(true);
    setThreatActorsError(null);

    try {
      const response = await publicApi.getPublicThreatActors();
      const rows = normalizeThreatActorListResponse(response)
        .filter(
          (actor) => publicTlps.has(actor.tlp) && publicStatuses.has(actor.status),
        )
        .slice(0, 3);
      setLatestThreatActors(rows);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setThreatActorsError(caughtError.message);
      } else {
        setThreatActorsError("Unable to load public threat actors.");
      }
      setLatestThreatActors([]);
    } finally {
      setThreatActorsLoading(false);
    }
  }, []);

  const loadLatestMalware = useCallback(async () => {
    setMalwareLoading(true);
    setMalwareError(null);

    try {
      const response = await publicApi.getPublicMalware();
      const rows = normalizeMalwareListResponse(response)
        .filter(
          (sample) =>
            publicTlps.has(sample.tlp) && publicStatuses.has(sample.status),
        )
        .slice(0, 3);
      setLatestMalware(rows);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setMalwareError(caughtError.message);
      } else {
        setMalwareError("Unable to load public malware samples.");
      }
      setLatestMalware([]);
    } finally {
      setMalwareLoading(false);
    }
  }, []);

  const loadBlockchainRows = useCallback(async () => {
    if (latestIocs.length === 0) {
      setBlockchainRows([]);
      setBlockchainError(null);
      setBlockchainLoading(false);
      return;
    }

    setBlockchainLoading(true);
    setBlockchainError(null);

    const results = await Promise.allSettled(
      latestIocs.map((ioc) => publicApi.verifyBlockchainRecord(ioc.id)),
    );

    const rows = results.flatMap((result, index) => {
      if (result.status !== "fulfilled") {
        return [];
      }

      const record = result.value as unknown as Record<string, unknown>;
      const txHash =
        typeof record.tx_hash === "string" ? record.tx_hash : undefined;

      if (!txHash) {
        return [];
      }

      const ioc = latestIocs[index];
      const eventType =
        typeof record.event_type === "string" ? record.event_type : "verified";
      const isValid = record.is_valid !== false;

      return [
        {
          id: ioc.id,
          primary: txHash,
          secondary: `${eventType} for ${ioc.id}`,
          status: isValid ? "verified" : "invalid",
          visibility: "public",
          href: `/blockchain?iocId=${ioc.id}`,
        },
      ];
    });

    if (rows.length === 0 && results.every((result) => result.status === "rejected")) {
      setBlockchainError("Unable to load blockchain verifications.");
    }

    setBlockchainRows(rows);
    setBlockchainLoading(false);
  }, [latestIocs]);

  useEffect(() => {
    void loadStats();
    void loadLatestIocs();
    void loadLatestThreatActors();
    void loadLatestMalware();
  }, [loadLatestIocs, loadLatestMalware, loadLatestThreatActors, loadStats]);

  useEffect(() => {
    void loadBlockchainRows();
  }, [loadBlockchainRows]);

  const apiStats = useMemo(() => {
    if (!statsData) {
      return [];
    }

    const values = [
      statsData.total_iocs,
      statsData.total_threat_actors,
      statsData.total_malware_samples,
    ];

    if (values.every((value) => value === undefined)) {
      return [];
    }

    const formatNumber = (value: number | undefined) =>
      typeof value === "number" ? value.toLocaleString() : "0";

    return [
      {
        label: "Validated IOCs",
        value: formatNumber(statsData.total_iocs),
        detail: "Only green and white intelligence is public.",
      },
      {
        label: "Active Threat Actors",
        value: formatNumber(statsData.total_threat_actors),
        detail: "Filtered to validated public profiles.",
      },
      {
        label: "Verified Malware Samples",
        value: formatNumber(statsData.total_malware_samples),
        detail: "Hash-backed records with safe visibility.",
      },
      {
        label: "Blockchain Proofs",
        value: formatNumber(statsData.total_blockchain_records),
        detail: "Traceable transactions for validated IOCs.",
      },
    ];
  }, [statsData]);

  return (
    <PublicShell
      title="Public threat intelligence at a glance"
      description="Browse validated and publicly visible intelligence from the platform."
      actionHref="/register"
      actionLabel="Become Contributor"
    >
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`stats-skeleton-${index}`}
              className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]"
            >
              <CardContent className="space-y-3">
                <div className="h-4 w-28 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                <div className="h-8 w-20 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : statsError ? (
        <Card className="border-[#F0D3D3] bg-[#FFF8F8] dark:border-[#5A2A2A] dark:bg-[#2A1717]">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">
              {statsError}
            </p>
            <Button variant="outline" size="sm" onClick={() => void loadStats()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : apiStats.length === 0 ? (
        <Card className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
          <CardContent>
            <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
              No public statistics available yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <StatsGrid stats={apiStats} />
      )}

      <section className="space-y-4">
        <SectionHeading
          title="Latest validated IOCs"
          description="A compact view of public indicators that can be explored in detail or verified against the blockchain ledger."
          action={
            <Link to="/iocs">
              <Button variant="outline" size="sm">
                Browse all IOCs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
        {iocsLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`dashboard-ioc-skeleton-${index}`}
                className="h-full border-[#E5E8F2] dark:border-[#2A2A3E]"
              >
                <CardContent className="space-y-3">
                  <div className="h-6 w-24 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : iocsError ? (
          <Card className="border-[#F0D3D3] bg-[#FFF8F8] dark:border-[#5A2A2A] dark:bg-[#2A1717]">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">
                {iocsError}
              </p>
              <Button variant="outline" size="sm" onClick={() => void loadLatestIocs()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : latestIocs.length === 0 ? (
          <Card className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
            <CardContent>
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No public IOCs available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {latestIocs.map((ioc) => (
              <IntelCard
                key={ioc.id}
                href={`/iocs/${ioc.id}`}
                title={`${ioc.type.toUpperCase()} | ${ioc.value}`}
                description={ioc.description}
                tags={ioc.tags}
                meta={[
                  `Confidence ${ioc.confidence}%`,
                  `First seen ${toDisplayDate(ioc.first_seen)}`,
                  `Country ${ioc.country_code || "N/A"} | ASN ${ioc.asn || "N/A"}`,
                ]}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Threat actors"
          description="Validated public profiles, grouped by motivation and visibility level."
          action={
            <Link to="/threat-actors">
              <Button variant="outline" size="sm">
                Browse threat actors
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
        {threatActorsLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`dashboard-threat-actor-skeleton-${index}`}
                className="h-full border-[#E5E8F2] dark:border-[#2A2A3E]"
              >
                <CardContent className="space-y-3">
                  <div className="h-6 w-24 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : threatActorsError ? (
          <Card className="border-[#F0D3D3] bg-[#FFF8F8] dark:border-[#5A2A2A] dark:bg-[#2A1717]">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">
                {threatActorsError}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadLatestThreatActors()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : latestThreatActors.length === 0 ? (
          <Card className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
            <CardContent>
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No public threat actors available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {latestThreatActors.map((actor) => (
              <Card
                key={actor.id}
                className="border-[#E5E8F2] transition hover:-translate-y-1 dark:border-[#2A2A3E]"
              >
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="blue">Validated</Badge>
                    <Badge tone="neutral">{actor.motivation}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#100A36] dark:text-white">
                      {actor.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#616B82] dark:text-[#A1A5AF]">
                      {actor.description}
                    </p>
                  </div>
                  <p className="text-sm text-[#51607B] dark:text-[#B0B5C3]">
                    Aliases: {actor.aliases.length > 0 ? actor.aliases.join(", ") : "N/A"}
                  </p>
                  <Link
                    to={`/threat-actors/${actor.id}`}
                    className="font-medium text-[#4A3CC9] hover:underline dark:text-[#88ADFF]"
                  >
                    Open profile
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading
          title="Malware samples"
          description="Public malware samples with hashes, families, and capability summaries."
          action={
            <Link to="/malware">
              <Button variant="outline" size="sm">
                Browse malware
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
        {malwareLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`dashboard-malware-skeleton-${index}`}
                className="h-full border-[#E5E8F2] dark:border-[#2A2A3E]"
              >
                <CardContent className="space-y-3">
                  <div className="h-6 w-24 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                  <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : malwareError ? (
          <Card className="border-[#F0D3D3] bg-[#FFF8F8] dark:border-[#5A2A2A] dark:bg-[#2A1717]">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">
                {malwareError}
              </p>
              <Button variant="outline" size="sm" onClick={() => void loadLatestMalware()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : latestMalware.length === 0 ? (
          <Card className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
            <CardContent>
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No public malware samples available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {latestMalware.map((sample) => (
              <Card
                key={sample.id}
                className="border-[#E5E8F2] dark:border-[#2A2A3E]"
              >
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="success">Validated</Badge>
                    <Badge tone="neutral">{sample.family}</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#100A36] dark:text-white">
                      {sample.name}
                    </h3>
                    <p className="text-sm leading-6 text-[#616B82] dark:text-[#A1A5AF]">
                      {sample.description}
                    </p>
                  </div>
                  <p className="text-sm text-[#51607B] dark:text-[#B0B5C3]">
                    {(sample.capabilities || []).join(" | ")}
                  </p>
                  <Link
                    to={`/malware/${sample.id}`}
                    className="font-medium text-[#4A3CC9] hover:underline dark:text-[#88ADFF]"
                  >
                    View sample
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        {blockchainLoading ? (
          <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
            <CardContent className="space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
              <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
            </CardContent>
          </Card>
        ) : blockchainError ? (
          <Card className="border-[#F0D3D3] bg-[#FFF8F8] dark:border-[#5A2A2A] dark:bg-[#2A1717]">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">
                {blockchainError}
              </p>
              <Button variant="outline" size="sm" onClick={() => void loadBlockchainRows()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : blockchainRows.length === 0 ? (
          <Card className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
            <CardContent>
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No public blockchain verifications available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <IntelTable title="Public blockchain verifications" rows={blockchainRows} />
        )}
        <Card className="border-[#E5E8F2] bg-[#FBFCFF] dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
          <CardContent className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#707A91] dark:text-[#A1A5AF]">
              Chat
            </p>
            <h3 className="text-lg font-semibold text-[#100A36] dark:text-white">
              Ask for context
            </h3>
            <p className="text-sm leading-7 text-[#616B82] dark:text-[#A1A5AF]">
              The public chat entry point is available for quick threat-context
              questions using only safe TLP data.
            </p>
            <Link to="/chat">
              <Button>
                <MessageSquareText className="h-4 w-4" />
                Open chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </PublicShell>
  );
}
