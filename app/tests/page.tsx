"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  IconClock,
  IconCode,
  IconBriefcase,
  IconArrowRight,
  IconEye,
} from "@tabler/icons-react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import ReactMarkdown from "react-markdown";
// 1. Định nghĩa Type cho Mock Data
type MockApplication = {
  id: string;
  status: "TESTING" | "REVIEWING" | "COMPLETED" | "REJECTED";
  jobTitle: string;
  scenario: {
    id: string;
    title: string;
    difficulty: string;
    timeLimit: number;
    contextMarkdown: string; // Thêm field Markdown để hiện trong Popup
  };
};

export default function CandidateTestsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<MockApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State quản lý việc mở Popup (Lưu trữ bài Test đang được chọn)
  const [selectedTest, setSelectedTest] = useState<MockApplication | null>(
    null,
  );

  // 2. Mock API
  useEffect(() => {
    const fetchTests = async () => {
      setTimeout(() => {
        setApplications([
          {
            id: "app-uuid-1",
            status: "TESTING",
            jobTitle: "Backend Engineer (NestJS & PostgreSQL)",
            scenario: {
              id: "scenario-1",
              title: "Xử lý Race Condition trong Payment Service",
              difficulty: "Mid-level",
              timeLimit: 90,
              contextMarkdown:
                "### Bối cảnh\nHệ thống thanh toán đang gặp lỗi Race Condition khi nhiều user mua hàng cùng lúc...\n\n### Yêu cầu\n- Sử dụng Prisma Transaction.\n- Viết lại Clean Code.",
            },
          },
          {
            id: "app-uuid-2",
            status: "COMPLETED",
            jobTitle: "Frontend React Developer",
            scenario: {
              id: "scenario-2",
              title: "Tối ưu hóa Re-render với Zustand",
              difficulty: "Junior",
              timeLimit: 60,
              contextMarkdown:
                "Hệ thống giỏ hàng đang bị giật lag do re-render toàn trang. Hãy tách state và sử dụng Zustand để tối ưu lại luồng dữ liệu.",
            },
          },
        ]);
        setIsLoading(false);
      }, 800);
    };
    fetchTests();
  }, []);

  const handleStartTest = (testId: string) => {
    router.push(`/tests/${testId}`);
  };

  return (
    <div className="min-h-screen bg-background/50 py-10">
      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Header Section */}
        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Danh sách bài kiểm tra
          </h1>
          <p className="text-muted-foreground">
            Chọn bài kiểm tra của bạn. Hãy xem kỹ chi tiết bối cảnh trước khi
            vào phòng thi.
          </p>
        </div>

        {/* Danh sách bài test (Không dùng Tab) */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spinner className="text-foreground size-5" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {applications.map((app) => (
              <Card
                key={app.id}
                className={`flex flex-col md:flex-row md:items-center justify-between border-border/40 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 ${app.status !== "TESTING" ? "opacity-70 grayscale-[0.2]" : ""}`}
              >
                {/* Cột trái: Thông tin cơ bản */}
                <CardHeader className="flex-1 pb-4 md:pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconBriefcase size={16} />
                      <span className="font-medium">{app.jobTitle}</span>
                      <Badge variant="outline" className="ml-2 font-normal">
                        {app.scenario.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-foreground">
                      {app.scenario.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                      <span className="flex items-center gap-1.5">
                        <IconClock size={16} className="text-primary" />{" "}
                        {app.scenario.timeLimit} Phút
                      </span>
                      <span className="flex items-center gap-1.5">
                        <IconCode size={16} className="text-primary" /> Web-IDE
                      </span>
                    </div>
                  </div>
                </CardHeader>

                {/* Cột phải: Các nút hành động */}
                <CardFooter className="flex gap-3 pt-0 md:pt-6 pb-6 md:pr-6 justify-start md:justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedTest(app)}
                  >
                    <IconEye size={18} className="mr-2" /> Chi tiết
                  </Button>

                  {app.status === "TESTING" ? (
                    <Button onClick={() => handleStartTest(app.id)}>
                      Vào thi <IconArrowRight size={18} className="ml-2" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900"
                    >
                      <CheckCircle size={18} className="mr-2" /> Đã nộp bài
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Popup (Dialog) hiển thị chi tiết Context */}
      <Dialog
        open={!!selectedTest}
        onOpenChange={(open) => !open && setSelectedTest(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedTest?.scenario.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-2">
              <Badge variant="secondary">{selectedTest?.jobTitle}</Badge>
              <Badge variant="outline">
                <IconClock size={14} className="mr-1" />{" "}
                {selectedTest?.scenario.timeLimit} Phút
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {/* Khu vực cuộn dành cho văn bản thuần túy (Plain Text) */}
          <div className="flex-1 overflow-y-auto pr-2 py-4 prose prose-sm dark:prose-invert max-w-none border-y border-border/50 my-2">
            <ReactMarkdown>
              {selectedTest?.scenario.contextMarkdown || ""}
            </ReactMarkdown>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button variant="outline" onClick={() => setSelectedTest(null)}>
              Đóng
            </Button>
            {selectedTest?.status === "TESTING" && (
              <Button onClick={() => handleStartTest(selectedTest.id)}>
                Bắt đầu làm bài <IconArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
