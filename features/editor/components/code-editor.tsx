"use client";

import { useEffect, useMemo, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";

import { minimap } from "@/features/editor/extensions/minimap";
import { customTheme } from "@/features/editor/extensions/theme";
import { getLanguageExtension } from "@/features/editor/extensions/language-extension";
import { customSetup } from "@/features/editor/extensions/custom-setup";
import { suggestion } from "@/features/editor/extensions/suggestion";
import { quickEdit } from "@/features/editor/extensions/quick-edit";
import { selectionTooltip } from "@/features/editor/extensions/selection-tooltip";

interface CodeEditorProps {
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
  fileName,
  initialValue = "",
  onChange,
}: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // Tự động nhận diện ngôn ngữ dựa trên đuôi file (ts, py, html...)
  const languageExtension = useMemo(() => {
    return getLanguageExtension(fileName);
  }, [fileName]);

  useEffect(() => {
    if (!editorRef.current) return;

    // Khởi tạo CodeMirror 6 Instance
    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        oneDark, // Giao diện tối
        customTheme, // Cấu hình font/size riêng của bạn
        customSetup, // Các phím tắt và cấu hình mặc định
        languageExtension, // Highlight cú pháp theo ngôn ngữ
        suggestion(fileName), // AI Code Completion
        quickEdit(fileName), // AI Quick Edit (Cmd+K)
        selectionTooltip(), // Menu khi bôi đen code
        keymap.of([indentWithTab]), // Cho phép dùng phím Tab để thụt lề
        minimap(), // Bản đồ code nhỏ bên phải
        indentationMarkers(), // Kẻ vạch hàng thụt đầu dòng

        // Listener lắng nghe thay đổi nội dung
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
      view.destroy(); // Dọn dẹp bộ nhớ khi tắt tab/đổi file
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Chúng ta không cho initialValue vào đây để tránh editor bị reset liên tục khi gõ
  }, [languageExtension, onChange, initialValue, fileName]);

  // THÊM USE-EFFECT NÀY VÀO ĐỂ LẮNG NGHE SỰ THAY ĐỔI TỪ BÊN NGOÀI (NÚT APPLY)
  useEffect(() => {
    if (viewRef.current && initialValue !== undefined) {
      const currentValue = viewRef.current.state.doc.toString();
      // Chỉ cập nhật nếu code từ bên ngoài khác với code đang hiển thị
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
