import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { SectionHeading } from "../../components/public-dashboard/SectionHeading";
import { StatsGrid } from "../../components/public-dashboard/StatsGrid";
import { VisibilityNotice } from "../../components/public-dashboard/VisibilityNotice";
import {
  publicApi,
  type BlockchainRecord,
  type BlockchainVerificationSummary,
  type DashboardStats,
} from "../../services";
import { Badge, Button, Card, CardContent, Input } from "../../components/ui";

type VerificationUiState =
  | "VERIFIED"
  | "FALSE POSITIVE"
  | "NO BLOCKCHAIN RECORD"
  | "LOOKUP FAILED";

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function stateTone(state: VerificationUiState) {
  if (state === "VERIFIED") return "success";
  if (state === "FALSE POSITIVE") return "warning";
  if (state === "NO BLOCKCHAIN RECORD") return "neutral";
  return "danger";
}

export function PublicBlockchain() {
  const [searchParams] = useSearchParams();
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [iocId, setIocId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BlockchainVerificationSummary | null>(null);
  const [history, setHistory] = useState<BlockchainRecord[]>([]);

  useEffect(() => {
    void publicApi.getDashboardStats().then(setStatsData).catch(() => {
      setStatsData(null);
    });
  }, []);

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

  const verificationState = useMemo<VerificationUiState | null>(() => {
    if (error) return "LOOKUP FAILED";
    if (!result) return null;
    if (!result.verified) return "NO BLOCKCHAIN RECORD";
    if (result.current_status === "false_positive") return "FALSE POSITIVE";
    return "VERIFIED";
  }, [error, result]);

  async function runLookup(iocValue: string) {
    const trimmed = iocValue.trim();
    if (!trimmed) {
      setError("Please provide an IOC identifier.");
      setResult(null);
      setHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [summary, records] = await Promise.all([
        publicApi.verifyBlockchainRecord(trimmed),
        publicApi.getBlockchainRecords(trimmed),
      ]);
      setResult(summary);
      setHistory(records);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to verify this IOC on blockchain.");
      }
      setResult(null);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runLookup(iocId);
  }

  useEffect(() => {
    const queryIocId = searchParams.get("iocId");
    if (!queryIocId) return;
    setIocId(queryIocId);
    void runLookup(queryIocId);
  }, [searchParams]);

  return (
    <PublicShell
      title="Blockchain verification"
      description="Validated IOCs can be verified against their on-chain transaction records. This page gives the public an auditable proof trail without exposing hidden intelligence."
      actionHref="/register"
      actionLabel="Become Contributor"
    >
      {apiStats.length > 0 ? <StatsGrid stats={apiStats} /> : null}
      <VisibilityNotice />

      <section className="space-y-4">
        <SectionHeading
          title="Verify an IOC"
          description="Enter an IOC identifier to request its blockchain verification record."
          action={
            <Link to="/iocs">
              <Button variant="outline" size="sm">
                Browse IOCs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        />

        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardContent className="space-y-4">
            <form
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
              onSubmit={handleVerify}
            >
              <div className="flex-1">
                <Input
                  label="IOC ID"
                  placeholder="Enter IOC UUID or record identifier"
                  value={iocId}
                  onChange={(event) => setIocId(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verify
                  </>
                )}
              </Button>
            </form>

            {verificationState ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={stateTone(verificationState)}>{verificationState}</Badge>
                {result?.latest_event_type ? <Badge tone="blue">{result.latest_event_type}</Badge> : null}
              </div>
            ) : null}

            {error ? (
              <p
                className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] px-3 py-2 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {!error && !isLoading && !result ? (
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent>
                  <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                    No verification data yet. Submit an IOC ID to check blockchain proof.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {!error && result ? (
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Latest Status
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {result.current_status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        History Length
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {result.history_length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Block Number
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {result.block_number ?? "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Chain ID
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {result.chain_id ?? "N/A"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Latest Transaction Hash
                      </p>
                      <p className="mt-1 break-all text-sm text-[#100A36] dark:text-white">
                        {result.latest_tx_hash || "N/A"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Content Hash
                      </p>
                      <p className="mt-1 break-all text-sm text-[#100A36] dark:text-white">
                        {result.content_hash}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Latest Recorded At
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {toDisplayDate(result.latest_recorded_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Explorer
                      </p>
                      {result.etherscan_url ? (
                        <a
                          href={result.etherscan_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[#4A3CC9] hover:underline dark:text-[#88ADFF]"
                        >
                          Open on Sepolia Etherscan
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-[#616B82] dark:text-[#A1A5AF]">N/A</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {!error && result ? (
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-3">
                  <p className="text-sm font-semibold text-[#100A36] dark:text-white">
                    Immutable lifecycle timeline
                  </p>
                  {history.length === 0 ? (
                    <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                      No blockchain events for this IOC.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((entry, index) => (
                        <div
                          key={`${entry.tx_hash}-${index}`}
                          className="rounded-lg border border-[#E5E8F2] px-3 py-2 dark:border-[#2A2A3E]"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="blue">{entry.event_type}</Badge>
                            <span className="text-xs text-[#616B82] dark:text-[#A1A5AF]">
                              {toDisplayDate(entry.recorded_at)}
                            </span>
                            <span className="text-xs text-[#616B82] dark:text-[#A1A5AF]">
                              Block {entry.block_number}
                            </span>
                          </div>
                          <p className="mt-1 break-all text-xs text-[#39415C] dark:text-[#B0B5C3]">
                            {entry.tx_hash}
                          </p>
                          {entry.etherscan_url ? (
                            <a
                              href={entry.etherscan_url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#4A3CC9] hover:underline dark:text-[#88ADFF]"
                            >
                              View transaction
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Card className="border-[#E5E8F2] bg-[#FBFCFF] dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#707A91] dark:text-[#A1A5AF]">
              Verification flow
            </p>
            <h3 className="text-lg font-semibold text-[#100A36] dark:text-white">
              How public verification works
            </h3>
            <p className="max-w-2xl text-sm leading-7 text-[#616B82] dark:text-[#A1A5AF]">
              Verified IOCs can be traced on-chain using lifecycle events and transaction hashes.
            </p>
          </div>
          <Button variant="outline" disabled>
            <ShieldCheck className="h-4 w-4" />
            Use assistant widget
          </Button>
        </CardContent>
      </Card>
    </PublicShell>
  );
}
