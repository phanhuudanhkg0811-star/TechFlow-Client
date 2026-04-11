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

type TestSessionData = {
  id: string;
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

  useEffect(() => {
    apiClient
      .get(`/tests/${testId}`)
      .then((response) => {
        setTest(response.data);
      })
      .catch((err) => {
        console.error("Lỗi tải thông tin bài test:", err);
      });
  }, [testId]);

  const handleSubmitTest = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn nộp bài? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(`/tests/${testId}/submit`);
      toast.success("Nộp bài thành công! AI đang tiến hành phân tích mã nguồn của bạn.");
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
                  <Button variant="ghost" className="w-fit! p-1.5! h-7! hover:bg-muted/50" asChild>
                    <Link href="/tests">
                      <button className="flex gap-2 items-center">
                        <IconSparkles className="text-primary" size={18} />
                        <span className={cn("text-sm font-bold tracking-tight", font.className)}>
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
              <TooltipContent>Mã nguồn của bạn được tự động sao lưu</TooltipContent>
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

          <div className="hidden md:flex items-center gap-2 text-sm font-mono text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-md">
            <IconClock size={16} />
            <span>89:45</span>
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