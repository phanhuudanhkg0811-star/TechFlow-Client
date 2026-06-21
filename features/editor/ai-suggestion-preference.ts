export const AI_SUGGESTION_STORAGE_KEY =
  "candidate_ai_suggestions_enabled";

export const AI_SUGGESTION_CHANGE_EVENT =
  "candidate-ai-suggestions-change";

export const isCandidateAiSuggestionEnabled = () => {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(AI_SUGGESTION_STORAGE_KEY) !== "false";
};

export const setCandidateAiSuggestionEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(AI_SUGGESTION_STORAGE_KEY, String(enabled));
  window.dispatchEvent(
    new CustomEvent(AI_SUGGESTION_CHANGE_EVENT, {
      detail: { enabled },
    }),
  );
};
