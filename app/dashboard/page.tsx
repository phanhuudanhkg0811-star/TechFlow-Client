"use client";

import { useEffect, useState } from "react";
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
import { IconUsers, IconCodeDots, IconCpu, IconCircleCheck, IconLoader } from "@tabler/icons-react";
import apiClient from "@/lib/apiClient";

// Define types for the data from the backend
interface StatsData {
  totalCandidates: number;
  runningTests: number;
  analyzedByAI: number;
  hired: number;
}

interface ApplicationData {
  id: string;
  candidate: string;
  job: string;
  score: number | null;
  status: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentApplications, setRecentApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, appsRes] = await Promise.all([
          apiClient.get<StatsData>("/dashboard/stats"),
          apiClient.get<ApplicationData[]>("/dashboard/recent-applications"),
        ]);
        setStats(statsRes.data);
        setRecentApplications(appsRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // You can set an error state here to show an error message in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsCards = [
    { title: "Tổng ứng viên", value: stats?.totalCandidates ?? "...", icon: <IconUsers className="text-blue-500" /> },
    { title: "Bài test đang chạy", value: stats?.runningTests ?? "...", icon: <IconCodeDots className="text-orange-500" /> },
    { title: "AI đã phân tích", value: stats?.analyzedByAI ?? "...", icon: <IconCpu className="text-purple-500" /> },
    { title: "Đã tuyển dụng", value: stats?.hired ?? "...", icon: <IconCircleCheck className="text-green-500" /> },
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <IconLoader className="animate-spin size-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 4 Thẻ thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => (
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
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <TableRow key={app.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-muted-foreground">{app.id}</TableCell>
                    <TableCell className="font-semibold">{app.candidate}</TableCell>
                    <TableCell>{app.job}</TableCell>
                    <TableCell className="text-center">
                      {app.score != null ? (
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    Không có hoạt động ứng tuyển nào gần đây.
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