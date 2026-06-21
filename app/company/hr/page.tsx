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

interface HrUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

const loadHrUsers = async (companyId: string) => {
  const res = await apiClient.get<HrUser[]>(`/companies/${companyId}/hr`);
  return res.data;
};

export default function CompanyHrPage() {
  const { user } = useCurrentUser();
  const companyId = user?.companyId || user?.company?.id;
  const [hrUsers, setHrUsers] = useState<HrUser[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const fetchHr = async () => {
    if (!companyId) return;
    setHrUsers(await loadHrUsers(companyId));
  };

  useEffect(() => {
    if (!companyId) return;

    let isMounted = true;
    loadHrUsers(companyId).then((data) => {
      if (isMounted) setHrUsers(data);
    });

    return () => {
      isMounted = false;
    };
  }, [companyId]);

  const createHr = async () => {
    if (!companyId || !email.trim()) return;
    await apiClient.post(`/companies/${companyId}/hr`, {
      email,
      name: name || undefined,
    });
    toast.success("HR user created");
    setEmail("");
    setName("");
    fetchHr();
  };

  const deactivate = async (id: string) => {
    await apiClient.patch(`/hr/${id}`, { deactivate: true });
    toast.success("HR user deactivated");
    fetchHr();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HR Management</h1>
        <p className="text-muted-foreground">
          Invite and manage HR accounts inside your company.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create HR</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
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
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hrUsers.map((hr) => (
                <TableRow key={hr.id}>
                  <TableCell>{hr.email}</TableCell>
                  <TableCell>{hr.name || "-"}</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
