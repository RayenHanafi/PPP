import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { RecordDetail } from "../../components/public-dashboard/RecordDetail";
import { Badge, Button, Card, CardContent } from "../../components/ui";
import { publicApi, type ThreatActor } from "../../services";

const publicTlps = new Set(["green", "white"]);
const publicStatuses = new Set(["approved", "validated"]);

export function PublicThreatActorDetails() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<ThreatActor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecord = useCallback(async () => {
    if (!id) {
      setRecord(null);
      setError("Threat actor identifier is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await publicApi.getPublicThreatActor(id);
      const tlp = String(response.tlp || "").toLowerCase();

      if (!publicTlps.has(tlp) || !publicStatuses.has(response.status)) {
        setRecord(null);
        setError("This threat actor profile is not publicly accessible.");
        return;
      }

      setRecord(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load threat actor details.");
      }
      setRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadRecord();
  }, [loadRecord]);

  return (
    <PublicShell
      title="Threat actor profile"
      description="Public actor detail view for validated and visible intelligence only."
      actionHref="/threat-actors"
      actionLabel="Back to actors"
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
            <p className="text-sm text-[#A94444] dark:text-[#FFB4B4]">{error}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => void loadRecord()}>
                Retry
              </Button>
              <Link to="/threat-actors">
                <Button variant="outline" size="sm">
                  Back to actors
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : record ? (
        <RecordDetail
          title={record.name}
          description={record.description}
          badges={[
            { label: `Motivation ${record.motivation}`, tone: "blue" },
            { label: `TLP ${record.tlp}`, tone: "success" },
            { label: "Validated", tone: "success" },
          ]}
          fields={[
            {
              label: "Aliases",
              value: (record.aliases || []).length ? record.aliases.join(", ") : "N/A",
            },
            { label: "Country", value: record.country || "N/A" },
            { label: "Motivation", value: record.motivation },
            { label: "Visibility", value: record.tlp },
            { label: "Status", value: record.status },
          ]}
          backHref="/threat-actors"
          backLabel="Return to actor list"
          asideTitle="Public summary"
          asideBody="Contributor-only notes and raw case details are intentionally omitted from the public experience."
        >
          <div className="flex flex-wrap gap-2">
            {(record.aliases || []).length ? (
              record.aliases.map((alias) => (
                <Badge key={alias} tone="neutral">
                  {alias}
                </Badge>
              ))
            ) : (
              <Badge tone="neutral">No aliases</Badge>
            )}
          </div>
        </RecordDetail>
      ) : (
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardContent className="space-y-3">
            <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
              Threat actor not found.
            </p>
            <Link to="/threat-actors">
              <Button variant="outline" size="sm">
                Back to actors
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </PublicShell>
  );
}
