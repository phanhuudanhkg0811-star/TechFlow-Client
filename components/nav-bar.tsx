"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  Bot,
  Building2,
  FileCode,
  LayoutDashboard,
  Loader2,
  LogOut,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiClient from "@/lib/apiClient";

type UserRole = "ADMIN" | "COMPANY_ROOT" | "HR" | "CANDIDATE";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  companyId?: string | null;
  company?: { id: string; name: string } | null;
}

const roleLabel: Record<UserRole, string> = {
  ADMIN: "Admin",
  COMPANY_ROOT: "Company owner",
  HR: "HR",
  CANDIDATE: "Candidate",
};

const primaryMenuByRole: Record<
  UserRole,
  { href: string; label: string; icon: React.ReactNode }
> = {
  ADMIN: {
    href: "/admin/companies",
    label: "Manage companies",
    icon: <Building2 className="h-4 w-4" />,
  },
  COMPANY_ROOT: {
    href: "/company/settings",
    label: "Company settings",
    icon: <Settings className="h-4 w-4" />,
  },
  HR: {
    href: "/dashboard/jobs",
    label: "Manage jobs",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  CANDIDATE: {
    href: "/tests",
    label: "My tests",
    icon: <FileCode className="h-4 w-4" />,
  },
};

const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      router.push("/");
    }
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await apiClient.get<UserProfile>("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, logout };
};

const handleSmoothScroll = (
  event: React.MouseEvent<HTMLAnchorElement>,
  id: string,
) => {
  event.preventDefault();
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 80;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: elementPosition - offset,
    behavior: "smooth",
  });
};

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const primaryMenu = user ? primaryMenuByRole[user.role] : null;

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/20 bg-white/20 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-black/20"
          : "bg-transparent pt-4"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2">
          <Bot className="h-6 w-6 text-blue-400 transition-transform group-hover:rotate-12 dark:text-blue-500" />
          <span className="animate-gradient-reverse text-xl font-bold tracking-tight">
            AI-TechFlow
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-400">
          <a
            href="#features"
            onClick={(event) => handleSmoothScroll(event, "features")}
            className="transition-colors hover:text-indigo-600 dark:hover:text-white"
          >
            Features
          </a>
          <a
            href="#workflow"
            onClick={(event) => handleSmoothScroll(event, "workflow")}
            className="transition-colors hover:text-indigo-600 dark:hover:text-white"
          >
            Workflow
          </a>
          <a
            href="#solutions"
            onClick={(event) => handleSmoothScroll(event, "solutions")}
            className="transition-colors hover:text-indigo-600 dark:hover:text-white"
          >
            Solutions
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {isLoading ? (
            <div className="flex h-9 w-9 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none">
                  <Avatar className="h-9 w-9 border border-indigo-500/20">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="bg-indigo-600 font-bold text-white">
                      {user.name?.charAt(0).toUpperCase() ||
                        user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-semibold md:block">
                    {user.name || user.email.split("@")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="mt-2 w-60 rounded-2xl border-slate-200 backdrop-blur-xl dark:border-white/10"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-bold">
                      {user.name || "User"}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user.email}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {roleLabel[user.role]}
                      {user.company?.name ? ` - ${user.company.name}` : ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {primaryMenu && (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2 py-2.5"
                  >
                    <Link href={primaryMenu.href}>
                      {primaryMenu.icon}
                      {primaryMenu.label}
                    </Link>
                  </DropdownMenuItem>
                )}

                {user.role === "ADMIN" && (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2 py-2.5"
                  >
                    <Link href="/admin/templates">
                      <FileCode className="h-4 w-4" />
                      Public templates
                    </Link>
                  </DropdownMenuItem>
                )}

                {user.role === "COMPANY_ROOT" && (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2 py-2.5"
                  >
                    <Link href="/company/hr">
                      <Users className="h-4 w-4" />
                      HR management
                    </Link>
                  </DropdownMenuItem>
                )}

                {user.role === "HR" && (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2 py-2.5"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer gap-2 py-2.5 text-red-500 focus:bg-red-50 focus:text-red-500 dark:focus:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className="hidden rounded-full px-6 sm:inline-flex"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-indigo-600 px-6 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
              >
                <Link href="/login">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
