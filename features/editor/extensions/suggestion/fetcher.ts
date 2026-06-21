import { z } from "zod";
import { isCandidateAiSuggestionEnabled } from "@/features/editor/ai-suggestion-preference";
import apiClient from "@/lib/apiClient"; // Dùng apiClient của bạn

const suggestionRequestSchema = z.object({
  testId: z.string(),
  fileName: z.string(),
  code: z.string(),
  currentLine: z.string(),
  previousLines: z.string(),
  textBeforeCursor: z.string(),
  textAfterCursor: z.string(),
  nextLines: z.string(),
  lineNumber: z.number(),
});

type SuggestionRequest = z.infer<typeof suggestionRequestSchema>;

export const fetcher = async (
  payload: SuggestionRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  if (!isCandidateAiSuggestionEnabled()) return null;

  try {
    const validatedPayload = suggestionRequestSchema.parse(payload);

    // Gọi về NestJS (đổi đường dẫn thành /ai/suggestion)
    const response = await apiClient.post("/ai/suggestion", validatedPayload, {
      signal,
      timeout: 15000,
    });

    return response.data.suggestion || null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    if (error instanceof Error && error.message.includes("canceled")) return null; // Axios abort error
    
    // Đừng hiện toast lỗi liên tục khi đang gõ, chỉ console.log thôi
    console.warn("AI Completion đang tạm nghỉ:", error);
    return null;
  }
};
