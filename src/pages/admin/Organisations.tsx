import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { adminApi, type Organisation } from "../../services";
import { useAuth } from "../../auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui";
import { AdminTopBar } from "../../components/AdminTopBar";

type OrganisationFilter = "all" | "pending" | "approved" | "revoked";

function toDisplayDate(value?: string | null) {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function statusTone(status: Organisation["status"]) {
  if (status === "approved") {
    return "success" as const;
  }
  if (status === "pending") {
    return "warning" as const;
  }
  if (status === "revoked") {
    return "danger" as const;
  }
  return "neutral" as const;
}

export function AdminOrganisations() {
  const { auth } = useAuth();
  const [records, setRecords] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrganisationFilter>("all");
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const loadOrganisations = useCallback(async () => {
    if (!auth.token || auth.role !== "admin") {
      return;
    }

    setIsLoading(true);
    setError(null);
    setActionError(null);

    try {
      const response = await adminApi.getOrganisations(auth.token);
      setRecords(response.items || []);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load organisations.");
      }
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth.role, auth.token]);

  const handleApprove = useCallback(
    async (organisationId: string) => {
      if (!auth.token || auth.role !== "admin") {
        return;
      }

      const confirmed = window.confirm(
        "Approve this organisation? Credentials and API key will be sent by backend email flow.",
      );
      if (!confirmed) {
        return;
      }

      setActionError(null);
      setSuccessMessage(null);
      setPendingActionId(organisationId);

      try {
        await adminApi.approveOrganisation(auth.token, organisationId);
        setSuccessMessage(
          "Organisation approved successfully. The contributor login credentials and automation API key were sent by email.",
        );
        await loadOrganisations();
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.message) {
          setActionError(caughtError.message);
        } else {
          setActionError("Unable to approve organisation.");
        }
      } finally {
        setPendingActionId(null);
      }
    },
    [auth.role, auth.token, loadOrganisations],
  );

  const handleRevoke = useCallback(
    async (organisationId: string) => {
      if (!auth.token || auth.role !== "admin") {
        return;
      }

      const confirmed = window.confirm(
        "Revoke this organisation? The API key and contributor access will be disabled by backend policy.",
      );
      if (!confirmed) {
        return;
      }

      setActionError(null);
      setSuccessMessage(null);
      setPendingActionId(organisationId);

      try {
        await adminApi.revokeOrganisation(auth.token, organisationId);
        setSuccessMessage("Organisation revoked successfully.");
        await loadOrganisations();
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.message) {
          setActionError(caughtError.message);
        } else {
          setActionError("Unable to revoke organisation.");
        }
      } finally {
        setPendingActionId(null);
      }
    },
    [auth.role, auth.token, loadOrganisations],
  );

  const handleDeny = useCallback(
    async (organisationId: string) => {
      if (!auth.token || auth.role !== "admin") {
        return;
      }

      const confirmed = window.confirm(
        "Deny this pending organisation request? The organisation status will be set to revoked.",
      );
      if (!confirmed) {
        return;
      }

      setActionError(null);
      setSuccessMessage(null);
      setPendingActionId(organisationId);

      try {
        await adminApi.revokeOrganisation(auth.token, organisationId);
        setSuccessMessage("Organisation request denied successfully.");
        await loadOrganisations();
      } catch (caughtError) {
        if (caughtError instanceof Error && caughtError.message) {
          setActionError(caughtError.message);
        } else {
          setActionError("Unable to deny organisation request.");
        }
      } finally {
        setPendingActionId(null);
      }
    },
    [auth.role, auth.token, loadOrganisations],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrganisations();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadOrganisations]);

  const visibleRecords = useMemo(() => {
    if (filter === "all") {
      return records;
    }

    return records.filter((item) => item.status === filter);
  }, [filter, records]);

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
              <CardTitle className="text-xl">Organisations</CardTitle>
              <CardDescription>
                Review contributor organisation requests and manage approval
                state.
              </CardDescription>
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Back to admin overview
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="max-w-[260px]">
              <Select
                label="Filter status"
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as OrganisationFilter)
                }
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="revoked">Revoked</option>
              </Select>
            </div>

            {error ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void loadOrganisations()}
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
                    key={`org-row-skeleton-${index}`}
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
                No organisations match this filter.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>SIRET</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Trust score</TableHeaderCell>
                      <TableHeaderCell>Created</TableHeaderCell>
                      <TableHeaderCell className="text-right">
                        Actions
                      </TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleRecords.map((organisation) => (
                      <TableRow key={organisation.id}>
                        <TableCell className="font-medium text-[#100A36] dark:text-white">
                          {organisation.name}
                        </TableCell>
                        <TableCell>{organisation.email}</TableCell>
                        <TableCell>{organisation.siret}</TableCell>
                        <TableCell>
                          <Badge tone={statusTone(organisation.status)}>
                            {organisation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{organisation.trust_score}</TableCell>
                        <TableCell>
                          {toDisplayDate(organisation.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/organisations/${organisation.id}`}
                            >
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </Link>
                            {organisation.status === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  disabled={pendingActionId === organisation.id}
                                  onClick={() =>
                                    void handleApprove(organisation.id)
                                  }
                                >
                                  {pendingActionId === organisation.id
                                    ? "Processing..."
                                    : "Approve"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={pendingActionId === organisation.id}
                                  onClick={() =>
                                    void handleDeny(organisation.id)
                                  }
                                >
                                  Revoke
                                </Button>
                              </>
                            ) : organisation.status === "approved" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={pendingActionId === organisation.id}
                                onClick={() =>
                                  void handleRevoke(organisation.id)
                                }
                              >
                                {pendingActionId === organisation.id
                                  ? "Processing..."
                                  : "Revoke"}
                              </Button>
                            ) : (
                              <Badge tone="neutral">No action</Badge>
                            )}
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
    </main>
  );
}
