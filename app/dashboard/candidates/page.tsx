/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconEye, IconSearch, IconUsers } from "@tabler/icons-react";
import apiClient from "@/lib/apiClient";
import { CandidateDetailDialog } from "@/features/dashboard-detail/components/candidate-detail-dialog";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function AllCandidatesPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get("/dashboard/recent-applications")
      .then(res => {
        console.log(res);
        const data = res.data;
        console.log(data);
        setApplications(data);
      })
      .catch(err => {
        console.error("Lỗi tải danh sách ứng viên:", err);
        toast.error("Không thể tải danh sách ứng viên lúc này.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filteredApps = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = app.candidate?.toLowerCase().includes(query) || false;
    const jobMatch = app.job?.toLowerCase().includes(query) || false;
    const idMatch = app.id?.toLowerCase().includes(query) || false;
    return nameMatch || jobMatch || idMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SCREENING': return <Badge variant="secondary">Lọc CV</Badge>;
      case 'TESTING': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Đang code</Badge>;
      case 'REVIEWING': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">AI đang chấm</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Hoàn thành</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Loại</Badge>;
      default: return <Badge variant="outline" className="capitalize">{status?.toLowerCase() || "N/A"}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <IconUsers className="text-primary" size={28} />
            Hồ sơ Ứng viên
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý và tra cứu toàn bộ hồ sơ ứng viên từ tất cả các chiến dịch.
          </p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-lg font-semibold">Danh sách tổng hợp</CardTitle>
            
            <div className="relative w-full sm:w-80">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input 
                placeholder="Tìm tên, mã ID hoặc chiến dịch..." 
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner className="size-8 text-primary mb-4" />
              <p className="text-sm text-muted-foreground animate-pulse">Đang tải dữ liệu ứng viên...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30 hover:bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[300px] pl-6">Thông tin ứng viên</TableHead>
                    <TableHead>Vị trí ứng tuyển</TableHead>
                    <TableHead className="text-center">Điểm AI Match</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right pr-6">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.length > 0 ? (
                    filteredApps.map((app: any) => (
                      <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            {/* ĐÃ SỬA: Map đúng property `app.candidate` */}
                            <Avatar className="size-10 border border-border/50">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {app.candidate?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate">
                                {app.candidate || "Chưa cập nhật tên"}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                ID: {app.id}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                            {app.job || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {app.score != null ? (
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/20">
                              <span className="text-lg font-black text-primary">
                                {Math.round(app.score)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(app.status)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="bg-secondary/60 hover:bg-secondary gap-1.5"
                            onClick={() => setSelectedAppId(app.id)}
                          >
                            <IconEye size={16} /> 
                            <span className="hidden sm:inline">Chi tiết</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        {searchQuery ? "Không tìm thấy ứng viên nào phù hợp với từ khóa." : "Chưa có dữ liệu ứng viên."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CandidateDetailDialog 
        appId={selectedAppId!} 
        open={!!selectedAppId} 
        onOpenChange={(open) => !open && setSelectedAppId(null)} 
      />
    </div>
  );
}