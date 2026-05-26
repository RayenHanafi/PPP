import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { contributorApi } from "../../services";
import { useAuth } from "../../auth";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
} from "../../components/ui";
import { ContributorTopBar } from "../../components/ContributorTopBar";

const iocTypes = ["ip", "url", "hash", "email"] as const;
const tlpLevels = ["red", "amber", "green", "white"] as const;

export function ContributorIocNew() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<(typeof iocTypes)[number]>("ip");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [tlp, setTlp] = useState<(typeof tlpLevels)[number]>("green");
  const [confidence, setConfidence] = useState("80");
  const [firstSeen, setFirstSeen] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [tags, setTags] = useState("");
  const [sourceContext, setSourceContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!auth.token || auth.role !== "contributor") {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const token = auth.token;

    if (!token) {
      setError("You need an active contributor session.");
      return;
    }

    const confidenceValue = Number(confidence);
    if (!value.trim() || !description.trim()) {
      setError("Value and description are required.");
      return;
    }

    if (!Number.isFinite(confidenceValue) || confidenceValue < 0 || confidenceValue > 100) {
      setError("Confidence must be between 0 and 100.");
      return;
    }

    setIsSubmitting(true);

    try {
      await contributorApi.createContributorIoc(token, {
        type,
        value: value.trim(),
        description: description.trim(),
        tlp,
        confidence: confidenceValue,
        first_seen: firstSeen || null,
        last_seen: lastSeen || null,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        source_context: sourceContext.trim() || null,
      });

      navigate("/contributor/iocs", { replace: true });
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to submit IOC.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-10 text-[#100A36] dark:bg-[#0F0F1E] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <ContributorTopBar />
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-xl">Submit IOC</CardTitle>
              <CardDescription>
                Submitted records are immutable. If needed later, mark false positive from the list.
              </CardDescription>
            </div>
            <Link to="/contributor/iocs">
              <Button variant="outline" size="sm">
                Back to My IOCs
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <Select
                label="Type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as (typeof iocTypes)[number])
                }
              >
                {iocTypes.map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </Select>

              <Input
                label="Value"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="185.220.101.45"
              />

              <Input
                label="Confidence (0-100)"
                type="number"
                min={0}
                max={100}
                value={confidence}
                onChange={(event) => setConfidence(event.target.value)}
              />

              <Select
                label="TLP"
                value={tlp}
                onChange={(event) =>
                  setTlp(event.target.value as (typeof tlpLevels)[number])
                }
              >
                {tlpLevels.map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </Select>

              <Input
                label="First seen (optional)"
                type="datetime-local"
                value={firstSeen}
                onChange={(event) => setFirstSeen(event.target.value)}
              />

              <Input
                label="Last seen (optional)"
                type="datetime-local"
                value={lastSeen}
                onChange={(event) => setLastSeen(event.target.value)}
              />

              <Input
                label="Tags (comma-separated)"
                className="md:col-span-2"
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="phishing, scanner, ssh-bruteforce"
              />

              <Input
                label="Source context (optional)"
                className="md:col-span-2"
                value={sourceContext}
                onChange={(event) => setSourceContext(event.target.value)}
                placeholder="firewall-logs"
              />

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-[#39415C]">
                  Description
                </label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-[#D7DBEA] bg-white px-4 py-3 text-[#100A36] outline-none transition focus:border-[#4A3CC9] focus:ring-4 focus:ring-[#4A3CC9]/10 dark:border-[#3A3A4E] dark:bg-[#0F0F1E] dark:text-white dark:focus:border-[#6B5FD9] dark:focus:ring-[#6B5FD9]/20"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Detected scanning SSH from repeated source."
                />
              </div>

              {error ? (
                <div className="md:col-span-2 rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                  {error}
                </div>
              ) : null}

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit IOC"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
