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
import { adminApi, type IOC } from "../../services";

type IocStatusFilter = "all" | IOC["status"];
type IocTypeFilter = "all" | IOC["type"];
type TlpFilter = "all" | "red" | "amber" | "green" | "white";

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function statusTone(status: IOC["status"]) {
  if (status === "approved" || status === "validated") {
    return "success" as const;
  }
  if (status === "pending") {
    return "warning" as const;
  }
  if (status === "rejected" || status === "revoked" || status === "false_positive") {
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

export function AdminIocs() {
  const { auth } = useAuth();
  const [records, setRecords] = useState<IOC[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<IocStatusFilter>("all");
  const [tlpFilter, setTlpFilter] = useState<TlpFilter>("all");
  const [typeFilter, setTypeFilter] = useState<IocTypeFilter>("all");
  const [selectedIoc, setSelectedIoc] = useState<IOC | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pendingModerationId, setPendingModerationId] = useState<string | null>(null);

  const loadIocs = useCallback(async () => {
    if (!auth.token || auth.role !== "admin") {
      return;
    }

    setIsLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await adminApi.getAdminIocs(auth.token);
      setRecords(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load global IOC records.");
      }
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth.role, auth.token]);

  const handleModerationAction = useCallback(
    async (iocId: string, action: "approve" | "reject") => {
      if (!auth.token || auth.role !== "admin") {
        return;
      }

      setActionError(null);
      setSuccessMessage(null);
      setPendingModerationId(iocId);

      try {
        if (action === "approve") {
          await adminApi.approveIoc(auth.token, iocId);
          setSuccessMessage("IOC approved and trust score updated.");
        } else {
          await adminApi.rejectIoc(auth.token, iocId);
          setSuccessMessage("IOC rejected and trust score updated.");
        }
        await loadIocs();
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
    [auth.role, auth.token, loadIocs],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadIocs();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadIocs]);

  const organisations = useMemo(() => {
    const map = new Map<string, string>();
    for (const ioc of records) {
      map.set(ioc.org_id, ioc.organisation?.name || ioc.org_id);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [records]);

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((ioc) => {
      if (orgFilter !== "all" && ioc.org_id !== orgFilter) {
        return false;
      }
      if (statusFilter !== "all" && ioc.status !== statusFilter) {
        return false;
      }
      if (tlpFilter !== "all" && ioc.tlp !== tlpFilter) {
        return false;
      }
      if (typeFilter !== "all" && ioc.type !== typeFilter) {
        return false;
      }
      if (!term) {
        return true;
      }

      const haystack = [
        ioc.value,
        ioc.type,
        ioc.description,
        ioc.organisation?.name,
        ioc.org_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [orgFilter, records, search, statusFilter, tlpFilter, typeFilter]);

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
              <CardTitle className="text-xl">Global IOCs</CardTitle>
              <CardDescription>
                Supervise all IOC submissions across organisations.
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
                placeholder="Value, type, org..."
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
                onChange={(event) => setStatusFilter(event.target.value as IocStatusFilter)}
              >
                <option value="all">All statuses</option>
                <option value="pending">pending</option>
                <option value="approved">approved</option>
                <option value="validated">validated (legacy)</option>
                <option value="rejected">rejected</option>
                <option value="revoked">revoked</option>
                <option value="false_positive">false_positive</option>
                <option value="deprecated">deprecated</option>
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
                label="Type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as IocTypeFilter)}
              >
                <option value="all">All types</option>
                <option value="ip">ip</option>
                <option value="url">url</option>
                <option value="hash">hash</option>
                <option value="email">email</option>
              </Select>
            </div>

            {error ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void loadIocs()}>
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
                  <Card key={`admin-ioc-row-skeleton-${index}`} className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : visibleRecords.length === 0 ? (
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No IOC records match these filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Value</TableHeaderCell>
                      <TableHeaderCell>Type</TableHeaderCell>
                      <TableHeaderCell>Organisation</TableHeaderCell>
                      <TableHeaderCell>TLP</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Submitted</TableHeaderCell>
                      <TableHeaderCell className="text-right">Action</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRecords.map((ioc) => (
                      <TableRow key={ioc.id}>
                        <TableCell className="max-w-[220px] break-all font-medium text-[#100A36] dark:text-white">
                          {ioc.value}
                        </TableCell>
                        <TableCell>{ioc.type.toUpperCase()}</TableCell>
                        <TableCell>{ioc.organisation?.name || ioc.org_id}</TableCell>
                        <TableCell>
                          <Badge tone={tlpTone(ioc.tlp)}>{ioc.tlp}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge tone={statusTone(ioc.status)}>{ioc.status}</Badge>
                        </TableCell>
                        <TableCell>{toDisplayDate(ioc.submitted_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {ioc.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  disabled={pendingModerationId === ioc.id}
                                  onClick={() => void handleModerationAction(ioc.id, "approve")}
                                >
                                  {pendingModerationId === ioc.id ? "Processing..." : "Approve"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={pendingModerationId === ioc.id}
                                  onClick={() => void handleModerationAction(ioc.id, "reject")}
                                >
                                  Reject
                                </Button>
                              </>
                            ) : null}
                            <Button variant="outline" size="sm" onClick={() => setSelectedIoc(ioc)}>
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
        open={Boolean(selectedIoc)}
        title="IOC Details"
        onClose={() => setSelectedIoc(null)}
      >
        {selectedIoc ? (
          <div className="space-y-2 text-sm text-[#24304D] dark:text-[#B0B5C3]">
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Value:</span>{" "}
              {selectedIoc.value}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Type:</span>{" "}
              {selectedIoc.type}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Organisation:</span>{" "}
              {selectedIoc.organisation?.name || selectedIoc.org_id}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Status:</span>{" "}
              {selectedIoc.status}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">TLP:</span>{" "}
              {selectedIoc.tlp}
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Confidence:</span>{" "}
              {selectedIoc.confidence}%
            </p>
            <p>
              <span className="font-semibold text-[#100A36] dark:text-white">Description:</span>{" "}
              {selectedIoc.description || "N/A"}
            </p>
          </div>
        ) : null}
      </Modal>
    </main>
  );
}

