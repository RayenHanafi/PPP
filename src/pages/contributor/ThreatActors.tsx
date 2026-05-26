import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { contributorApi, type ThreatActor } from "../../services";
import { useAuth } from "../../auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui";
import { ContributorTopBar } from "../../components/ContributorTopBar";

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function canMarkAsFalsePositive(status: ThreatActor["status"]) {
  return !["false_positive", "rejected"].includes(status);
}

function statusTone(status: ThreatActor["status"]) {
  if (status === "approved" || status === "validated") {
    return "success" as const;
  }
  if (status === "pending") {
    return "warning" as const;
  }
  if (status === "rejected" || status === "false_positive") {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function ContributorThreatActors() {
  const { auth } = useAuth();
  const [records, setRecords] = useState<ThreatActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingFalsePositiveId, setPendingFalsePositiveId] = useState<string | null>(null);

  const loadThreatActors = useCallback(async () => {
    if (!auth.token || auth.role !== "contributor") {
      return;
    }

    setIsLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await contributorApi.getContributorThreatActors(auth.token);
      setRecords(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load your threat actor submissions.");
      }
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth.role, auth.token]);

  const handleMarkFalsePositive = useCallback(
    async (threatActorId: string) => {
      if (!auth.token || auth.role !== "contributor") {
        return;
      }

      const confirmed = window.confirm(
        "Mark this threat actor as false positive? This action is traceable and cannot be undone from the portal.",
      );
      if (!confirmed) {
        return;
      }

      setActionError(null);
      setPendingFalsePositiveId(threatActorId);

      try {
        await contributorApi.markContributorThreatActorFalsePositive(
          auth.token,
          threatActorId,
        );
        await loadThreatActors();
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.message) {
          setActionError(caughtError.message);
        } else {
          setActionError("Unable to mark threat actor as false positive.");
        }
      } finally {
        setPendingFalsePositiveId(null);
      }
    },
    [auth.role, auth.token, loadThreatActors],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadThreatActors();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadThreatActors]);

  if (!auth.token || auth.role !== "contributor") {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <ContributorTopBar />
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">My Threat Actors</CardTitle>
              <CardDescription>
                View all threat actor profiles submitted by your organization.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/contributor">
                <Button variant="outline" size="sm">
                  Back to overview
                </Button>
              </Link>
              <Link to="/contributor/threat-actors/new">
                <Button size="sm">Submit Threat Actor</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void loadThreatActors()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            {actionError ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                {actionError}
              </div>
            ) : null}

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`threat-row-skeleton-${index}`} className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : records.length === 0 ? (
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                You have not submitted anything yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Motivation</TableHeaderCell>
                      <TableHeaderCell>TLP</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Submitted</TableHeaderCell>
                      <TableHeaderCell className="text-right">Action</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((actor) => (
                      <TableRow key={actor.id}>
                        <TableCell className="font-medium text-[#100A36] dark:text-white">
                          {actor.name}
                        </TableCell>
                        <TableCell>{actor.motivation}</TableCell>
                        <TableCell>
                          <Badge tone="blue">{actor.tlp}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge tone={statusTone(actor.status)}>{actor.status}</Badge>
                        </TableCell>
                        <TableCell>{toDisplayDate(actor.submitted_at)}</TableCell>
                        <TableCell className="text-right">
                          {canMarkAsFalsePositive(actor.status) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={pendingFalsePositiveId === actor.id}
                              onClick={() => void handleMarkFalsePositive(actor.id)}
                            >
                              {pendingFalsePositiveId === actor.id
                                ? "Marking..."
                                : "Mark false positive"}
                            </Button>
                          ) : (
                            <Badge tone="neutral">Not available</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

