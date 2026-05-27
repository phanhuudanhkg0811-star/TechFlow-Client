"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import { Spinner } from "@/components/ui/spinner";
import apiClient from "@/lib/apiClient";

import {
  IconClock,
  IconCode,
  IconBriefcase,
  IconArrowRight,
  IconEye,
} from "@tabler/icons-react";
import { ArrowLeft, CheckCircle } from "lucide-react";

// Ánh xạ chính xác với Schema Prisma của bạn
type ApplicationData = {
  id: string; // ID của đơn ứng tuyển
  status: "SCREENING" | "TESTING" | "REVIEWING" | "COMPLETED" | "REJECTED";
  job: {
    title: string;
  };
  testSession: {
    id: string; // Đây là testId sẽ đẩy lên URL
    scenario: {
      title: string;
      difficulty: string;
      timeLimit: number;
      context: string;
    };
  } | null;
};

export default function CandidateTestsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);

  useEffect(() => {
    apiClient
      .get("/application/my-tests")
      .then((res) => {
        // Đảm bảo setApplications luôn nhận một mảng
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setApplications(data);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh sách bài thi:", err);
        setApplications([]); // Chống sập UI
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleStartTest = (testSessionId: string) => {
    router.push(`/tests/${testSessionId}`);
  };

  return (
    <div className="min-h-screen bg-background/50 py-10 relative">
      {/* Background trang trí */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

      <Link
        href="/"
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4 bg-background/50 backdrop-blur-sm",
        })}
      >
        <ArrowLeft className="size-4 mr-2" />
        Trở về
      </Link>

      <div className="max-w-4xl mx-auto px-6 space-y-10">
        <div className="space-y-3 text-center md:text-left mt-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Không gian Khảo thí
          </h1>
          <p className="text-muted-foreground text-lg">
            Khẳng định năng lực thực chiến của bạn. Hãy xem kỹ yêu cầu trước khi
            khởi tạo môi trường IDE.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <Spinner className="text-primary size-8" />
            <p className="text-muted-foreground animate-pulse">
              Đang tải dữ liệu bài thi...
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/10">
            <IconBriefcase className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Bạn chưa có bài kiểm tra nào được giao.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications.map((app) => {
              const isTestable = app.status === "TESTING" && app.testSession;

              return (
                <Card
                  key={app.id}
                  className={`group flex flex-col md:flex-row md:items-center justify-between border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-lg transition-all duration-300 ${!isTestable ? "opacity-75 grayscale-[0.3]" : "hover:-translate-y-1"}`}
                >
                  <CardHeader className="flex-1 pb-4 md:pb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconBriefcase size={16} className="text-primary/70" />
                        <span className="font-medium">{app.job.title}</span>
                        {app.testSession && (
                          <Badge
                            variant="secondary"
                            className="ml-2 font-normal bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            {app.testSession.scenario.difficulty}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl text-foreground">
                        {app.testSession?.scenario.title ||
                          "Chưa phân bổ đề thi"}
                      </CardTitle>

                      {app.testSession && (
                        <div className="flex items-center gap-5 text-sm text-muted-foreground pt-2">
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                            <IconClock size={16} className="text-orange-500" />{" "}
                            <span className="font-medium">
                              {app.testSession.scenario.timeLimit} Phút
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-md">
                            <IconCode size={16} className="text-blue-500" />{" "}
                            Web-IDE
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardFooter className="flex gap-3 pt-0 md:pt-6 pb-6 md:pr-6 justify-start md:justify-end">
                    {app.testSession && (
                      <Button
                        variant="secondary"
                        className="bg-secondary/50 hover:bg-secondary"
                        onClick={() => setSelectedApp(app)}
                      >
                        <IconEye size={18} className="mr-2" /> Chi tiết
                      </Button>
                    )}

                    {isTestable == false ? (
                      <Button
                        onClick={() => handleStartTest(app.testSession!.id)}
                        className="shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow"
                      >
                        Vào phòng thi{" "}
                        <IconArrowRight size={18} className="ml-2" />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        disabled
                        className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900"
                      >
                        <CheckCircle size={18} className="mr-2" />{" "}
                        {app.status === "SCREENING"
                          ? "Đang chờ duyệt"
                          : "Đã hoàn thành"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedApp}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl border-border/50 shadow-2xl">
          <DialogHeader className="p-6 bg-muted/30 border-b border-border/40">
            <DialogTitle className="text-2xl font-bold">
              {selectedApp?.testSession?.scenario.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-3 pt-3">
              <Badge variant="outline" className="bg-background">
                {selectedApp?.job.title}
              </Badge>
              <Badge
                variant="secondary"
                className="text-orange-600 bg-orange-100 dark:bg-orange-900/30"
              >
                <IconClock size={14} className="mr-1" />{" "}
                {selectedApp?.testSession?.scenario.timeLimit} Phút
              </Badge>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none bg-background">
            <ReactMarkdown>
              {selectedApp?.testSession?.scenario.context ||
                "Chưa có nội dung chi tiết."}
            </ReactMarkdown>
          </div>

          <DialogFooter className="p-4 border-t border-border/40 bg-muted/10 sm:justify-end">
            <Button variant="ghost" onClick={() => setSelectedApp(null)}>
              Đóng
            </Button>
            {selectedApp?.status === "TESTING" && selectedApp?.testSession && (
              <Button
                onClick={() => handleStartTest(selectedApp.testSession!.id)}
              >
                Khởi tạo IDE <IconArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
