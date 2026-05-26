import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

interface RoleGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

interface PasswordGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RequireAdmin({
  children,
  redirectTo = "/login",
}: RoleGuardProps) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.token || auth.role !== "admin") {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireContributor({
  children,
  redirectTo = "/login",
}: RoleGuardProps) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.token || auth.role !== "contributor") {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireContributorPasswordResolved({
  children,
  redirectTo = "/contributor/change-password",
}: PasswordGuardProps) {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth.token || auth.role !== "contributor") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (auth.mustChangePassword) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
