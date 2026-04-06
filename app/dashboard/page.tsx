"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { IconUsers, IconCodeDots, IconCpu, IconCircleCheck } from "@tabler/icons-react";

export default function DashboardOverview() {
  // Dữ liệu Mock chuẩn khớp với Prisma Schema của ông
  const stats = [
    { title: "Tổng ứng viên", value: "128", icon: <IconUsers className="text-blue-500" /> },
    { title: "Bài test đang chạy", value: "14", icon: <IconCodeDots className="text-orange-500" /> },
    { title: "AI đã phân tích", value: "85", icon: <IconCpu className="text-purple-500" /> },
    { title: "Đã tuyển dụng", value: "12", icon: <IconCircleCheck className="text-green-500" /> },
  ];

  const recentApplications = [
    { id: "APP-001", candidate: "Nguyen Van A", job: "Backend Engineer (NestJS)", score: 85, status: "REVIEWING" },
    { id: "APP-002", candidate: "Tran Thi B", job: "Frontend React", score: 92, status: "COMPLETED" },
    { id: "APP-003", candidate: "Le Van C", job: "DevOps Engineer", score: null, status: "TESTING" },
    { id: "APP-004", candidate: "Pham Dinh D", job: "Backend Engineer (NestJS)", score: 45, status: "REJECTED" },
  ];

  // Helper function để tô màu Badge trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCREENING': return <Badge variant="secondary">Lọc CV</Badge>;
      case 'TESTING': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Đang code</Badge>;
      case 'REVIEWING': return <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">AI đang chấm</Badge>;
      case 'COMPLETED': return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Hoàn thành</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Loại</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 4 Thẻ thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bảng danh sách ứng viên mới nhất */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Hoạt động ứng tuyển gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Mã ID</TableHead>
                <TableHead>Ứng viên</TableHead>
                <TableHead>Vị trí ứng tuyển</TableHead>
                <TableHead className="text-center">Điểm AI (100)</TableHead>
                <TableHead className="text-right">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentApplications.map((app) => (
                <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-muted-foreground">{app.id}</TableCell>
                  <TableCell className="font-semibold">{app.candidate}</TableCell>
                  <TableCell>{app.job}</TableCell>
                  <TableCell className="text-center">
                    {app.score ? (
                      <span className={`font-bold ${app.score >= 80 ? 'text-green-600' : app.score < 50 ? 'text-red-500' : 'text-yellow-600'}`}>
                        {app.score}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {getStatusBadge(app.status)}
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