import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Bot, Loader2, MessageSquareText } from "lucide-react";
import { PublicShell } from "../../components/public-dashboard/PublicShell";
import { SectionHeading } from "../../components/public-dashboard/SectionHeading";
import { StatsGrid } from "../../components/public-dashboard/StatsGrid";
import { VisibilityNotice } from "../../components/public-dashboard/VisibilityNotice";
import {
  publicApi,
  type ChatResponse,
  type DashboardStats,
} from "../../services";
import { Badge, Button, Card, CardContent, Input } from "../../components/ui";

const prompts = [
  "Show the latest validated phishing IOC",
  "Summarize public malware samples by family",
  "Which threat actors are active in financial campaigns?",
  "Verify a public IOC on blockchain",
];

export function PublicChat() {
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void publicApi.getDashboardStats().then(setStatsData).catch(() => {
      setStatsData(null);
    });
  }, []);

  const apiStats = useMemo(() => {
    if (!statsData) {
      return [];
    }
    const formatNumber = (value: number | undefined) =>
      typeof value === "number" ? value.toLocaleString() : "0";
    return [
      {
        label: "Validated IOCs",
        value: formatNumber(statsData.total_iocs),
        detail: "Only green and white intelligence is public.",
      },
      {
        label: "Active Threat Actors",
        value: formatNumber(statsData.total_threat_actors),
        detail: "Filtered to validated public profiles.",
      },
      {
        label: "Verified Malware Samples",
        value: formatNumber(statsData.total_malware_samples),
        detail: "Hash-backed records with safe visibility.",
      },
      {
        label: "Blockchain Proofs",
        value: formatNumber(statsData.total_blockchain_records),
        detail: "Traceable transactions for validated IOCs.",
      },
    ];
  }, [statsData]);

  async function submitChat(nextMessage: string) {
    const trimmed = nextMessage.trim();
    if (!trimmed) {
      setError("Please enter a question.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await publicApi.sendChatMessage({
        message: trimmed,
        context_type: "public",
      });
      setAnswer(response);
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to get a response from the assistant.");
      }
      setAnswer(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitChat(message);
  }

  return (
    <PublicShell
      title="AI chat"
      description="A public entry point for asking threat-intelligence questions. Only safe, validated, public data is intended for this view."
      actionHref="/register"
      actionLabel="Become Contributor"
    >
      {apiStats.length > 0 ? <StatsGrid stats={apiStats} /> : null}
      <VisibilityNotice />

      <Card className="border-[#E5E8F2] bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E]">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF1FA] text-[#4A3CC9] dark:bg-[#1F2A4A] dark:text-[#88ADFF]">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-[#100A36] dark:text-white">
                Public assistant
              </h3>
              <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                Designed to stay within the public TLP boundary.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setMessage(prompt);
                  void submitChat(prompt);
                }}
                className="rounded-2xl border border-[#E5E8F2] bg-[#FBFCFF] p-4 text-left text-sm leading-6 text-[#39415C] transition hover:border-[#D4DBED] hover:bg-white dark:border-[#2A2A3E] dark:bg-[#0F0F1E] dark:text-[#B0B5C3] dark:hover:border-[#3A3A4E]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              label="Ask a public intelligence question"
              placeholder="Example: Which validated malware family appears most frequently this week?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Asking...
                </>
              ) : (
                <>
                  <MessageSquareText className="h-4 w-4" />
                  Ask assistant
                </>
              )}
            </Button>
          </form>

          {error ? (
            <p
              className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] px-3 py-2 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          {!error && !isLoading && !answer ? (
            <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
              <CardContent>
                <p className="text-sm text-[#616B82] dark:text-[#A1A5AF]">
                  No response yet. Ask a question to start.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {!error && answer ? (
            <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
              <CardContent className="space-y-3">
                <p className="text-sm leading-7 text-[#39415C] dark:text-[#B0B5C3]">
                  {answer.answer}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="success">
                    Confidence: {answer.confidence || "unknown"}
                  </Badge>
                  <Badge tone="blue">
                    Sources: {Array.isArray(answer.sources) ? answer.sources.length : 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Badge tone="success">Validated context only</Badge>
            <Badge tone="blue">No red or amber data</Badge>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <SectionHeading
        title="Why the chat exists"
        description="The backend assistant can help explore public threat intelligence while keeping private data out of this interface."
      />
    </PublicShell>
  );
}
