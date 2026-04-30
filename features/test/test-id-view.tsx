// file: features/test/test-id-view.tsx
"use client";

import { useState } from "react";
import { Allotment } from "allotment";

import { cn } from "@/lib/utils";
import { FileExplorer } from "./file-explorer/file-explorer";
import { EditorView } from "../editor/components/editor-view";

// 🟢 NHÚNG COMPONENT TERMINAL VÀ PREVIEW VÀO ĐÂY
import { Terminal } from "../editor/components/terminal";
import { Preview } from "../editor/components/preview";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_SIDEBAR_WIDTH = 350;
const DEFAULT_MAIN_SIZE = 1000;

const Tab = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 h-full px-4 font-medium cursor-pointer text-muted-foreground border-r hover:bg-accent/30 transition-colors",
        isActive && "bg-background text-foreground border-b-2 border-b-indigo-500",
      )}
    >
      <span className="text-sm">{label}</span>
    </div>
  );
};

export default function TestIdView({ testId }: { testId: string }) {
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");

  return (
    <div className="h-full flex flex-col">
      {/* THANH ĐIỀU HƯỚNG TAB */}
      <nav className="h-9 flex items-center bg-sidebar border-b shrink-0">
        <Tab
          label="Code & Terminal"
          isActive={activeView === "editor"}
          onClick={() => setActiveView("editor")}
        />
        <Tab
          label="Browser Preview"
          isActive={activeView === "preview"}
          onClick={() => setActiveView("preview")}
        />
      </nav>

      {/* KHU VỰC HIỂN THỊ CHÍNH */}
      <div className="flex-1 relative min-h-0">
        
        {/* --- VIEW 1: EDITOR + TERMINAL --- */}
        <div
          className={cn(
            "absolute inset-0",
            activeView === "editor" ? "visible" : "invisible",
          )}
        >
          <Allotment defaultSizes={[DEFAULT_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}>
            <Allotment.Pane
              snap
              minSize={MIN_SIDEBAR_WIDTH}
              maxSize={MAX_SIDEBAR_WIDTH}
              preferredSize={DEFAULT_SIDEBAR_WIDTH}
            >
              <FileExplorer testId={testId} />
            </Allotment.Pane>

            <Allotment.Pane>
              {/* 🟢 Dùng Allotment Vertical để chia Editor (trên) và Terminal (dưới) */}
              <Allotment vertical defaultSizes={[700, 300]}>
                <Allotment.Pane>
                  <EditorView testId={testId} />
                </Allotment.Pane>
                
                <Allotment.Pane snap minSize={150}>
                  <Terminal testId={testId}/>
                </Allotment.Pane>
              </Allotment>
            </Allotment.Pane>
          </Allotment>
        </div>

        {/* --- VIEW 2: PREVIEW BROWSER --- */}
        <div
          className={cn(
            "absolute inset-0 bg-slate-50",
            activeView === "preview" ? "visible" : "invisible",
          )}
        >
          <Preview />
        </div>

      </div>
    </div>
  );
}