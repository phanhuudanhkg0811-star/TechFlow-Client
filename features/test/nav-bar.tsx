/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Poppins } from "next/font/google";
import { toast } from "sonner";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

import {
  IconSparkles,
  IconCloudCheck,
  IconLoader2,
  IconClock,
  IconSend,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Info } from "lucide-react";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// 1. Cập nhật Type để nhận thêm startTime từ Backend
type TestSessionData = {
  id: string;
  startTime: string; // ISO String từ DB
  scenario: {
    id: string;
    title: string;
    context: string;
    timeLimit: number; // Phút
  };
  updatedAt: string;
};

export const Navbar = ({ testId }: { testId: string }) => {
  const router = useRouter();
  const [test, setTest] = useState<TestSessionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State lưu số giây còn lại
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    apiClient
      .get(`/tests/${testId}`)
      .then((response) => {
        const data = response.data;
        setTest(data);

        // 2. Tính toán thời gian còn lại ngay khi load dữ liệu
        if (data.startTime && data.scenario.timeLimit) {
          const start = new Date(data.startTime).getTime();
          const limitInMs = data.scenario.timeLimit * 60 * 1000;
          const now = Date.now();

          const remainingSeconds = Math.floor((start + limitInMs - now) / 1000);
          setSecondsLeft(remainingSeconds > 0 ? remainingSeconds : 0);
        }
      })
      .catch((err) => console.error("Lỗi tải thông tin bài test:", err));
  }, [testId]);

  // 3. Hiệu ứng đếm ngược mỗi giây
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) {
      if (secondsLeft === 0 && !isSubmitting) {
        // Tự động nộp bài khi hết giờ (Tùy chọn)
        // handleSubmitTest();
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isSubmitting]);

  // 4. Hàm định dạng giây thành MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitTest = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.",
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Lấy mảng files ứng viên đã code từ Local Storage
      const savedFiles = localStorage.getItem(`ide_files_${testId}`);
      
      // 2. Chuyển đổi thành Object phẳng chứa Code để gửi lên Backend
      // Dạng mong đợi: { "src/main.jsx": { file: { contents: "..." } } }
      const finalCode: Record<string, any> = {};
      
      if (savedFiles) {
        const filesArr = JSON.parse(savedFiles);
        
        // Hàm đệ quy nhỏ để lấy đường dẫn đầy đủ (VD: src/components/Button.jsx)
        const getFullPath = (fileId: string, allFiles: any[]): string => {
          const file = allFiles.find((f) => f.id === fileId);
          if (!file) return "";
          if (!file.parentId) return file.name;
          return `${getFullPath(file.parentId, allFiles)}/${file.name}`;
        };

        filesArr.forEach((f: any) => {
          if (f.type === "file") {
            const fullPath = getFullPath(f.id, filesArr);
            finalCode[fullPath] = { file: { contents: f.content || "" } };
          }
        });
      }

      // 3. NHÉT finalCode VÀO BODY REQUEST
      await apiClient.post(`/tests/${testId}/submit`, { finalCode });

      toast.success(
        "Nộp bài thành công! AI đang tiến hành phân tích mã nguồn của bạn.",
      );
      setTimeout(() => {
        router.push("/tests");
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi nộp bài:", error);
      toast.error("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.");
      setIsSubmitting(false);
    }
  };

  return (
    <TooltipProvider>
      <nav className="flex justify-between items-center gap-x-2 px-4 py-2 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-x-3">
          <Breadcrumb>
            <BreadcrumbList className="gap-0!">
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-1.5" asChild>
                  <Button
                    variant="ghost"
                    className="w-fit! p-1.5! h-7! hover:bg-muted/50"
                    asChild
                  >
                    <Link href="/tests">
                      <button className="flex gap-2 items-center">
                        <IconSparkles className="text-primary" size={18} />
                        <span
                          className={cn(
                            "text-sm font-bold tracking-tight",
                            font.className,
                          )}
                        >
                          AI-TechFlow
                        </span>
                      </button>
                    </Link>
                  </Button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="ml-0! mr-1" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium max-w-64 truncate px-2 py-1 rounded-md">
                  {test?.scenario?.title ?? "Đang tải dữ liệu..."}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="ml-2 flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-help">
                  <IconCloudCheck className="size-4 text-green-500" />
                  <span className="text-[11px] font-medium hidden sm:inline-block">
                    {test?.updatedAt ? `Đã lưu tự động` : ""}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Mã nguồn của bạn được tự động sao lưu
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Info className="size-4 mr-1.5" />
                Chi tiết
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{test?.scenario?.title}</DialogTitle>
                <DialogDescription>
                  Đọc kỹ yêu cầu bài toán trước khi thực hiện.
                </DialogDescription>
              </DialogHeader>
              <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4 whitespace-pre-wrap font-mono text-sm">
                {test?.scenario?.context ?? "Chưa có nội dung mô tả."}
              </div>
            </DialogContent>
          </Dialog>

          {/* 5. Cập nhật UI hiển thị thời gian thực */}
          <div
            className={cn(
              "hidden md:flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-md transition-colors",
              secondsLeft !== null && secondsLeft < 300
                ? "text-red-500 bg-red-500/10 animate-pulse" // Cảnh báo khi còn dưới 5 phút
                : "text-orange-500 bg-orange-500/10",
            )}
          >
            <IconClock size={16} />
            <span>
              {secondsLeft !== null ? formatTime(secondsLeft) : "--:--"}
            </span>
          </div>

          <Button
            size="sm"
            className="h-8 bg-primary gap-1.5"
            onClick={handleSubmitTest}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconSend className="size-4" />
            )}
            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </div>
      </nav>
    </TooltipProvider>
  );
};
