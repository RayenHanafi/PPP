import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { SectionHeading } from "../../components/public-dashboard/SectionHeading";
import { StatsGrid } from "../../components/public-dashboard/StatsGrid";
import { VisibilityNotice } from "../../components/public-dashboard/VisibilityNotice";
import {
  publicApi,
  type BlockchainRecord,
  type DashboardStats,
} from "../../services";
import { Badge, Button, Card, CardContent, Input } from "../../components/ui";

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function PublicBlockchain() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [iocId, setIocId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BlockchainRecord | null>(null);

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

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = iocId.trim();

    if (!trimmed) {
      setError("Please provide an IOC identifier.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await publicApi.verifyBlockchainRecord(trimmed);
      setResult(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to verify this IOC on blockchain.");
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

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
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="success">verified</Badge>
                    <Badge tone="blue">{result.event_type || "IOCRegistered"}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        IOC ID
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {result.ioc_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Block Number
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {result.block_number}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Transaction Hash
                      </p>
                      <p className="mt-1 break-all text-sm text-[#100A36] dark:text-white">
                        {result.tx_hash}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Recorded At
                      </p>
                      <p className="mt-1 text-sm text-[#100A36] dark:text-white">
                        {toDisplayDate(result.recorded_at)}
                      </p>
                    </div>
                  </div>
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
              Verified IOCs can be traced on-chain using a transaction hash and
              block number. The public interface only surfaces safe records.
            </p>
          </div>
          <Link to="/chat">
            <Button>
              <ShieldCheck className="h-4 w-4" />
              Ask for context
            </Button>
          </Link>
        </CardContent>
      </Card>
    </PublicShell>
  );
}
