// file: features/dashboard-detail/components/candidate-detail-dialog.tsx
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  AlertTriangle,
  ShieldCheck,
  Code,
  FileQuestion,
  CheckCircle2,
  XCircle,
  Lightbulb,
  TerminalSquare,
} from "lucide-react";

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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] overflow-hidden gap-0 p-0 rounded-xl border-border/50 shadow-2xl">
          <VisuallyHidden>
            <DialogTitle>Đang tải dữ liệu</DialogTitle>
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

  if (!candidateData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl flex flex-col max-h-[90vh] overflow-hidden gap-0 p-0 rounded-xl border-border/50 shadow-2xl">
          <DialogHeader className="p-6">
            <DialogTitle>Không tìm thấy dữ liệu</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const { user, cvText, matchScore, report: assessmentReport } = candidateData;

  // Bóc tách dữ liệu riskFlags an toàn
  const flags =
    typeof assessmentReport?.riskFlags === "object" &&
    assessmentReport.riskFlags !== null
      ? assessmentReport.riskFlags
      : {};

  // Lọc ra các cảnh báo rủi ro chung (ví dụ các key "0", "1", "2" từ hệ thống review cũ)
  const knownKeys = [
    "generalFeedback",
    "passedRequirements",
    "failedRequirements",
    "notableCode",
    "tabSwitchCount",
    "copiedCode",
    "reason",
  ];
  const generalRisks = Object.keys(flags)
    .filter((key) => !knownKeys.includes(key))
    .map((key) => flags[key]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none sm:max-w-[1200px] w-[95vw] flex flex-col max-h-[95vh] h-[95vh] overflow-hidden gap-0 p-0 rounded-xl border-border/50 shadow-2xl bg-background">
        <Tabs
          defaultValue="assessment"
          className="flex flex-col h-full overflow-hidden"
        >
          {/* HEADER */}
          <DialogHeader className="flex-none p-6 bg-muted/20 border-b border-border/40">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {user?.name || user?.email}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1">
                  {user?.email}
                </DialogDescription>
              </div>
              {matchScore !== undefined && (
                <div className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-lg border border-primary/20 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider">
                    Độ khớp CV
                  </span>
                  <span className="text-xl">{matchScore}%</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                <TabsTrigger value="cv">Hồ sơ CV</TabsTrigger>
                <TabsTrigger value="assessment">
                  Báo cáo Đánh giá (AI)
                </TabsTrigger>
              </TabsList>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 bg-background/50 custom-scrollbar">
            {/* TAB 1: CV CONTENT */}
            <TabsContent value="cv" className="mt-0 outline-none h-full">
              <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {cvText || "Không có nội dung CV."}
                </ReactMarkdown>
              </div>
            </TabsContent>

            {/* TAB 2: ASSESSMENT REPORT */}
            <TabsContent
              value="assessment"
              className="mt-0 outline-none space-y-8"
            >
              {!assessmentReport ? (
                <div className="text-center p-12 border border-dashed rounded-xl bg-muted/10 text-muted-foreground">
                  Chưa có báo cáo đánh giá (AI chưa chấm hoặc ứng viên chưa làm
                  bài).
                </div>
              ) : (
                <>
                  {/* --- SECTION 1: SCORES --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 border border-border/50 rounded-xl bg-card shadow-sm flex items-center gap-4">
                      <div className="p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Code className="size-8" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Clean Code
                        </div>
                        <div className="text-4xl font-black text-foreground">
                          {assessmentReport.cleanCodeScore ?? "-"}{" "}
                          <span className="text-xl text-muted-foreground font-medium">
                            / 100
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 border border-border/50 rounded-xl bg-card shadow-sm flex items-center gap-4">
                      <div className="p-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                        <ShieldCheck className="size-8" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Kiến trúc (Architecture)
                        </div>
                        <div className="text-4xl font-black text-foreground">
                          {assessmentReport.architectureScore ?? "-"}{" "}
                          <span className="text-xl text-muted-foreground font-medium">
                            / 100
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 2: TELEMETRY (ANTI-CHEAT) --- */}
                  <div className="p-5 border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl space-y-4">
                    <h4 className="font-bold text-amber-700 dark:text-amber-500 flex items-center gap-2 m-0">
                      <AlertTriangle className="size-5" /> Hệ thống giám sát
                      phòng thi
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-background border rounded-lg">
                        <span className="text-muted-foreground block text-xs">
                          Chuyển tab / Rời màn hình
                        </span>
                        <span className="text-lg font-bold">
                          {flags.tabSwitchCount ?? 0} lần
                        </span>
                      </div>
                      <div className="p-3 bg-background border rounded-lg">
                        <span className="text-muted-foreground block text-xs">
                          Sao chép code bên ngoài
                        </span>
                        <span className="text-lg font-bold">
                          {Array.isArray(flags.copiedCode)
                            ? flags.copiedCode.length
                            : 0}{" "}
                          lần
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 3: SUMMARY (SPLIT GITHUB & TEST) --- */}
                  {assessmentReport.summary && (
                    <div className="space-y-6">
                      {assessmentReport.summary.includes(
                        "=== KẾT QUẢ BÀI TEST ===",
                      ) ? (
                        <>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <h4 className="text-lg font-bold border-b pb-2">
                              Đánh giá GitHub (Vòng lọc CV)
                            </h4>
                            <div className="p-5 border rounded-xl bg-card shadow-sm">
                              <ReactMarkdown>
                                {assessmentReport.summary
                                  .split("=== KẾT QUẢ BÀI TEST ===")[0]
                                  .trim()}
                              </ReactMarkdown>
                            </div>
                          </div>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <h4 className="text-lg font-bold border-b pb-2">
                              Đánh giá Bài thi (Web-IDE)
                            </h4>
                            <div className="p-5 border rounded-xl bg-card shadow-sm">
                              <ReactMarkdown>
                                {assessmentReport.summary
                                  .split("=== KẾT QUẢ BÀI TEST ===")[1]
                                  .trim()}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <h4 className="text-lg font-bold border-b pb-2">
                            Tóm tắt Đánh giá
                          </h4>
                          <div className="p-5 border rounded-xl bg-card shadow-sm">
                            <ReactMarkdown>
                              {assessmentReport.summary}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- SECTION 4: AI GENERAL FEEDBACK --- */}
                  {flags.generalFeedback && (
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <TerminalSquare className="size-5 text-blue-500" /> Nhận
                        xét chuyên sâu từ AI
                      </h4>
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-100 border border-blue-100 dark:border-blue-900/50 rounded-xl text-sm leading-relaxed">
                        {flags.generalFeedback}
                      </div>
                    </div>
                  )}

                  {/* --- SECTION 5: REQUIREMENTS (PASSED / FAILED) --- */}
                  {(flags.passedRequirements?.length > 0 ||
                    flags.failedRequirements?.length > 0) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {flags.passedRequirements?.length > 0 && (
                        <div>
                          <h5 className="font-bold text-green-600 flex items-center gap-2 mb-3">
                            <CheckCircle2 className="size-5" /> Yêu cầu đạt được
                          </h5>
                          <ul className="space-y-2">
                            {flags.passedRequirements.map(
                              (req: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex gap-2 text-sm text-muted-foreground bg-green-50/50 dark:bg-green-950/10 p-3 rounded-lg border border-green-100 dark:border-green-900/30"
                                >
                                  <span className="text-green-500 mt-0.5">
                                    •
                                  </span>{" "}
                                  <span>{req}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                      {flags.failedRequirements?.length > 0 && (
                        <div>
                          <h5 className="font-bold text-red-600 flex items-center gap-2 mb-3">
                            <XCircle className="size-5" /> Yêu cầu chưa đạt
                          </h5>
                          <ul className="space-y-2">
                            {flags.failedRequirements.map(
                              (req: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex gap-2 text-sm text-muted-foreground bg-red-50/50 dark:bg-red-950/10 p-3 rounded-lg border border-red-100 dark:border-red-900/30"
                                >
                                  <span className="text-red-500 mt-0.5">•</span>{" "}
                                  <span>{req}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* --- SECTION 6: NOTABLE CODE --- */}
                  {flags.notableCode?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Lightbulb className="size-5 text-yellow-500" /> Mã
                        nguồn nổi bật
                      </h4>
                      <div className="space-y-4">
                        {flags.notableCode.map((code: any, i: number) => (
                          <div
                            key={i}
                            className="border border-border/50 rounded-xl overflow-hidden shadow-sm"
                          >
                            <div className="bg-muted p-3 border-b border-border/50 text-sm flex gap-2">
                              <span className="font-bold text-foreground">
                                Loại: {code.type}
                              </span>
                              <span className="text-muted-foreground">
                                - {code.comment}
                              </span>
                            </div>
                            <div className="p-4 bg-zinc-950 text-zinc-50 overflow-x-auto">
                              <pre className="text-xs font-mono">
                                {code.snippet}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* --- SECTION 7: GENERAL RISKS (Cảnh báo GitHub/CV) --- */}
                  {generalRisks.length > 0 && (
                    <div className="p-5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/10 rounded-xl">
                      <h4 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
                        <AlertTriangle className="size-5" /> Rủi ro / Điểm yếu
                        được phát hiện
                      </h4>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-red-900 dark:text-red-200">
                        {generalRisks.map((risk, idx) => (
                          <li key={idx}>{String(risk)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* --- SECTION 8: INTERVIEW QUESTIONS --- */}
                  {assessmentReport.interviewQuestions &&
                    assessmentReport.interviewQuestions.length > 0 && (
                      <div className="pt-4 border-t border-border/50">
                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <FileQuestion className="size-5 text-indigo-500" />{" "}
                          Câu hỏi phỏng vấn tự sinh
                        </h4>
                        <ul className="space-y-3">
                          {assessmentReport.interviewQuestions.map(
                            (q: string, i: number) => (
                              <li
                                key={i}
                                className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-100 rounded-lg border border-indigo-100 dark:border-indigo-900/30 text-sm flex gap-3 shadow-sm"
                              >
                                <span className="font-black text-indigo-500 dark:text-indigo-400">
                                  Q{i + 1}.
                                </span>
                                <span className="leading-relaxed">{q}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </>
              )}
            </TabsContent>
          </div>

          <DialogFooter className="flex-none p-4 border-t border-border/40 bg-muted/10 sm:justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng cửa sổ
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
