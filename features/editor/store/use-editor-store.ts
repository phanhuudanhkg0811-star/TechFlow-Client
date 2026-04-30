import { create } from "zustand";

interface TabState {
  openTabs: string[];
  activeTabId: string | null;
  previewTabId: string | null;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<string, TabState>; // Key là testId
  getTabState: (testId: string) => TabState;
  openFile: (
    testId: string,
    fileId: string,
    options: { pinned: boolean },
  ) => void;
  closeTab: (testId: string, fileId: string) => void;
  closeAllTabs: (testId: string) => void;
  setActiveTab: (testId: string, fileId: string) => void;
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: new Map(),

  getTabState: (testId) => {
    return get().tabs.get(testId) ?? defaultTabState;
  },

  openFile: (testId, fileId, { pinned }) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(testId) ?? defaultTabState;
    const { openTabs, previewTabId } = state;
    const isOpen = openTabs.includes(fileId);

    // Case 1: Mở dạng preview (chữ in nghiêng, click 1 lần)
    if (!isOpen && !pinned) {
      const newTabs = previewTabId
        ? openTabs.map((id) => (id === previewTabId ? fileId : id))
        : [...openTabs, fileId];

      tabs.set(testId, {
        openTabs: newTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      });
      set({ tabs });
      return;
    }

    // Case 2: Mở dạng pinned (giữ lại tab, double click)
    if (!isOpen && pinned) {
      tabs.set(testId, {
        ...state,
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
      });
      set({ tabs });
      return;
    }

    // Case 3: File đã mở sẵn - chỉ việc focus vào nó
    const shouldPin = pinned && previewTabId === fileId;
    tabs.set(testId, {
      ...state,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });
    set({ tabs });
  },

  closeTab: (testId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(testId) ?? defaultTabState;
    const { openTabs, activeTabId, previewTabId } = state;
    const tabIndex = openTabs.indexOf(fileId);

    if (tabIndex === -1) return;

    const newTabs = openTabs.filter((id) => id !== fileId);

    let newActiveTabId = activeTabId;
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        newActiveTabId = newTabs[newTabs.length - 1];
      } else {
        newActiveTabId = newTabs[tabIndex];
      }
    }

    tabs.set(testId, {
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId: previewTabId === fileId ? null : previewTabId,
    });
    set({ tabs });
  },

  closeAllTabs: (testId) => {
    const tabs = new Map(get().tabs);
    tabs.set(testId, defaultTabState);
    set({ tabs });
  },

  setActiveTab: (testId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(testId) ?? defaultTabState;
    tabs.set(testId, { ...state, activeTabId: fileId });
    set({ tabs });
  },
}));
