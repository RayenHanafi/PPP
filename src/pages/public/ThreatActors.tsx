import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { SectionHeading } from "../../components/public-dashboard/SectionHeading";
import { StatsGrid } from "../../components/public-dashboard/StatsGrid";
import { VisibilityNotice } from "../../components/public-dashboard/VisibilityNotice";
import {
  publicApi,
  type DashboardStats,
  type ThreatActor,
} from "../../services";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui";

const motivations = [
  "all",
  "espionage",
  "financial",
  "hacktivism",
  "sabotage",
] as const;
const publicTlps = new Set(["green", "white"]);
const publicStatuses = new Set(["approved", "validated"]);

function normalizeThreatActorsResponse(
  payload: Awaited<ReturnType<typeof publicApi.getPublicThreatActors>>,
) {
  return Array.isArray(payload) ? payload : payload.items ?? [];
}

export function PublicThreatActors() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [query, setQuery] = useState("");
  const [motivation, setMotivation] =
    useState<(typeof motivations)[number]>("all");
  const [actors, setActors] = useState<ThreatActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActors = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await publicApi.getPublicThreatActors({
        search: query || undefined,
      });

      const rows = normalizeThreatActorsResponse(response).filter((actor) => {
        const matchesMotivation =
          motivation === "all" || actor.motivation === motivation;
        const matchesVisibility =
          publicTlps.has(actor.tlp) && publicStatuses.has(actor.status);
        return matchesMotivation && matchesVisibility;
      });

      setActors(rows);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load public threat actor records.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [motivation, query]);

  useEffect(() => {
    void publicApi.getDashboardStats().then(setStatsData).catch(() => {
      setStatsData(null);
    });
    void loadActors();
  }, [loadActors]);

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

  const hasResults = actors.length > 0;
  const resultSummary = useMemo(
    () =>
      `Showing ${actors.length} validated public threat actor profile${
        actors.length === 1 ? "" : "s"
      }.`,
    [actors.length],
  );

  return (
    <PublicShell
      title="Threat actors"
      description="Validated actor profiles, motivations, aliases, and public context. The list is intentionally small and safe for public views."
      actionHref="/register"
      actionLabel="Submit Registration"
    >
      {apiStats.length > 0 ? <StatsGrid stats={apiStats} /> : null}
      <VisibilityNotice />

      <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_220px] lg:items-end">
          <Input
            label="Search threat actors"
            placeholder="Search by name, alias, or description"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            label="Motivation"
            value={motivation}
            onChange={(event) =>
              setMotivation(event.target.value as (typeof motivations)[number])
            }
          >
            {motivations.map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All motivations" : value}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <SectionHeading
          title="Validated public actor profiles"
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
          <div className="grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`actors-skeleton-${index}`}
                className="border-[#E5E8F2] dark:border-[#2A2A3E]"
              >
                <CardContent className="space-y-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
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
                onClick={() => void loadActors()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : !hasResults ? (
          <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
            <CardContent>
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No public threat actors match your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {actors.map((actor) => (
              <Card key={actor.id} className="border-[#E5E8F2] dark:border-[#2A2A3E]">
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
                    Aliases: {(actor.aliases || []).length ? actor.aliases.join(", ") : "N/A"}
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

      {!isLoading && !error && hasResults ? (
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardContent className="p-0">
            <div className="border-b border-[#EEF1FA] px-5 py-4 dark:border-[#3A3A4E]">
              <h3 className="text-base font-semibold text-[#100A36] dark:text-white">
                Actor table view
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Aliases</TableHeaderCell>
                    <TableHeaderCell>Motivation</TableHeaderCell>
                    <TableHeaderCell>Visibility</TableHeaderCell>
                    <TableHeaderCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {actors.map((actor) => (
                    <TableRow key={actor.id}>
                      <TableCell className="font-medium text-[#100A36] dark:text-white">
                        {actor.name}
                      </TableCell>
                      <TableCell className="dark:text-[#B0B5C3]">
                        {(actor.aliases || []).length ? actor.aliases.join(", ") : "N/A"}
                      </TableCell>
                      <TableCell className="dark:text-[#B0B5C3]">
                        {actor.motivation}
                      </TableCell>
                      <TableCell>
                        <Badge tone="blue">public</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/threat-actors/${actor.id}`}
                          className="font-medium text-[#4A3CC9] hover:underline dark:text-[#88ADFF]"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </PublicShell>
  );
}
