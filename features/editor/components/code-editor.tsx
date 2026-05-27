/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import apiClient from "@/lib/apiClient";

import { minimap } from "@/features/editor/extensions/minimap";
import { customTheme } from "@/features/editor/extensions/theme";
import { getLanguageExtension } from "@/features/editor/extensions/language-extension";
import { customSetup } from "@/features/editor/extensions/custom-setup";
import { suggestion } from "@/features/editor/extensions/suggestion";
import { quickEdit } from "@/features/editor/extensions/quick-edit";
import { selectionTooltip } from "@/features/editor/extensions/selection-tooltip";

interface CodeEditorProps {
  testId: string;
  fileName: string;
  initialValue?: string;
  onChange: (value: string) => void;
}

declare global {
  interface Window {
    activeEditorView?: EditorView | null;
  }
}

export const CodeEditor = ({
  testId, // Nhận prop testId
  fileName,
  initialValue = "",
  onChange,
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(() => {
    return getLanguageExtension(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!editorRef.current) return;

    // --- EXTENSION ANTI-CHEAT: BẮT COPY PASTE ---
    const clipboardListener = EditorView.domEventHandlers({
      copy(event, view) {
        const selection = view.state.sliceDoc(
          view.state.selection.main.from,
          view.state.selection.main.to,
        );
        (window as any).__LAST_INTERNAL_COPY__ = selection;
        return false;
      },
      cut(event, view) {
        const selection = view.state.sliceDoc(
          view.state.selection.main.from,
          view.state.selection.main.to,
        );
        (window as any).__LAST_INTERNAL_COPY__ = selection;
        return false;
      },
      paste(event, view) {
        const clipboardData = event.clipboardData;
        if (clipboardData) {
          const pastedText = clipboardData.getData("text");
          const lastCopiedInternal =
            (window as any).__LAST_INTERNAL_COPY__ || "";

          // Hàm xoá sạch mọi khoảng trắng, tab, xuống dòng để so sánh cho chuẩn
          const normalize = (str: string) => str.replace(/\s+/g, "");

          const isSameContent =
            normalize(pastedText) === normalize(lastCopiedInternal);

          // NẾU KHÁC NHAU VÀ DÀI HƠN 30 KÝ TỰ -> Báo gian lận
          if (!isSameContent && pastedText.length > 30) {
            apiClient
              .post(`/tests/${testId}/events`, {
                eventType: "PASTE_EVENT",
                payload: {
                  fileName: fileName,
                  source: "external",
                  textLength: pastedText.length,
                  snippet: pastedText.substring(0, 150) + "...",
                  timestamp: new Date().toISOString(),
                },
              })
              .catch(() => {});
          }
        }
        return false;
      },
    });
    // ------------------------------------------

    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        oneDark,
        customTheme,
        customSetup,
        languageExtension,
        suggestion(fileName),
        quickEdit(fileName),
        selectionTooltip(),
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        clipboardListener, // CHÈN LISTENER VÀO ĐÂY
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });

    viewRef.current = view;
    window.activeEditorView = view;

    return () => {
      view.destroy();
    };
  }, [languageExtension, onChange, fileName, testId]);

  useEffect(() => {
    if (viewRef.current && initialValue !== undefined) {
      const currentValue = viewRef.current.state.doc.toString();
      if (initialValue !== currentValue) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: initialValue,
          },
        });
      }
    }
  }, [initialValue]);

  return <div ref={editorRef} className="size-full bg-[#282c34]" />;
};
