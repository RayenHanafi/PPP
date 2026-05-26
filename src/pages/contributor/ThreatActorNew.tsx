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

const motivations = ["espionage", "financial", "hacktivism", "sabotage"] as const;
const tlpLevels = ["red", "amber", "green", "white"] as const;

export function ContributorThreatActorNew() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [aliases, setAliases] = useState("");
  const [motivation, setMotivation] =
    useState<(typeof motivations)[number]>("espionage");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [tlp, setTlp] = useState<(typeof tlpLevels)[number]>("green");
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

    if (!name.trim() || !description.trim()) {
      setError("Name and description are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await contributorApi.createContributorThreatActor(token, {
        name: name.trim(),
        aliases: aliases
          .split(",")
          .map((alias) => alias.trim())
          .filter(Boolean),
        motivation,
        country: country.trim() || null,
        description: description.trim(),
        tlp,
      });

      navigate("/contributor/threat-actors", { replace: true });
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to submit threat actor profile.");
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
              <CardTitle className="text-xl">Submit Threat Actor</CardTitle>
              <CardDescription>
                Submitted records are immutable. If needed later, mark false positive from the list.
              </CardDescription>
            </div>
            <Link to="/contributor/threat-actors">
              <Button variant="outline" size="sm">
                Back to My Threat Actors
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <Input
                label="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Threat actor name"
              />

              <Select
                label="Motivation"
                value={motivation}
                onChange={(event) =>
                  setMotivation(event.target.value as (typeof motivations)[number])
                }
              >
                {motivations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>

              <Input
                label="Country (optional)"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="Country or region"
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
                label="Aliases (comma-separated)"
                className="md:col-span-2"
                value={aliases}
                onChange={(event) => setAliases(event.target.value)}
                placeholder="alias-1, alias-2"
              />

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-[#39415C]">
                  Description
                </label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-[#D7DBEA] bg-white px-4 py-3 text-[#100A36] outline-none transition focus:border-[#4A3CC9] focus:ring-4 focus:ring-[#4A3CC9]/10 dark:border-[#3A3A4E] dark:bg-[#0F0F1E] dark:text-white dark:focus:border-[#6B5FD9] dark:focus:ring-[#6B5FD9]/20"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Threat actor profile summary and context."
                />
              </div>

              {error ? (
                <div className="md:col-span-2 rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] p-3 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]">
                  {error}
                </div>
              ) : null}

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Threat Actor"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
