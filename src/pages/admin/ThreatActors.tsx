import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui";
import { AdminTopBar } from "../../components/AdminTopBar";
import { adminApi, type ThreatActor } from "../../services";

type ThreatActorStatusFilter = "all" | ThreatActor["status"];
type TlpFilter = "all" | "red" | "amber" | "green" | "white";
type MotivationFilter = "all" | ThreatActor["motivation"];

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
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

function tlpTone(tlp: string) {
  if (tlp === "red") {
    return "danger" as const;
  }
  if (tlp === "amber") {
    return "warning" as const;
  }
  if (tlp === "green") {
    return "success" as const;
  }
  if (tlp === "white") {
    return "neutral" as const;
  }
  return "blue" as const;
}

export function AdminThreatActors() {
  const { auth } = useAuth();
  const [records, setRecords] = useState<ThreatActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ThreatActorStatusFilter>("all");
  const [tlpFilter, setTlpFilter] = useState<TlpFilter>("all");
  const [motivationFilter, setMotivationFilter] = useState<MotivationFilter>("all");
  const [selectedActor, setSelectedActor] = useState<ThreatActor | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingModerationId, setPendingModerationId] = useState<string | null>(null);

  const loadThreatActors = useCallback(async () => {
    if (!auth.token || auth.role !== "admin") {
      return;
    }

    setIsLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await adminApi.getAdminThreatActors(auth.token);
      setRecords(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load global threat actor records.");
      }
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth.role, auth.token]);

  const handleModerationAction = useCallback(
    async (actorId: string, action: "approve" | "reject") => {
      if (!auth.token || auth.role !== "admin") {
        return;
      }

      setActionError(null);
      setSuccessMessage(null);
      setPendingModerationId(actorId);

      try {
        if (action === "approve") {
          await adminApi.approveThreatActor(auth.token, actorId);
          setSuccessMessage("Threat actor approved and trust score updated.");
        } else {
          await adminApi.rejectThreatActor(auth.token, actorId);
          setSuccessMessage("Threat actor rejected and trust score updated.");
        }
        await loadThreatActors();
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.message) {
          setActionError(caughtError.message);
        } else {
          setActionError("Unable to apply moderation action.");
        }
      } finally {
        setPendingModerationId(null);
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

  const organisations = useMemo(() => {
    const map = new Map<string, string>();
    for (const actor of records) {
      map.set(actor.org_id, actor.organisation?.name || actor.org_id);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [records]);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((actor) => {
      if (orgFilter !== "all" && actor.org_id !== orgFilter) {
        return false;
      }
      if (statusFilter !== "all" && actor.status !== statusFilter) {
        return false;
      }
      if (tlpFilter !== "all" && actor.tlp !== tlpFilter) {
        return false;
      }
      if (motivationFilter !== "all" && actor.motivation !== motivationFilter) {
        return false;
      }
      if (!term) {
        return true;
      }

      const haystack = [
        actor.name,
        actor.description,
        actor.country,
        actor.organisation?.name,
        actor.org_id,
        actor.aliases.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [motivationFilter, orgFilter, records, search, statusFilter, tlpFilter]);

  if (!auth.token || auth.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <AdminTopBar />
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Global Threat Actors</CardTitle>
              <CardDescription>
                Supervise all threat actor submissions across organisations.
              </CardDescription>
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Back to admin overview
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <Input
                label="Search"
                placeholder="Name, aliases, org..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <Select
                label="Organisation"
                value={orgFilter}
                onChange={(event) => setOrgFilter(event.target.value)}
              >
                <option value="all">All organisations</option>
                {organisations.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as ThreatActorStatusFilter)
                }
              >
                <option value="all">All statuses</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="validated">validated (legacy)</option>
                <option value="rejected">rejected</option>
                <option value="false_positive">false_positive</option>
              </Select>
              <Select
                label="TLP"
                value={tlpFilter}
                onChange={(event) => setTlpFilter(event.target.value as TlpFilter)}
              >
                <option value="all">All TLP levels</option>
                <option value="red">red</option>
                <option value="amber">amber</option>
                <option value="green">green</option>
                <option value="white">white</option>
              </Select>
              <Select
                label="Motivation"
                value={motivationFilter}
                onChange={(event) =>
                  setMotivationFilter(event.target.value as MotivationFilter)
                }
              >
                <option value="all">All motivations</option>
                <option value="espionage">espionage</option>
                <option value="financial">financial</option>
                <option value="hacktivism">hacktivism</option>
                <option value="sabotage">sabotage</option>
              </Select>
            </div>

            {error ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadThreatActors()}
                  >
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

            {successMessage ? (
              <div className="rounded-lg border border-[#CDEBD9] bg-[#E7F8EF] p-3 text-sm text-[#0F7A43] dark:border-[#1B3A2A] dark:bg-[#1B3A2A] dark:text-[#4EDC7F]">
                {successMessage}
              </div>
            ) : null}

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card
                    key={`admin-threat-actor-row-skeleton-${index}`}
                    className="border-[#E5E8F2] dark:border-[#2A2A3E]"
                  >
                    <CardContent className="py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : visibleRecords.length === 0 ? (
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No threat actor records match these filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Motivation</TableHeaderCell>
                      <TableHeaderCell>Organisation</TableHeaderCell>
                      <TableHeaderCell>TLP</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Submitted</TableHeaderCell>
                      <TableHeaderCell className="text-right">Action</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRecords.map((actor) => (
                      <TableRow key={actor.id}>
                        <TableCell className="font-medium text-[#100A36] dark:text-white">
                          {actor.name}
                        </TableCell>
                        <TableCell>{actor.motivation}</TableCell>
                        <TableCell>{actor.organisation?.name || actor.org_id}</TableCell>
                        <TableCell>
                          <Badge tone={tlpTone(actor.tlp)}>{actor.tlp}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge tone={statusTone(actor.status)}>{actor.status}</Badge>
                        </TableCell>
                        <TableCell>{toDisplayDate(actor.submitted_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {actor.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  disabled={pendingModerationId === actor.id}
                                  onClick={() => void handleModerationAction(actor.id, "approve")}
                                >
                                  {pendingModerationId === actor.id ? "Processing..." : "Approve"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={pendingModerationId === actor.id}
                                  onClick={() => void handleModerationAction(actor.id, "reject")}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedActor(actor)}
                            >
                              View details
                            </Button>
                          </div>
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

      <Modal
        open={Boolean(selectedActor)}
        title="Threat Actor Details"
        onClose={() => setSelectedActor(null)}
      >
        {selectedActor ? (
          <div className="space-y-2 text-sm text-[#24304D] dark:text-[#B0B5C3]">
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Name:</span>{" "}
              {selectedActor.name}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Motivation:</span>{" "}
              {selectedActor.motivation}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Organisation:</span>{" "}
              {selectedActor.organisation?.name || selectedActor.org_id}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Status:</span>{" "}
              {selectedActor.status}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">TLP:</span>{" "}
              {selectedActor.tlp}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Aliases:</span>{" "}
              {selectedActor.aliases.length > 0
                ? selectedActor.aliases.join(", ")
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Description:</span>{" "}
              {selectedActor.description || "N/A"}
            </p>
          </div>
        ) : null}
      </Modal>
    </main>
  );
}

