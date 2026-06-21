"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconBriefcase,
  IconBuilding,
  IconLayoutDashboard,
  IconLogout,
  IconMail,
  IconSettings,
  IconSparkles,
  IconTemplate,
  IconUsers,
} from "@tabler/icons-react";
import apiClient from "@/lib/apiClient";
import { Spinner } from "@/components/ui/spinner";
import { useCurrentUser, UserRole } from "./use-current-user";

const roleLabel: Record<UserRole, string> = {
  ADMIN: "ADMIN",
  COMPANY_ROOT: "COMPANY",
  HR: "HR",
  CANDIDATE: "USER",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useCurrentUser();

  const navItems = [
    {
      name: "Overview",
      href: "/dashboard",
      icon: <IconLayoutDashboard size={20} />,
      roles: ["HR"],
    },
    {
      name: "Jobs",
      href: "/dashboard/jobs",
      icon: <IconBriefcase size={20} />,
      roles: ["HR"],
    },
    {
      name: "Candidates",
      href: "/dashboard/candidates",
      icon: <IconUsers size={20} />,
      roles: ["HR"],
    },
    {
      name: "Companies",
      href: "/admin/companies",
      icon: <IconBuilding size={20} />,
      roles: ["ADMIN"],
    },
    {
      name: "Public Templates",
      href: "/admin/templates",
      icon: <IconTemplate size={20} />,
      roles: ["ADMIN"],
    },
    {
      name: "HR Management",
      href: "/company/hr",
      icon: <IconUsers size={20} />,
      roles: ["COMPANY_ROOT"],
    },
    {
      name: "Email Accounts",
      href: "/company/email-accounts",
      icon: <IconMail size={20} />,
      roles: ["HR"],
    },
    {
      name: "Templates",
      href: "/company/templates",
      icon: <IconTemplate size={20} />,
      roles: ["COMPANY_ROOT"],
    },
    {
      name: "Company Settings",
      href: "/company/settings",
      icon: <IconSettings size={20} />,
      roles: ["COMPANY_ROOT"],
    },
  ];

  const visibleItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <IconSparkles className="text-primary" /> AI-TechFlow
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <IconLogout size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {visibleItems.find((item) =>
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`),
              )
                ?.name || "Workspace"}
            </h2>
            {user?.company && (
              <p className="text-xs text-muted-foreground">
                {user.company.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground">
              {user ? roleLabel[user.role] : "GUEST"}
            </span>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
