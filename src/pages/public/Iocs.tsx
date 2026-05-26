import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { SectionHeading } from "../../components/public-dashboard/SectionHeading";
import { StatsGrid } from "../../components/public-dashboard/StatsGrid";
import { VisibilityNotice } from "../../components/public-dashboard/VisibilityNotice";
import { IntelCard } from "../../components/public-dashboard/IntelCard";
import { IntelTable } from "../../components/public-dashboard/IntelTable";
import { publicApi, type DashboardStats, type IOC } from "../../services";
import { Button, Card, CardContent, Input, Select } from "../../components/ui";

const iocTypes = ["all", "ip", "url", "hash", "email"] as const;
const publicTlps = new Set(["green", "white"]);

function normalizeIocListResponse(
  payload: Awaited<ReturnType<typeof publicApi.getPublicIocs>>,
) {
  return Array.isArray(payload) ? payload : (payload.items ?? []);
}

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function PublicIocs() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof iocTypes)[number]>("all");
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIocs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await publicApi.getPublicIocs({
        search: query || undefined,
        type: type === "all" ? undefined : type,
      });

      const rows = normalizeIocListResponse(response).filter(
        (ioc) => publicTlps.has(ioc.tlp) && ioc.status === "validated",
      );
      setIocs(rows);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load public IOC records.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [query, type]);

  useEffect(() => {
    void publicApi
      .getDashboardStats()
      .then(setStatsData)
      .catch(() => {
        setStatsData(null);
      });
    void loadIocs();
  }, [loadIocs]);

  const apiStats = useMemo(() => {
    if (!statsData) {
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

  const hasResults = iocs.length > 0;
  const resultSummary = useMemo(
    () =>
      `Showing ${iocs.length} validated public IOC${iocs.length === 1 ? "" : "s"}.`,
    [iocs.length],
  );

  return (
    <PublicShell
      title="Indicators of compromise"
      description="Explore the current public IOC catalog. The dashboard applies the visibility rule up front so only validated green and white records appear here."
      actionHref="/register"
      actionLabel="Submit Registration"
    >
      {apiStats.length > 0 ? <StatsGrid stats={apiStats} /> : null}
      <VisibilityNotice />

      <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px] lg:items-end">
          <Input
            label="Search IOCs"
            placeholder="Search by value, description, or tag"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            label="Type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as (typeof iocTypes)[number])
            }
          >
            {iocTypes.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All types" : value.toUpperCase()}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <SectionHeading
          title="Validated public indicators"
          description={resultSummary}
          action={
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                Back to dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`ioc-skeleton-${index}`}
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
        ) : error ? (
          <Card className="border-[#F0D3D3] bg-[#FFF8F8] dark:border-[#5A2A2A] dark:bg-[#2A1717]">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">
                {error}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadIocs()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : !hasResults ? (
          <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
            <CardContent>
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No public IOCs match your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {iocs.map((ioc) => (
              <IntelCard
                key={ioc.id}
                href={`/iocs/${ioc.id}`}
                title={`${ioc.type.toUpperCase()} | ${ioc.value}`}
                description={ioc.description}
                tags={ioc.tags}
                meta={[
                  `Confidence ${ioc.confidence}%`,
                  `Country ${ioc.country_code || "N/A"} | ASN ${ioc.asn || "N/A"}`,
                  `First seen ${toDisplayDate(ioc.first_seen)}`,
                ]}
              />
            ))}
          </div>
        )}
      </section>

      {!isLoading && !error && hasResults ? (
        <IntelTable
          title="IOC table view"
          rows={iocs.map((ioc) => ({
            id: ioc.id,
            primary: ioc.value,
            secondary: ioc.description,
            status: ioc.status,
            visibility: ioc.tlp,
            href: `/iocs/${ioc.id}`,
          }))}
        />
      ) : null}
    </PublicShell>
  );
}
