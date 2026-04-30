import { useCallback } from "react";
import { useEditorStore } from "../store/use-editor-store";

export const useEditor = (testId: string) => {
  const store = useEditorStore();
  // Lấy state của đúng test session hiện tại
  const tabState = useEditorStore((state) => state.getTabState(testId));

  const openFile = useCallback(
    (fileId: string, options: { pinned: boolean }) => {
      store.openFile(testId, fileId, options);
    },
    [store, testId]
  );

  const closeTab = useCallback(
    (fileId: string) => {
      store.closeTab(testId, fileId);
    },
    [store, testId]
  );

  const closeAllTabs = useCallback(() => {
    store.closeAllTabs(testId);
  }, [store, testId]);

  const setActiveTab = useCallback(
    (fileId: string) => {
      store.setActiveTab(testId, fileId);
    },
    [store, testId]
  );

  return {
    openTabs: tabState.openTabs,
    activeTabId: tabState.activeTabId,
    previewTabId: tabState.previewTabId,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  };
};