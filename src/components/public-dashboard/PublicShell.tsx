import { Shield, Search, TriangleAlert, Moon, Sun } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useTheme } from "../../lib/useTheme";
import type { ReactNode } from "react";

const navigation = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/iocs", label: "IOCs" },
  { to: "/threat-actors", label: "Threat Actors" },
  { to: "/malware", label: "Malware" },
  { to: "/blockchain", label: "Blockchain" },
];

interface PublicShellProps {
  title: string;
  description: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}

export function PublicShell({
  title,
  description,
  eyebrow = "Public threat intelligence",
  actionHref = "/register",
  actionLabel = "Submit Registration",
  children,
}: PublicShellProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] text-[var(--color-page-fg)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border-strong)] bg-[var(--color-card-bg)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#100A36] text-white dark:bg-[#6B5FD9]">
              <Shield className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight text-[#100A36] dark:text-white">
                ThreatChain
              </span>
              <span className="block text-xs uppercase tracking-[0.28em] text-[#6A728A] dark:text-[#A1A5AF]">
                Public intel
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[#100A36] text-white dark:bg-[#6B5FD9] dark:shadow-none shadow"
                      : "text-[#4E5773] hover:bg-[#EEF1FA] hover:text-[#100A36] dark:text-[#B0B5C3] dark:hover:bg-[#1A1A2E] dark:hover:text-white",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="hidden sm:inline-flex"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Link to={actionHref} className="hidden sm:inline-flex">
              <Button size="sm">{actionLabel}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-card-bg)] px-6 py-8 sm:px-8 sm:py-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#4A3CC9] to-transparent opacity-60" />
          <div className="absolute -right-20 top-[-5rem] h-56 w-56 rounded-full bg-[#4A3CC9]/10 blur-3xl dark:bg-[#6B5FD9]/5" />
          <div className="absolute -left-10 bottom-[-5rem] h-56 w-56 rounded-full bg-[#100A36]/5 blur-3xl dark:bg-[#6B5FD9]/5" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#EEF1FA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-[#4A3CC9] dark:bg-[#1F2A4A] dark:text-[#88ADFF]">
              <TriangleAlert className="h-3.5 w-3.5" />
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-[#100A36] dark:text-white sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#5E667C] dark:text-[#A1A5AF] sm:text-base">
              {description}
            </p>
          </div>
        </section>

        <div className="mt-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}
