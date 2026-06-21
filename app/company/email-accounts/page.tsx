"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiClient from "@/lib/apiClient";
import { useCurrentUser } from "@/features/dashboard/use-current-user";

interface EmailAccount {
  id: string;
  email: string;
  isActive: boolean;
  lastUsed: string | null;
}

const loadEmailAccounts = async () => {
  const res = await apiClient.get<EmailAccount[]>("/email-accounts");
  return res.data;
};

export default function EmailAccountsPage() {
  const { user } = useCurrentUser();
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fetchAccounts = async () => {
    setAccounts(await loadEmailAccounts());
  };

  useEffect(() => {
    let isMounted = true;
    loadEmailAccounts().then((data) => {
      if (isMounted) setAccounts(data);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const createAccount = async () => {
    if (!email.trim() || !password.trim()) return;
    await apiClient.post("/email-accounts", {
      email,
      password,
      companyId: user?.role === "ADMIN" ? user.companyId : undefined,
    });
    toast.success("Email account saved");
    setEmail("");
    setPassword("");
    fetchAccounts();
  };

  const testConnection = async (id: string) => {
    const res = await apiClient.post<{ success: boolean; message?: string }>(
      `/email-accounts/${id}/test`,
    );
    if (res.data.success) toast.success("IMAP connection works");
    else toast.error(res.data.message || "IMAP connection failed");
  };

  const syncAccount = async (id: string) => {
    const res = await apiClient.post(`/email-accounts/${id}/sync`);
    toast.success(
      `Sync complete: ${res.data.processedEmails ?? 0} processed, ${res.data.newCandidates ?? 0} new`,
    );
    fetchAccounts();
  };

  const deactivate = async (id: string) => {
    await apiClient.delete(`/email-accounts/${id}`);
    toast.success("Email account deactivated");
    fetchAccounts();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Accounts</h1>
        <p className="text-muted-foreground">
          Store IMAP credentials encrypted and sync candidate CVs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add IMAP Account</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="hr@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            type="password"
            placeholder="App password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button onClick={createAccount}>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    {account.lastUsed
                      ? new Date(account.lastUsed).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testConnection(account.id)}
                    >
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncAccount(account.id)}
                    >
                      Sync
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deactivate(account.id)}
                    >
                      Deactivate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
