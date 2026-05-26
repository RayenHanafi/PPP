import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { adminApi, type DashboardStats, type OrganisationListResponse } from "../../services";
import { useAuth } from "../../auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { AdminTopBar } from "../../components/AdminTopBar";

interface AdminOverviewData {
  stats: DashboardStats | null;
  organisations: OrganisationListResponse | null;
}

const emptyOverview: AdminOverviewData = {
  stats: null,
  organisations: null,
};

export function AdminOverview() {
  const { auth } = useAuth();
  const [data, setData] = useState<AdminOverviewData>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    if (!auth.token || auth.role !== "admin") {
      return;
    }

    setIsLoading(true);
    setError(null);

    const [statsResult, organisationsResult] = await Promise.allSettled([
      adminApi.getAdminStats(auth.token),
      adminApi.getOrganisations(auth.token),
    ]);

    setData({
      stats: statsResult.status === "fulfilled" ? statsResult.value : null,
      organisations:
        organisationsResult.status === "fulfilled" ? organisationsResult.value : null,
    });

    if (statsResult.status === "rejected" && organisationsResult.status === "rejected") {
      const message =
        statsResult.reason instanceof Error && statsResult.reason.message
          ? statsResult.reason.message
          : "Unable to load admin overview.";
      setError(message);
    } else if (statsResult.status === "rejected" || organisationsResult.status === "rejected") {
      setError("Some admin metrics are temporarily unavailable.");
    }

    setIsLoading(false);
  }, [auth.role, auth.token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadOverview();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadOverview]);

  const organisationCounts = useMemo(() => {
    const items = data.organisations?.items ?? [];
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      revoked: items.filter((item) => item.status === "revoked").length,
    };
  }, [data.organisations?.items]);

  if (!auth.token || auth.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="app-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Link to="/">
            <Button variant="outline" size="sm">Back to Home</Button>
          </Link>
          <AdminTopBar />
        </div>
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Platform-level organization and submission metrics.
              </CardDescription>
            </div>
            <Link to="/admin/organisations">
              <Button size="sm">Manage Organisations</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void loadOverview()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Organisations
                  </p>
                  <p className="text-2xl font-semibold">{isLoading ? "..." : organisationCounts.total}</p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Pending
                  </p>
                  <p className="text-2xl font-semibold">{isLoading ? "..." : organisationCounts.pending}</p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Approved
                  </p>
                  <p className="text-2xl font-semibold">{isLoading ? "..." : organisationCounts.approved}</p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Revoked
                  </p>
                  <p className="text-2xl font-semibold">{isLoading ? "..." : organisationCounts.revoked}</p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Total IOCs
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? "..." : (data.stats?.total_iocs ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Total Malware
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading
                      ? "..."
                      : (data.stats?.total_malware_samples ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Total Threat Actors
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading
                      ? "..."
                      : (data.stats?.total_threat_actors ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Pending Moderation
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading
                      ? "..."
                      : (data.stats?.pending_submissions ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {!isLoading && data.organisations && data.organisations.items.length === 0 ? (
              <div className="flex items-center gap-2">
                <Badge tone="neutral">No organisations yet</Badge>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Link to="/admin/iocs">
                <Button variant="outline" size="sm">
                  Global IOCs
                </Button>
              </Link>
              <Link to="/admin/malware">
                <Button variant="outline" size="sm">
                  Global Malware
                </Button>
              </Link>
              <Link to="/admin/threat-actors">
                <Button variant="outline" size="sm">
                  Global Threat Actors
                </Button>
              </Link>
              <Link to="/admin/stats">
                <Button variant="outline" size="sm">
                  Advanced Stats
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

