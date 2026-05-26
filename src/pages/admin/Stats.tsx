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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../components/ui";
import { AdminTopBar } from "../../components/AdminTopBar";
import { adminApi, type DashboardStats } from "../../services";

function toRows(source?: Record<string, number>) {
  if (!source) {
    return [];
  }

  return Object.entries(source).sort((a, b) => b[1] - a[1]);
}

export function AdminStats() {
  const { auth } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!auth.token || auth.role !== "admin") {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminApi.getAdminStats(auth.token);
      setStats(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to load admin statistics.");
      }
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [auth.role, auth.token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadStats();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadStats]);

  const byTypeRows = useMemo(() => toRows(stats?.by_type), [stats?.by_type]);
  const byTlpRows = useMemo(() => toRows(stats?.by_tlp), [stats?.by_tlp]);

  if (!auth.token || auth.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-10 text-[#100A36] dark:bg-[#0F0F1E] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <AdminTopBar />
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Advanced Statistics</CardTitle>
              <CardDescription>
                Platform-wide totals and distribution by IOC type and TLP level.
              </CardDescription>
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Back to admin overview
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p>{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void loadStats()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Total IOCs
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? "..." : (stats?.total_iocs ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Total Malware
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? "..." : (stats?.total_malware_samples ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Total Threat Actors
                  </p>
                  <p className="text-2xl font-semibold">
                    {isLoading ? "..." : (stats?.total_threat_actors ?? 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card key={`admin-stats-skeleton-${index}`} className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                    <CardContent className="py-4">
                      <div className="h-4 w-full animate-pulse rounded bg-[#EEF1FA] dark:bg-[#1A1A2E]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                  <CardHeader>
                    <CardTitle className="text-base">IOC Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {byTypeRows.length === 0 ? (
                      <Badge tone="neutral">No type distribution available</Badge>
                    ) : (
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>Type</TableHeaderCell>
                            <TableHeaderCell className="text-right">Count</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {byTypeRows.map(([type, count]) => (
                            <TableRow key={type}>
                              <TableCell>{type}</TableCell>
                              <TableCell className="text-right">{count.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                  <CardHeader>
                    <CardTitle className="text-base">TLP Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {byTlpRows.length === 0 ? (
                      <Badge tone="neutral">No TLP distribution available</Badge>
                    ) : (
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableHeaderCell>TLP</TableHeaderCell>
                            <TableHeaderCell className="text-right">Count</TableHeaderCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {byTlpRows.map(([tlp, count]) => (
                            <TableRow key={tlp}>
                              <TableCell>{tlp}</TableCell>
                              <TableCell className="text-right">{count.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
