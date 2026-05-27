/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import apiClient from "@/lib/apiClient";
import ReactMarkdown from "react-markdown";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Import để ẩn Title nếu không muốn show

interface CandidateDetailDialogProps {
  appId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CandidateDetailDialog = ({
  appId,
  open,
  onOpenChange,
}: CandidateDetailDialogProps) => {
  const [candidateData, setCandidateData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && appId) {
      setIsLoading(true);
      apiClient
        .get(`/dashboard/applications/${appId}`)
        .then((res) => setCandidateData(res.data))
        .catch((err) => console.error("Error fetching candidate details:", err))
        .finally(() => setIsLoading(false));
    } else {
      setCandidateData(null);
    }
  }, [open, appId]);

  // 1. TRẠNG THÁI LOADING
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] overflow-hidden gap-0 p-0 rounded-xl border-border/50 shadow-2xl">
          {/* FIX LỖI ACCESSIBILITY: Thêm Title ẩn cho Radix */}
          <VisuallyHidden>
            <DialogTitle>Đang tải dữ liệu ứng viên</DialogTitle>
            <DialogDescription>
              Vui lòng đợi trong giây lát...
            </DialogDescription>
          </VisuallyHidden>

          <div className="flex flex-col items-center justify-center h-64">
            <Spinner className="text-primary size-8" />
            <p className="text-muted-foreground mt-4">
              Đang tải chi tiết ứng viên...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 2. TRẠNG THÁI LỖI (KHÔNG TÌM THẤY DỮ LIỆU)
  if (!candidateData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] overflow-hidden gap-0 p-0 rounded-xl border-border/50 shadow-2xl">
          <DialogHeader className="flex-none p-6 bg-muted/30 border-b border-border/40">
            <DialogTitle>Không tìm thấy dữ liệu ứng viên</DialogTitle>
            <DialogDescription>
              Dữ liệu ứng viên này không tồn tại hoặc đã bị xóa.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none bg-background">
            <p className="text-muted-foreground">
              Có lỗi xảy ra hoặc không tìm thấy thông tin ứng viên.
            </p>
          </div>
          <DialogFooter className="flex-none p-4 border-t border-border/40 bg-muted/10 sm:justify-end">
            <Button onClick={() => onOpenChange(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const { user, cvText, matchScore, assessmentReport } = candidateData;

  // 3. TRẠNG THÁI HIỂN THỊ DỮ LIỆU THÀNH CÔNG
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] overflow-hidden gap-0 p-0 rounded-xl border-border/50 shadow-2xl">
        
        {/* FIX LỖI TABS: Bọc TOÀN BỘ Header và Body vào trong thẻ <Tabs> */}
        <Tabs defaultValue="cv" className="flex flex-col h-full overflow-hidden">
          
          <DialogHeader className="flex-none p-6 bg-muted/30 border-b border-border/40">
            <DialogTitle className="text-2xl font-bold">
              {user?.name || user?.email}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {user?.email}
            </DialogDescription>
            
            {/* TabsList nằm trong Header để luôn hiển thị */}
            <div className="mt-4">
              <TabsList>
                <TabsTrigger value="cv">CV</TabsTrigger>
                <TabsTrigger value="github">GitHub Review</TabsTrigger>
                <TabsTrigger value="test">Bài làm</TabsTrigger>
              </TabsList>
            </div>
          </DialogHeader>

          {/* Phần Body: chiếm hết không gian còn lại và có thanh cuộn dọc */}
          <div className="flex-1 overflow-y-auto p-6 bg-background">
            <TabsContent value="cv" className="mt-0 outline-none prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-2">CV Content</h3>
              <p className="mb-4"><strong>Match Score:</strong> {matchScore}%</p>
              <ReactMarkdown>{cvText}</ReactMarkdown>
            </TabsContent>
            
            <TabsContent value="github" className="mt-0 outline-none prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-2">GitHub Review</h3>
              {assessmentReport ? (
                <ReactMarkdown>{assessmentReport.summary}</ReactMarkdown>
              ) : (
                <p>Không có báo cáo GitHub.</p>
              )}
            </TabsContent>
            
            <TabsContent value="test" className="mt-0 outline-none prose prose-sm dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-2">Bài làm của ứng viên</h3>
              <p>Chưa có dữ liệu bài làm.</p>
            </TabsContent>
          </div>

        </Tabs>

        <DialogFooter className="flex-none p-4 border-t border-border/40 bg-muted/10 sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};