import { useState } from "react";
import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { cn } from "@/lib/utils";

import { CreateInput } from "./create-input";
import { RenameInput } from "./rename-input";
import { FileNode } from "@/features/test/hooks/use-local-files";
import { TreeItemWrapper } from "./tree-item-wrapper";

// 🟢 Đảm bảo đường dẫn tuyệt đối chuẩn xác
import { useChatContextStore } from "@/features/conversation/hooks/use-chat-context-store";

interface TreeProps {
  item: FileNode;
  level?: number;
  files: FileNode[];
  testId: string; // <-- BẮT BUỘC THÊM ĐỂ QUẢN LÝ CONTEXT STORE
  handlers: {
    createNode: (
      name: string,
      type: "file" | "folder",
      parentId: string | null,
    ) => void;
    renameNode: (id: string, newName: string) => void;
    deleteNode: (id: string) => void;
    openFile: (id: string) => void;
    pinFile: (id: string) => void;
    activeFileId: string | null;
  };
}

// 🟢 ĐÃ SỬA: Kiểu dữ liệu phải là mảng string[] để chứa các ID
const EMPTY_CONTEXT: string[] = [];

export const Tree = ({
  item,
  level = 0,
  files,
  testId,
  handlers,
}: TreeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  // 1. KẾT NỐI GLOBAL STORE ĐỂ LẤY TRẠNG THÁI CONTEXT
  const selectedContextIds = useChatContextStore(
    (state) => state.selectedContextIds[testId] || EMPTY_CONTEXT,
  );
  const toggleContext = useChatContextStore((state) => state.toggleContext);
  const isSelected = selectedContextIds.includes(item.id);

  // 2. LỌC VÀ SẮP XẾP FILE CON
  const children = files
    .filter((f) => f.parentId === item.id)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const handleCreate = (name: string) => {
    setCreating(null);
    handlers.createNode(name, creating!, item.id);
  };

  const handleRename = (newName: string) => {
    setIsRenaming(false);
    if (newName !== item.name) handlers.renameNode(item.id, newName);
  };

  // --- TRƯỜNG HỢP: RENDER FILE ---
  if (item.type === "file") {
    if (isRenaming) {
      return (
        <RenameInput
          type="file"
          defaultValue={item.name}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      );
    }

    return (
      <TreeItemWrapper
        item={item}
        level={level}
        isActive={handlers.activeFileId === item.id}
        isContextSelected={isSelected} // <-- TRUYỀN TRẠNG THÁI CONTEXT
        onToggleContext={() => toggleContext(testId, item.id)} // <-- SỰ KIỆN GHIM CONTEXT
        onClick={() => handlers.openFile(item.id)}
        onDoubleClick={() => handlers.pinFile(item.id)}
        onRename={() => setIsRenaming(true)}
        onDelete={() => handlers.deleteNode(item.id)}
      >
        <FileIcon fileName={item.name} autoAssign className="size-4" />
        <span className="truncate text-sm">{item.name}</span>
      </TreeItemWrapper>
    );
  }

  // --- TRƯỜNG HỢP: RENDER FOLDER ---
  return (
    <>
      {isRenaming ? (
        <RenameInput
          type="folder"
          defaultValue={item.name}
          isOpen={isOpen}
          level={level}
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
        />
      ) : (
        <TreeItemWrapper
          item={item}
          level={level}
          isContextSelected={isSelected} // <-- FOLDER CŨNG CÓ THỂ LÀM CONTEXT ĐƯỢC
          onToggleContext={() => toggleContext(testId, item.id)}
          onClick={() => setIsOpen(!isOpen)}
          onRename={() => setIsRenaming(true)}
          onDelete={() => handlers.deleteNode(item.id)}
          onCreateFile={() => {
            setIsOpen(true);
            setCreating("file");
          }}
          onCreateFolder={() => {
            setIsOpen(true);
            setCreating("folder");
          }}
        >
          <div className="flex items-center gap-0.5">
            <ChevronRightIcon
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-90",
              )}
            />
            <FolderIcon
              folderName={item.name}
              className="size-4 text-blue-400"
            />
          </div>
          <span className="truncate text-sm">{item.name}</span>
        </TreeItemWrapper>
      )}

      {/* Render đệ quy nếu Folder đang mở */}
      {isOpen && (
        <>
          {creating && (
            <CreateInput
              type={creating}
              level={level + 1}
              onSubmit={handleCreate}
              onCancel={() => setCreating(null)}
            />
          )}
          {children.map((child) => (
            <Tree
              key={child.id}
              item={child}
              level={level + 1}
              files={files}
              testId={testId} // <-- NHỚ TRUYỀN TIẾP XUỐNG CÁC ĐỜI CON
              handlers={handlers}
            />
          ))}
        </>
      )}
    </>
  );
};
