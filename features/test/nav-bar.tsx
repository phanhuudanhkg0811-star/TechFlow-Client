/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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

type TestSessionData = {
  id: string;
  startTime: string;
  scenario: {
    id: string;
    title: string;
    context: string;
    timeLimit: number;
  };
  updatedAt: string;
};

export const Navbar = ({ testId }: { testId: string }) => {
  const router = useRouter();
  const [test, setTest] = useState<TestSessionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Refs chỉ dùng trong handler và effect, không dùng trong render
  const isSubmittingRef = useRef(false);
  const hasSubmittedRef = useRef(false);

  // Kiểm tra trạng thái đã nộp từ localStorage
  useEffect(() => {
    const already = localStorage.getItem(`submitted_${testId}`);
    if (already === "true") {
      hasSubmittedRef.current = true;
      setHasSubmitted(true);
    }
  }, [testId]);

  // Lấy thông tin bài test
  useEffect(() => {
    apiClient
      .get(`/tests/${testId}`)
      .then((response) => {
        const data = response.data;
        setTest(data);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmitTest = async () => {
    if (isSubmittingRef.current || hasSubmittedRef.current) return;

    if (
      !window.confirm(
        "Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.",
      )
    )
      return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const savedFiles = localStorage.getItem(`ide_files_${testId}`);
      if (!savedFiles) {
        toast.error("Không có mã nguồn để nộp.");
        return;
      }

      let filesArr;
      try {
        filesArr = JSON.parse(savedFiles);
      } catch (parseErr) {
        console.error("Lỗi parse localStorage", parseErr);
        toast.error("Dữ liệu bài làm bị hỏng, vui lòng tải lại trang.");
        return;
      }

      const getFullPath = (fileId: string, allFiles: any[]): string => {
        const file = allFiles.find((f) => f.id === fileId);
        if (!file) return "";
        if (!file.parentId) return file.name;
        return `${getFullPath(file.parentId, allFiles)}/${file.name}`;
      };

      const SKIP_DIRS = [
        "node_modules",
        "dist",
        "build",
        ".next",
        ".git",
        "__pycache__",
        "venv",
        ".venv",
      ];
      const KEEP_EXTENSIONS = [
        ".js",
        ".ts",
        ".jsx",
        ".tsx",
        ".py",
        ".java",
        ".go",
        ".json",
        ".html",
        ".css",
        ".vue",
        ".svelte",
      ];
      const MAX_TOTAL_CHARS = 250_000;

      const finalCode: Record<string, { file: { contents: string } }> = {};
      let totalChars = 0;

      for (const file of filesArr) {
        if (file.type !== "file") continue;
        const fullPath = getFullPath(file.id, filesArr);
        if (
          SKIP_DIRS.some(
            (dir) =>
              fullPath.includes(`/${dir}/`) || fullPath.startsWith(`${dir}/`),
          )
        )
          continue;
        const ext = fullPath.substring(fullPath.lastIndexOf("."));
        if (!KEEP_EXTENSIONS.includes(ext)) continue;
        const content = file.content || "";
        if (content.length > 100_000) continue;
        if (totalChars + content.length > MAX_TOTAL_CHARS) {
          console.warn(`Vượt quá giới hạn ký tự, bỏ qua các file còn lại.`);
          break;
        }
        finalCode[fullPath] = { file: { contents: content } };
        totalChars += content.length;
      }

      if (Object.keys(finalCode).length === 0) {
        toast.error("Không có file code hợp lệ để nộp.");
        return;
      }

      console.log(
        `📦 Nộp ${Object.keys(finalCode).length} file, tổng ${totalChars} ký tự`,
      );

      await apiClient.post(`/tests/${testId}/submit`, { finalCode });

      localStorage.setItem(`submitted_${testId}`, "true");
      hasSubmittedRef.current = true;
      setHasSubmitted(true);

      toast.success("Nộp bài thành công! AI đang phân tích...");
      setTimeout(() => router.push("/tests"), 1500);
    } catch (error: any) {
      console.error("Submit error:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Lỗi khi nộp bài, thử lại sau.";
      toast.error(message);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Đếm ngược và tự động nộp khi hết giờ
  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) {
      if (secondsLeft === 0 && !hasSubmittedRef.current && !isSubmittingRef.current) {
        handleSubmitTest();
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

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

          <div
            className={cn(
              "hidden md:flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-md transition-colors",
              secondsLeft !== null && secondsLeft < 300
                ? "text-red-500 bg-red-500/10 animate-pulse"
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
            disabled={isSubmitting || hasSubmitted}
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