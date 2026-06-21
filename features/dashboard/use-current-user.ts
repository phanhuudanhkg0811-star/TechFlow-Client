"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export type UserRole = "ADMIN" | "COMPANY_ROOT" | "HR" | "CANDIDATE";

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
  companyId?: string | null;
  company?: { id: string; name: string } | null;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<CurrentUser>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { user, isLoading };
};
