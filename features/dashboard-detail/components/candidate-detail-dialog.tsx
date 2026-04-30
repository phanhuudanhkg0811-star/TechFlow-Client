/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  IconMail,
  IconBrandGithub,
  IconAlertTriangle,
  IconCode,
  IconInfoCircle,
} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import apiClient from "@/lib/apiClient";

export function CandidateDetailDialog({
  appId,
  open,
  onOpenChange,
}: {
  appId: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && appId) {
      setLoading(true);
      apiClient
        .get(`/dashboard/applications/${appId}`)
        .then((res) => setData(res.data))
        .finally(() => setLoading(false));
    }
  }, [open, appId]);

  if (!data) return null;

  const { user, report, testSession } = data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-muted/30 border-b">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <DialogTitle className="text-2xl">
                {user.name || "Ứng viên ẩn danh"}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <IconMail size={14} /> {user.email}
                </span>
                {user.githubUsername && (
                  <span className="flex items-center gap-1">
                    <IconBrandGithub size={14} /> {user.githubUsername}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">
                Điểm AI Match
              </div>
              <div className="text-3xl font-black text-indigo-600">
                {data.matchScore}%
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="assessment"
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-6 border-b bg-background">
            <TabsList className="h-12 bg-transparent gap-6">
              <TabsTrigger
                value="assessment"
                className="data-[state=active]:border-b-2 border-indigo-500 rounded-none bg-transparent"
              >
                Đánh giá AI
              </TabsTrigger>
              <TabsTrigger
                value="cv"
                className="data-[state=active]:border-b-2 border-indigo-500 rounded-none bg-transparent"
              >
                Nội dung CV
              </TabsTrigger>
              <TabsTrigger
                value="code"
                className="data-[state=active]:border-b-2 border-indigo-500 rounded-none bg-transparent"
              >
                Mã nguồn bài làm
              </TabsTrigger>
              <TabsTrigger
                value="interview"
                className="data-[state=active]:border-b-2 border-indigo-500 rounded-none bg-transparent"
              >
                Câu hỏi phỏng vấn
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            {/* TAB 1: ĐÁNH GIÁ AI */}
            <TabsContent value="assessment" className="mt-0 space-y-6">
              {/* Cảnh báo gian lận/Red flags */}
              {report?.riskFlags && report.riskFlags.length > 0 && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 dark:bg-red-950/20 border-red-200"
                >
                  <IconAlertTriangle className="size-5" />
                  <AlertTitle className="font-bold">
                    Cảnh báo nghi vấn (Risk Flags)
                  </AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc ml-4 mt-2">
                      {report.riskFlags.map((flag: string, i: number) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl bg-indigo-50/30">
                  <div className="text-sm font-bold text-indigo-600 uppercase mb-2">
                    Kiến trúc (Architecture)
                  </div>
                  <div className="text-2xl font-bold">
                    {report?.architectureScore || 0}/100
                  </div>
                </div>
                <div className="p-4 border rounded-xl bg-emerald-50/30">
                  <div className="text-sm font-bold text-emerald-600 uppercase mb-2">
                    Clean Code
                  </div>
                  <div className="text-2xl font-bold">
                    {report?.cleanCodeScore || 0}/100
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <IconInfoCircle size={18} /> Tóm tắt năng lực thực chiến
                </h3>
                <div className="prose prose-sm max-w-none bg-muted/30 p-4 rounded-xl border">
                  <ReactMarkdown>
                    {report?.summary || "AI đang tiến hành phân tích..."}
                  </ReactMarkdown>
                </div>
              </div>
            </TabsContent>
            {/* TAB 2: NỘI DUNG CV */}
            <TabsContent value="cv" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <IconInfoCircle size={18} /> Dữ liệu bóc tách từ PDF
                  </h3>
                  <Badge variant="secondary">AI Parsed</Badge>
                </div>

                <ScrollArea className="h-[500px] w-full rounded-xl border bg-white dark:bg-slate-950 p-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert font-sans leading-relaxed text-slate-700 dark:text-slate-300">
                    {/* Hiển thị nội dung cvText từ Database */}
                    {data.cvText ? (
                      <div className="whitespace-pre-wrap">{data.cvText}</div>
                    ) : (
                      <div className="text-center py-20 text-muted-foreground italic">
                        Không tìm thấy dữ liệu văn bản cho CV này.
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                  <strong>Lưu ý:</strong> Đây là nội dung văn bản mà AI đã trích
                  xuất để thực hiện chấm điểm Match Score.
                </div>
              </div>
            </TabsContent>
            {/* TAB 3: MÃ NGUỒN */}
            <TabsContent value="code" className="mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <IconCode size={18} /> Review Source Code
                  </h3>
                  <Badge variant="outline">Mã nguồn cuối cùng</Badge>
                </div>
                {testSession?.finalCode ? (
                  <div className="space-y-4">
                    {/* Render từng file code từ cục JSON finalCode */}
                    {Object.entries(testSession.finalCode).map(
                      ([path, file]: [string, any]) => (
                        <div
                          key={path}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="bg-muted px-3 py-1.5 text-xs font-mono border-b">
                            {path}
                          </div>
                          <pre className="p-4 text-xs bg-[#1e1e2e] text-slate-300 overflow-x-auto">
                            <code>
                              {file?.file?.contents || "// No content"}
                            </code>
                          </pre>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground italic">
                    Ứng viên chưa nộp bài hoặc bài làm trống.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 4: PHỎNG VẤN */}
            <TabsContent value="interview" className="mt-0 space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 p-4 rounded-xl">
                <p className="text-sm text-amber-800 dark:text-amber-400">
                  Dưới đây là bộ câu hỏi được AI tự động biên soạn dựa trên{" "}
                  <strong>sai sót trong code</strong> và{" "}
                  <strong>điểm nghi vấn trên CV</strong> của ứng viên.
                </p>
              </div>

              <div className="space-y-4">
                {report?.interviewQuestions?.map((q: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 border rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="font-bold text-indigo-600 mb-1">
                      Câu hỏi {i + 1}:
                    </div>
                    <p className="text-sm font-medium mb-3">{q.question}</p>
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                      Mục đích kiểm tra:
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      {q.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
