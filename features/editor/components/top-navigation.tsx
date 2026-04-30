import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEditor } from "../hooks/use-editor";
import { cn } from "@/lib/utils";
import { FileIcon } from "@react-symbols/icons/utils";
import { XIcon } from "lucide-react";
import { useLocalFiles } from "@/features/test/hooks/use-local-files";

const Tab = ({
  fileId,
  isFirst,
  testId, // Đổi từ projectId thành testId
}: {
  fileId: string;
  isFirst: boolean;
  testId: string;
}) => {
  const { files } = useLocalFiles(testId);
  const { activeTabId, previewTabId, setActiveTab, openFile, closeTab } =
    useEditor(testId);

  // Tìm thông tin file trong mảng local thay vì gọi hook Convex
  const file = files.find((f) => f.id === fileId);

  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const fileName = file?.name ?? "Unknown";

  if (!file) return null; // Nếu không tìm thấy file thì không render tab

  return (
    <div
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
      className={cn(
        "flex items-center gap-2 h-8.75 pl-2 pr-1.5 cursor-pointer text-muted-foreground group border-y border-x border-transparent hover:bg-accent/30",
        isActive &&
          "bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow",
        isFirst && "border-l-transparent!",
      )}
    >
      <FileIcon fileName={fileName} autoAssign className="size-4" />
      <span className={cn("text-sm whitespace-nowrap", isPreview && "italic")}>
        {fileName}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeTab(fileId);
        }}
        className={cn(
          "p-0.5 rounded-sm hover:bg-white/10 opacity-0 group-hover:opacity-100",
          isActive && "opacity-100",
        )}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
};

export const TopNavigation = ({ testId }: { testId: string }) => {
  const { openTabs } = useEditor(testId);

  return (
    <ScrollArea className="flex-1">
      <nav className="bg-sidebar flex items-center h-8.75 border-b">
        {openTabs.map((fileId, index) => (
          <Tab
            key={fileId}
            fileId={fileId}
            isFirst={index === 0}
            testId={testId}
          />
        ))}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
