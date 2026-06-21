"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

interface Company {
  id: string;
  name: string;
  tokenUsage: number;
  aiSuggestionEnabled: boolean;
  _count?: { users: number; jobs: number; emailAccounts: number };
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [rootEmail, setRootEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingNames, setEditingNames] = useState<Record<string, string>>({});

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<Company[]>("/admin/companies");
      setCompanies(res.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const createCompany = async () => {
    if (!name.trim()) return;
    await apiClient.post("/admin/companies", {
      name,
      rootEmail: rootEmail || undefined,
    });
    toast.success("Company created");
    setName("");
    setRootEmail("");
    fetchCompanies();
  };

  const deleteCompany = async (id: string) => {
    await apiClient.delete(`/admin/companies/${id}`);
    toast.success("Company deleted");
    fetchCompanies();
  };

  const updateCompany = async (company: Company) => {
    const nextName = editingNames[company.id]?.trim();
    if (!nextName || nextName === company.name) return;

    await apiClient.patch(`/admin/companies/${company.id}`, {
      name: nextName,
    });
    toast.success("Company updated");
    fetchCompanies();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Companies</h1>
        <p className="text-muted-foreground">
          Create and manage tenant accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Company</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="Company name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            placeholder="Root email (optional)"
            value={rootEmail}
            onChange={(event) => setRootEmail(event.target.value)}
          />
          <Button onClick={createCompany}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Email Accounts</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Input
                      className="max-w-xs"
                      value={editingNames[company.id] ?? company.name}
                      onChange={(event) =>
                        setEditingNames((current) => ({
                          ...current,
                          [company.id]: event.target.value,
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>{company._count?.users ?? 0}</TableCell>
                  <TableCell>{company._count?.jobs ?? 0}</TableCell>
                  <TableCell>{company._count?.emailAccounts ?? 0}</TableCell>
                  <TableCell>{company.tokenUsage.toLocaleString()}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCompany(company)}
                    >
                      Save
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/companies/${company.id}/hr`}>
                        HR Users
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCompany(company.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No companies yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
