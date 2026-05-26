import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { contributorApi, type ContributorMe } from "../../services";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui";
import { ContributorTopBar } from "../../components/ContributorTopBar";
import { useAuth } from "../../auth";

interface ContributorOverviewData {
  me: ContributorMe | null;
  iocCount: number;
  malwareCount: number;
  threatActorCount: number;
}

const emptyOverview: ContributorOverviewData = {
  me: null,
  iocCount: 0,
  malwareCount: 0,
  threatActorCount: 0,
};

export function ContributorOverview() {
  const { auth } = useAuth();
  const [data, setData] = useState<ContributorOverviewData>(emptyOverview);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    if (!auth.token || auth.role !== "contributor") {
      return;
    }

    setIsLoading(true);
    setError(null);

    const [meResult, iocsResult, malwareResult, actorsResult] =
      await Promise.allSettled([
        contributorApi.getContributorMe(auth.token),
        contributorApi.getContributorIocs(auth.token),
        contributorApi.getContributorMalware(auth.token),
        contributorApi.getContributorThreatActors(auth.token),
      ]);

    const nextData: ContributorOverviewData = {
      me: meResult.status === "fulfilled" ? meResult.value : null,
      iocCount: iocsResult.status === "fulfilled" ? iocsResult.value.length : 0,
      malwareCount:
        malwareResult.status === "fulfilled" ? malwareResult.value.length : 0,
      threatActorCount:
        actorsResult.status === "fulfilled" ? actorsResult.value.length : 0,
    };

    setData(nextData);

    const failed: string[] = [];
    if (meResult.status === "rejected") failed.push("profile");
    if (iocsResult.status === "rejected") failed.push("IOCs");
    if (malwareResult.status === "rejected") failed.push("malware");
    if (actorsResult.status === "rejected") failed.push("threat actors");

    if (failed.length === 4) {
      const message = "Unable to load contributor overview.";
      setError(message);
    } else if (failed.length > 0) {
      setError(`Some dashboard sections are unavailable: ${failed.join(", ")}.`);
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

  const totalSubmissions = useMemo(
    () => data.iocCount + data.malwareCount + data.threatActorCount,
    [data.iocCount, data.malwareCount, data.threatActorCount],
  );

  if (!auth.token || auth.role !== "contributor") {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-10 text-[#100A36] dark:bg-[#0F0F1E] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Link to="/">
            <Button variant="outline" size="sm">Back to Home</Button>
          </Link>
          <ContributorTopBar />
        </div>
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader>
            <CardTitle className="text-xl">Contributor Dashboard</CardTitle>
            <CardDescription>
              Your organization overview and submission totals.
            </CardDescription>
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

            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">
                {data.me?.organisation?.name || "Contributor organization"}
              </Badge>
              <Badge tone="neutral">{data.me?.email || "Account email unavailable"}</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Total
                  </p>
                  <p className="text-2xl font-semibold text-[#100A36] dark:text-white">
                    {isLoading ? "..." : totalSubmissions}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    IOCs
                  </p>
                  <p className="text-2xl font-semibold text-[#100A36] dark:text-white">
                    {isLoading ? "..." : data.iocCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Malware
                  </p>
                  <p className="text-2xl font-semibold text-[#100A36] dark:text-white">
                    {isLoading ? "..." : data.malwareCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
                <CardContent className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#707A91] dark:text-[#A1A5AF]">
                    Threat Actors
                  </p>
                  <p className="text-2xl font-semibold text-[#100A36] dark:text-white">
                    {isLoading ? "..." : data.threatActorCount}
                  </p>
                </CardContent>
              </Card>
            </div>

            {!isLoading && totalSubmissions === 0 ? (
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                No submissions yet. Start by submitting your first IOC, malware sample, or threat actor profile.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Link to="/contributor/iocs/new">
                <Button size="sm">Submit IOC</Button>
              </Link>
              <Link to="/contributor/malware/new">
                <Button variant="outline" size="sm">Submit Malware</Button>
              </Link>
              <Link to="/contributor/threat-actors/new">
                <Button variant="outline" size="sm">Submit Threat Actor</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
