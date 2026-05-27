import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { Badge, Button, Card, CardContent } from "../../components/ui";
import { RecordDetail } from "../../components/public-dashboard/RecordDetail";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { publicApi, type IOC } from "../../services";

const publicTlps = new Set(["green", "white"]);
const publicStatuses = new Set(["approved", "validated"]);

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export function PublicIocDetails() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<IOC | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadRecord = useCallback(async () => {
    if (!id) {
      setRecord(null);
      setError("IOC identifier is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await publicApi.getPublicIoc(id);

      if (!publicTlps.has(response.tlp) || !publicStatuses.has(response.status)) {
        setRecord(null);
        setError("This IOC is not publicly accessible.");
        return;
      }

      setRecord(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load IOC details.");
      }
      setRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  const blockchainSummary = useMemo(() => {
    const count = record?.blockchain_records?.length ?? 0;
    if (!count) {
      return "No blockchain proof was returned for this IOC.";
    }
    return `${count} blockchain record${count === 1 ? "" : "s"} available for verification.`;
  }, [record?.blockchain_records]);

  const handleCopyIocId = useCallback(async () => {
    if (!record?.id) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(record.id);
      } else {
        throw new Error("Clipboard API unavailable");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [record?.id]);

  return (
    <PublicShell
      title="IOC details"
      description="This record page keeps the same public-only visibility rule and provides a compact detail view for validated indicators."
      actionHref="/iocs"
      actionLabel="Back to IOCs"
    >
      {isLoading ? (
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardContent className="space-y-4">
            <div className="h-6 w-40 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
            <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-[#F0D3D3] bg-[#FFF8F8] dark:border-[#5A2A2A] dark:bg-[#2A1717]">
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">
              {error}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadRecord()}
              >
                Retry
              </Button>
              <Link to="/iocs">
                <Button variant="outline" size="sm">
                  Back to IOCs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : record ? (
        <RecordDetail
          title={`${record.type.toUpperCase()} | ${record.value}`}
          description={record.description}
          badges={[
            { label: `TLP ${record.tlp}`, tone: "success" },
            { label: `Confidence ${record.confidence}%`, tone: "blue" },
            { label: "Validated", tone: "success" },
          ]}
          fields={[
            { label: "Type", value: record.type },
            { label: "Country", value: record.country_code || "N/A" },
            { label: "ASN", value: record.asn || "N/A" },
            { label: "First seen", value: toDisplayDate(record.first_seen) },
            { label: "Last seen", value: toDisplayDate(record.last_seen) },
            { label: "Submitted", value: toDisplayDate(record.submitted_at) },
          ]}
          backHref="/iocs"
          backLabel="Return to IOC list"
          asideTitle="Blockchain"
          asideBody={blockchainSummary}
        >
          <div className="space-y-3">
            <p className="text-sm font-medium text-[#39415C] dark:text-[#B0B5C3]">
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {(record.tags || []).length ? (
                record.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge tone="neutral">No tags</Badge>
              )}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-[#E5E8F2] bg-[#FBFCFF] p-4 dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
              IOC ID
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all rounded-md bg-[#EEF1FA] px-3 py-2 font-mono text-xs text-[#100A36] dark:bg-[#1A1A2E] dark:text-white">
                {record.id}
              </p>
              <Button variant="outline" size="sm" onClick={() => void handleCopyIocId()}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-[#616B82] dark:text-[#A1A5AF]">
              Use this identifier to verify immutable blockchain records.
            </p>
            <Link to={`/blockchain?iocId=${record.id}`}>
              <Button size="sm">Verify on Blockchain</Button>
            </Link>
          </div>
        </RecordDetail>
      ) : (
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardContent className="space-y-3">
            <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
              IOC not found.
            </p>
            <Link to="/iocs">
              <Button variant="outline" size="sm">
                Back to IOCs
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </PublicShell>
  );
}
