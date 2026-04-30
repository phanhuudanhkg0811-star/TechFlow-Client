import Image from "next/image";
import { useEffect, useRef } from "react";
import { useEditor } from "../hooks/use-editor";
import { TopNavigation } from "./top-navigation";
// import { FileBreadcrumbs } from "./file-breadcrumbs"; // Bạn có thể update file này sau tương tự
import { useLocalFiles } from "@/features/test/hooks/use-local-files";
import { CodeEditor } from "./code-editor";

const DEBOUNCE_MS = 800; // Giảm xuống một chút cho mượt vì lưu local rất nhanh

export const EditorView = ({ testId }: { testId: string }) => {
  const { activeTabId } = useEditor(testId);
  const { files, updateContent } = useLocalFiles(testId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Tìm file đang active trong list local
  const activeFile = files.find(f => f.id === activeTabId);

  // Cleanup timeout khi chuyển tab
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeTabId]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation testId={testId} />
      </div>
      
      {/* {activeTabId && <FileBreadcrumbs testId={testId} />} */}

      <div className="flex-1 min-h-0 bg-background">
        {!activeFile ? (
          <div className="size-full flex items-center justify-center opacity-20">
            <Image src="/logo-alt.svg" alt="Logo" width={80} height={80} />
          </div>
        ) : (
          <CodeEditor
            key={activeFile.id} // Quan trọng: Re-render editor khi đổi file
            fileName={activeFile.name}
            initialValue={activeFile.content}
            onChange={(content: string) => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);

              // Debounce để tránh lưu quá nhiều lần trong 1 giây
              timeoutRef.current = setTimeout(() => {
                updateContent(activeFile.id, content);
              }, DEBOUNCE_MS);
            }}
          />
        )}
      </div>
    </div>
  );
};