import { z } from "zod";
import { isCandidateAiSuggestionEnabled } from "@/features/editor/ai-suggestion-preference";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";

const editRequestSchema = z.object({
  testId: z.string(),
  selectedCode: z.string(),
  fullCode: z.string(),
  instruction: z.string(),
});

type EditRequest = z.infer<typeof editRequestSchema>;

export const fetcher = async (
  payload: EditRequest,
  signal: AbortSignal,
): Promise<string | null> => {
  if (!isCandidateAiSuggestionEnabled()) {
    toast.info("AI suggestions are turned off for this browser.");
    return null;
  }

  try {
    const validatedPayload = editRequestSchema.parse(payload);

    const response = await apiClient.post("/ai/quick-edit", validatedPayload, {
      signal,
      timeout: 30000,
    });

    return response.data.editedCode || null;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return null;
    toast.error("Lỗi khi gọi AI Quick Edit");
    return null;
  }
};
