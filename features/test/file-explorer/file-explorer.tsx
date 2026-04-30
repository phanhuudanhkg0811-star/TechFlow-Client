import { useState } from "react";
import {
  ChevronRightIcon,
  CopyMinusIcon,
  FilePlusCornerIcon,
  FolderPlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";

import { useLocalFiles } from "@/features/test/hooks/use-local-files";
import { Tree } from "./tree";
import { CreateInput } from "./create-input";
// IMPORT: Thêm hook useEditor để kết nối với Zustand
import { useEditor } from "../../editor/hooks/use-editor";

export const FileExplorer = ({ testId }: { testId: string }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  // 1. Lấy trạng thái tab và hàm mở file từ bộ quản lý Tab tập trung
  const { activeTabId, openFile } = useEditor(testId);

  // 2. Gọi hook Local Storage để quản lý file
  const { files, isLoaded, createNode, renameNode, deleteNode } =
    useLocalFiles(testId);

  // Lọc ra các file ở Root
  const rootFiles = files
    .filter((f) => f.parentId === null)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  // 3. Cập nhật Handlers để sử dụng hàm của useEditor
  const handlers = {
    createNode,
    renameNode,
    deleteNode,
    activeFileId: activeTabId,
    openFile: (id: string) => openFile(id, { pinned: false }), // Click 1 lần -> Preview
    pinFile: (id: string) => openFile(id, { pinned: true }), // THÊM DÒNG NÀY: Click đúp -> Pin tab
  };

  const handleCreateRoot = (name: string) => {
    setCreating(null);
    createNode(name, creating!, null);
  };

  return (
    <div className="h-full bg-sidebar flex flex-col border-r border-border/50">
      <div className="h-9 flex items-center px-3 border-b bg-muted/20">
        <span className="text-xs font-semibold text-muted-foreground tracking-widest">
          FILES
        </span>
      </div>

      <ScrollArea className="flex-1 py-2">
        <div
          role="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group/project cursor-pointer w-full text-left flex items-center gap-0.5 h-7 hover:bg-accent/50 px-1 font-bold"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90",
            )}
          />
          <p className="text-xs uppercase tracking-wide truncate">Workspace</p>

          <div className="opacity-0 group-hover/project:opacity-100 flex items-center gap-0.5 ml-auto">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setCreating("file");
              }}
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6"
            >
              <FilePlusCornerIcon className="size-3.5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
                setCreating("folder");
              }}
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6"
            >
              <FolderPlusIcon className="size-3.5" />
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setCollapseKey((p) => p + 1);
              }}
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6"
            >
              <CopyMinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="mt-1">
            {!isLoaded ? (
              <div className="flex items-center gap-2 px-6 py-2 text-muted-foreground text-sm">
                <Spinner className="size-4" /> Đang tải...
              </div>
            ) : (
              <>
                {creating && (
                  <CreateInput
                    type={creating}
                    level={0}
                    onSubmit={handleCreateRoot}
                    onCancel={() => setCreating(null)}
                  />
                )}
                {rootFiles.map((item) => (
                  <Tree
                    key={`${item.id}-${collapseKey}`}
                    item={item}
                    level={0}
                    files={files}
                    testId={testId} // <--- THÊM DÒNG NÀY ĐỂ TRÁNH LỖI TYPESCRIPT
                    handlers={handlers}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
