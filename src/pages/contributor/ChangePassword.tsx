import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { authApi } from "../../services";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "../../components/ui";
import { ContributorTopBar } from "../../components/ContributorTopBar";

export function ContributorChangePassword() {
  const navigate = useNavigate();
  const { auth, setAuthState } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateForm() {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return "All fields are required.";
    }

    if (newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (newPassword !== confirmNewPassword) {
      return "New password confirmation does not match.";
    }

    if (currentPassword === newPassword) {
      return "New password must be different from current password.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!auth.token || auth.role !== "contributor") {
      setError("You need a contributor session to change password.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.changeContributorPassword(auth.token, {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setAuthState({
        ...auth,
        mustChangePassword: false,
      });
      navigate("/contributor", { replace: true });
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message) {
        setError(caughtError.message);
      } else {
        setError("Unable to change password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-page px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-6">
        <ContributorTopBar />
        <Card className="border-[#E5E8F2] dark:border-[#2A2A3E]">
          <CardHeader>
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[#EEF1FA] text-[#4A3CC9] dark:bg-[#1F2A4A] dark:text-[#88ADFF]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">Change Temporary Password</CardTitle>
            <CardDescription>
              You must change your temporary password before accessing the contributor dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                autoComplete="current-password"
                label="Current password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
              <Input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                label="New password"
                hint="Minimum 8 characters."
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
              <Input
                id="confirm_new_password"
                name="confirm_new_password"
                type="password"
                autoComplete="new-password"
                label="Confirm new password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
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
                    Updating password...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

