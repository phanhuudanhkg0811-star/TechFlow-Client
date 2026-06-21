"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
}

interface HrUser {
  id: string;
  email: string;
  name: string | null;
  githubUsername?: string | null;
  role: string;
}

const loadCompanyHrData = async (companyId: string) => {
  const [companyRes, hrRes] = await Promise.all([
    apiClient.get<Company>(`/admin/companies/${companyId}`),
    apiClient.get<HrUser[]>(`/companies/${companyId}/hr`),
  ]);

  return {
    company: companyRes.data,
    hrUsers: hrRes.data,
  };
};

export default function AdminCompanyHrPage() {
  const params = useParams<{ id: string }>();
  const companyId = params.id;
  const [company, setCompany] = useState<Company | null>(null);
  const [hrUsers, setHrUsers] = useState<HrUser[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await loadCompanyHrData(companyId);
      setCompany(data.company);
      setHrUsers(data.hrUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    loadCompanyHrData(companyId)
      .then((data) => {
        if (!isMounted) return;
        setCompany(data.company);
        setHrUsers(data.hrUsers);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const createHr = async () => {
    if (!email.trim()) return;

    await apiClient.post(`/companies/${companyId}/hr`, {
      email,
      name: name || undefined,
      githubUsername: githubUsername || undefined,
    });
    toast.success("HR user created");
    setEmail("");
    setName("");
    setGithubUsername("");
    fetchData();
  };

  const deactivate = async (id: string) => {
    await apiClient.patch(`/hr/${id}`, { deactivate: true });
    toast.success("HR user deactivated");
    fetchData();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {company?.name || "Company"} HR Users
          </h1>
          <p className="text-muted-foreground">
            View and manage HR accounts for this tenant.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/companies">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create HR</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <Input
            placeholder="hr@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            placeholder="GitHub username"
            value={githubUsername}
            onChange={(event) => setGithubUsername(event.target.value)}
          />
          <Button onClick={createHr}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>GitHub</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hrUsers.map((hr) => (
                <TableRow key={hr.id}>
                  <TableCell>{hr.email}</TableCell>
                  <TableCell>{hr.name || "-"}</TableCell>
                  <TableCell>{hr.githubUsername || "-"}</TableCell>
                  <TableCell>{hr.role}</TableCell>
                  <TableCell className="text-right">
                    {hr.role === "HR" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deactivate(hr.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && hrUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No HR users yet.
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
