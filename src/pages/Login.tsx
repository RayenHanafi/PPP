import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "../auth";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "../components/ui";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

function getPostLoginPath(role: "admin" | "contributor", mustChangePassword?: boolean) {
  if (role === "admin") {
    return "/admin";
  }

  return mustChangePassword ? "/contributor/change-password" : "/contributor";
}

function isAllowedReturnPath(
  role: "admin" | "contributor",
  mustChangePassword: boolean | undefined,
  path: string,
) {
  if (path === "/login") {
    return false;
  }

  if (role === "admin") {
    return !path.startsWith("/contributor");
  }

  if (mustChangePassword) {
    return path === "/contributor/change-password";
  }

  return !path.startsWith("/admin");
}

export function Login() {
  const { auth, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state as LocationState | null) ?? null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    if (!auth.token || !auth.role) {
      return null;
    }

    return getPostLoginPath(auth.role, auth.mustChangePassword);
  }, [auth.mustChangePassword, auth.role, auth.token]);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email/username and password are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nextAuth = await login(email.trim(), password);
      if (!nextAuth.role) {
        throw new Error("Unable to determine account role.");
      }
      const fromPath = locationState?.from?.pathname;
      const fallbackPath = getPostLoginPath(
        nextAuth.role,
        nextAuth.mustChangePassword,
      );
      const targetPath =
        fromPath &&
        isAllowedReturnPath(
          nextAuth.role,
          nextAuth.mustChangePassword,
          fromPath,
        )
          ? fromPath
          : fallbackPath;

      navigate(targetPath, { replace: true });
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-16 text-[#100A36] dark:bg-[#0F0F1E] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF1FA] text-[#4A3CC9] dark:bg-[#1F2A4A] dark:text-[#88ADFF]">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">Sign in to your secure workspace</CardTitle>
            <CardDescription>
              For approved contributors and platform administrators.
            </CardDescription>
            <div>
              <Link to="/">
                <Button variant="outline" size="sm">Back to Home</Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="email"
                name="email"
                type="text"
                autoComplete="username"
                label="Email or username"
                placeholder="you@organisation.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {error ? (
                <p
                  className="rounded-lg border border-[#F4C4C4] bg-[#FDE8E8] px-3 py-2 text-sm text-[#C11E1E] dark:border-[#5A2A2A] dark:bg-[#3A1F1F] dark:text-[#FF9F9F]"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
