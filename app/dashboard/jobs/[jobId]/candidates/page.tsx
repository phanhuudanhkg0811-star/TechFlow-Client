/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconEye, IconChevronLeft } from "@tabler/icons-react";
import Link from "next/link";
import apiClient from "@/lib/apiClient";
import { CandidateDetailDialog } from "@/features/dashboard-detail/components/candidate-detail-dialog";

export default function JobLeaderboard() {
  const { jobId } = useParams();
  const [data, setData] = useState<any>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get(`/dashboard/jobs/${jobId}/leaderboard`).then(res => setData(res.data));
  }, [jobId]);

  if (!data) return <div className="p-10 text-center">Đang tải danh sách ứng viên...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/jobs"><IconChevronLeft /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Bảng xếp hạng ứng viên</h1>
          <p className="text-muted-foreground">Vị trí: {data.jobTitle}</p>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Ứng viên</TableHead>
              <TableHead className="text-center">Điểm AI Match</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.leaderboard.map((app: any) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={app.user.avatarUrl} />
                      <AvatarFallback>{app.user.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold">{app.user.name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{app.user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-lg font-black text-indigo-600">{app.matchScore || 0}%</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{app.status.toLowerCase()}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedAppId(app.id)}>
                    <IconEye size={16} className="mr-2" /> Chi tiết & Code
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CandidateDetailDialog 
        appId={selectedAppId!} 
        open={!!selectedAppId} 
        onOpenChange={(o) => !o && setSelectedAppId(null)} 
      />
    </div>
  );
}