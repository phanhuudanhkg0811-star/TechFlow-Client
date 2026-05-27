/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { Allotment } from "allotment";
import { Navbar } from "./nav-bar";
import "allotment/dist/style.css";
import { ConversationSidebar } from "../conversation/conversation-side-bar";
import apiClient from "@/lib/apiClient";

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 800;
const DEFAULT_CONVERSATION_SIDEBAR_WIDTH = 400;
const DEFAULT_MAIN_SIZE = 1000;

export default function TestIdLayout({
  children,
  testId,
}: {
  children: React.ReactNode;
  testId: string;
}) {
  
  const lastTabState = useRef<string | null>(null);
  
  // LOGIC TRACKING GIAN LẬN: CHUYỂN TAB VÀ COPY NỘI BỘ
  useEffect(() => {
    const handleVisibilityChange = () => {
      const action = document.visibilityState === "hidden" ? "left_tab" : "returned";
      if (lastTabState.current !== action) {
        lastTabState.current = action;
        apiClient.post(`/tests/${testId}/events`, {
          eventType: "TAB_SWITCH",
          payload: { action, timestamp: new Date().toISOString() }
        }).catch(() => {});
      }
    };

    // 1. Bắt thao tác bôi đen + Ctrl C
    const handleGlobalCopy = () => {
      const selectedText = window.getSelection()?.toString();
      if (selectedText) {
        (window as any).__LAST_INTERNAL_COPY__ = selectedText;
      }
    };

    // 2. "Hack" API Clipboard để bắt thao tác bấm nút Copy trong Sidebar
    const originalWriteText = navigator.clipboard.writeText;
    navigator.clipboard.writeText = async (text: string) => {
      (window as any).__LAST_INTERNAL_COPY__ = text; // Lưu lại text
      return originalWriteText.call(navigator.clipboard, text); // Chạy lệnh copy gốc
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleGlobalCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleGlobalCopy);
      // Trả lại hàm gốc khi component unmount
      navigator.clipboard.writeText = originalWriteText; 
    };
  }, [testId]);

  return (
    <div className="w-full h-screen flex flex-col">
      <Navbar testId={testId} />
      <div className="flex-1 flex overflow-hidden">
        <Allotment
          className="flex-1"
          defaultSizes={[DEFAULT_CONVERSATION_SIDEBAR_WIDTH, DEFAULT_MAIN_SIZE]}
        >
          <Allotment.Pane
            snap
            minSize={MIN_SIDEBAR_WIDTH}
            maxSize={MAX_SIDEBAR_WIDTH}
            preferredSize={DEFAULT_CONVERSATION_SIDEBAR_WIDTH}
          >
            <ConversationSidebar testId={testId} />
          </Allotment.Pane>
          <Allotment.Pane>{children}</Allotment.Pane>
        </Allotment>
      </div>
    </div>
  );
}