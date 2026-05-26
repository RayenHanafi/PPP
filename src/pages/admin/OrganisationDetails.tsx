import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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
} from "../../components/ui";
import { AdminTopBar } from "../../components/AdminTopBar";
import { adminApi, type Organisation } from "../../services";

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

export function AdminOrganisationDetails() {
  const { auth } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [records, setRecords] = useState<Organisation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [trustDraft, setTrustDraft] = useState("");

  const loadOrganisations = useCallback(async () => {
    if (!auth.token || auth.role !== "admin") {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getOrganisations(auth.token);
      setRecords(response.items || []);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load organisation details.");
      }
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [auth.role, auth.token]);

  const handleApprove = useCallback(async () => {
    if (!auth.token || auth.role !== "admin" || !id) {
      return;
    }

    const confirmed = window.confirm(
      "Approve this organisation? Credentials and API key will be sent by backend email flow.",
    );
    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await adminApi.approveOrganisation(auth.token, id);
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
      setIsActionLoading(false);
    }
  }, [auth.role, auth.token, id, loadOrganisations]);

  const handleRevoke = useCallback(async () => {
    if (!auth.token || auth.role !== "admin" || !id) {
      return;
    }

    const confirmed = window.confirm(
      "Revoke this organisation? The API key and contributor access will be disabled by backend policy.",
    );
    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await adminApi.revokeOrganisation(auth.token, id);
      setSuccessMessage("Organisation revoked successfully.");
      await loadOrganisations();
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setActionError(caughtError.message);
      } else {
        setActionError("Unable to revoke organisation.");
      }
    } finally {
      setIsActionLoading(false);
    }
  }, [auth.role, auth.token, id, loadOrganisations]);

  const handleDeny = useCallback(async () => {
    if (!auth.token || auth.role !== "admin" || !id) {
      return;
    }

    const confirmed = window.confirm(
      "Deny this pending organisation request? The organisation status will be set to revoked.",
    );
    if (!confirmed) {
      return;
    }

    setIsActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await adminApi.revokeOrganisation(auth.token, id);
      setSuccessMessage("Organisation request denied successfully.");
      await loadOrganisations();
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setActionError(caughtError.message);
      } else {
        setActionError("Unable to deny organisation request.");
      }
    } finally {
      setIsActionLoading(false);
    }
  }, [auth.role, auth.token, id, loadOrganisations]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOrganisations();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadOrganisations]);

  const organisation = useMemo(() => {
    if (!id) {
      return null;
    }
    return records.find((item) => item.id === id) ?? null;
  }, [id, records]);

  useEffect(() => {
    if (organisation) {
      setTrustDraft(String(organisation.trust_score));
    }
  }, [organisation]);

  const handleTrustScoreSave = useCallback(async () => {
    if (!auth.token || auth.role !== "admin" || !organisation) {
      return;
    }

    const parsed = Number(trustDraft);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
      setActionError("Trust score must be an integer between 0 and 100.");
      return;
    }

    setIsActionLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      await adminApi.updateOrganisationTrustScore(auth.token, organisation.id, parsed);
      setSuccessMessage("Trust score updated successfully.");
      await loadOrganisations();
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setActionError(caughtError.message);
      } else {
        setActionError("Unable to update trust score.");
      }
    } finally {
      setIsActionLoading(false);
    }
  }, [auth.role, auth.token, loadOrganisations, organisation, trustDraft]);

  if (!auth.token || auth.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <AdminTopBar />
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Organisation Details</CardTitle>
              <CardDescription>
                Review contributor organisation profile and approval status.
              </CardDescription>
            </div>
            <Link to="/admin/organisations">
              <Button variant="outline" size="sm">
                Back to organisations
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void loadOrganisations()}>
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
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="py-4">
                  <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                </CardContent>
              </Card>
            ) : !organisation ? (
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                Organisation not found.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Name
                      </p>
                      <p className="font-medium text-[#100A36] dark:text-white">{organisation.name}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Status
                      </p>
                      <Badge tone={statusTone(organisation.status)}>{organisation.status}</Badge>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Email
                      </p>
                      <p>{organisation.email}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        SIRET
                      </p>
                      <p>{organisation.siret}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Country
                      </p>
                      <p>{organisation.country || "N/A"}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Submitted
                      </p>
                      <p>{toDisplayDate(organisation.created_at)}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E] sm:col-span-2">
                    <CardContent className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                        Trust Score (0-100)
                      </p>
                      <div className="flex flex-wrap items-end gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={trustDraft}
                          onChange={(event) => setTrustDraft(event.target.value)}
                        />
                        <Button
                          size="sm"
                          disabled={isActionLoading}
                          onClick={() => void handleTrustScoreSave()}
                        >
                          {isActionLoading ? "Saving..." : "Save trust score"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {organisation.description ? (
                  <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardHeader>
                      <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-[#24304D] dark:text-[#B0B5C3]">{organisation.description}</p>
                    </CardContent>
                  </Card>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {organisation.status === "pending" ? (
                    <>
                      <Button size="sm" disabled={isActionLoading} onClick={() => void handleApprove()}>
                        {isActionLoading ? "Processing..." : "Approve organisation"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isActionLoading}
                        onClick={() => void handleDeny()}
                      >
                        {isActionLoading ? "Processing..." : "Deny organisation"}
                      </Button>
                    </>
                  ) : null}
                  {organisation.status === "approved" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActionLoading}
                      onClick={() => void handleRevoke()}
                    >
                      {isActionLoading ? "Processing..." : "Revoke organisation"}
                    </Button>
                  ) : null}
                  {organisation.status === "revoked" ? (
                    <Badge tone="neutral">No action available</Badge>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

