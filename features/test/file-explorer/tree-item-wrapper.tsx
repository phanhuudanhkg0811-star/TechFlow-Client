// features/test/file-explorer/tree-item-wrapper.tsx
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { getItemPadding } from "./constants";
import { FileNode } from "@/features/test/hooks/use-local-files";

export const TreeItemWrapper = ({
  item,
  children,
  level,
  isActive,
  isContextSelected,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  onToggleContext,
}: {
  item: FileNode;
  children: React.ReactNode;
  level: number;
  isActive?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
  isContextSelected?: boolean;
  onToggleContext?: () => void;
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename?.();
            }
          }}
          className={cn(
            "group flex items-center gap-1 w-full h-5.5 hover:bg-accent/30 outline-none focus:ring-1 focus:ring-inset focus:ring-ring text-slate-700 dark:text-slate-300",
            isActive &&
              "bg-accent/30 text-indigo-600 dark:text-indigo-400 font-medium",
            isContextSelected &&
              "ring-1 ring-inset ring-indigo-500/50 bg-indigo-500/5",
          )}
          style={{ paddingLeft: getItemPadding(level, item.type === "file") }}
        >
          {children}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-56"
      >
        {/* SỬA onClick THÀNH onSelect TẠI TẤT CẢ CÁC ITEM DƯỚI ĐÂY */}
        <ContextMenuItem
          onSelect={(e) => {
            e.preventDefault(); // Quan trọng: Giữ menu không bị đóng đột ngột
            onToggleContext?.(); // Gọi hàm cập nhật state
          }}
          className="text-sm cursor-pointer text-indigo-600 dark:text-indigo-400 font-medium"
        >
          {isContextSelected
            ? "Bỏ ghim khỏi AI Context"
            : "Đính kèm vào AI Context"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {item.type === "folder" && (
          <>
            <ContextMenuItem
              onSelect={onCreateFile}
              className="text-sm cursor-pointer"
            >
              Tạo File mới...
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={onCreateFolder}
              className="text-sm cursor-pointer"
            >
              Tạo Folder mới...
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onSelect={onRename} className="text-sm cursor-pointer">
          Đổi tên... <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={onDelete}
          className="text-sm text-red-500 cursor-pointer focus:bg-red-50"
        >
          Xóa vĩnh viễn <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};