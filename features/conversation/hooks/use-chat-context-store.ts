"use client";
import { create } from 'zustand';


interface ChatContextState {
  // Map: testId -> mảng các ID (file hoặc folder)
  selectedContextIds: Record<string, string[]>;
  
  addToContext: (testId: string, ids: string[]) => void;
  removeFromContext: (testId: string, id: string) => void;
  toggleContext: (testId: string, id: string) => void;
  clearContext: (testId: string) => void;
}

export const useChatContextStore = create<ChatContextState>((set) => ({
  selectedContextIds: {},

  addToContext: (testId, ids) =>
    set((state) => {
      const current = state.selectedContextIds[testId] || [];
      const updated = [...new Set([...current, ...ids])];
      return {
        selectedContextIds: { ...state.selectedContextIds, [testId]: updated },
      };
    }),

  removeFromContext: (testId, id) =>
    set((state) => {
      const current = state.selectedContextIds[testId] || [];
      const updated = current.filter((i) => i !== id);
      return {
        selectedContextIds: { ...state.selectedContextIds, [testId]: updated },
      };
    }),

  toggleContext: (testId, id) =>
    set((state) => {
      const current = state.selectedContextIds[testId] || [];
      const exists = current.includes(id);
      const updated = exists ? current.filter((i) => i !== id) : [...current, id];
      return {
        selectedContextIds: { ...state.selectedContextIds, [testId]: updated },
      };
    }),

  clearContext: (testId) =>
    set((state) => ({
      selectedContextIds: { ...state.selectedContextIds, [testId]: [] },
    })),
}));