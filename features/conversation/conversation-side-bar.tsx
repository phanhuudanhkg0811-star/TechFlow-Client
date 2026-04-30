/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  CopyIcon,
  HistoryIcon,
  LoaderIcon,
  PlusIcon,
  SendIcon,
  BotIcon,
  UserIcon,
  ArrowDownToLine,
  FileEdit,
  PaperclipIcon,
  FolderIcon,
  FileIcon as FileIconLucide,
  XIcon,
  CheckIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/apiClient";

import {
  useConversations,
  useCreateConversation,
  useMessages,
} from "./hooks/use-conversations";
import { PastConversationsDialog } from "./past-conversation";
import { useLocalFiles, FileNode } from "@/features/test/hooks/use-local-files";
import { useEditor } from "@/features/editor/hooks/use-editor";

// 🟢 ĐÃ SỬA: Dùng đường dẫn tuyệt đối
import { useChatContextStore } from "@/features/conversation/hooks/use-chat-context-store";

interface ConversationSidebarProps {
  testId: string;
}

// 🟢 ĐÃ SỬA: Đưa biến này ra NGOÀI component và đổi thành string[] để không bị re-render vô tận
const EMPTY_CONTEXT: string[] = [];

export const ConversationSidebar = ({ testId }: ConversationSidebarProps) => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [pastConversationsOpen, setPastConversationsOpen] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // 🟢 ĐÃ SỬA: Gọi Store an toàn
  const selectedContextIds = useChatContextStore(
    (state) => state.selectedContextIds[testId] || EMPTY_CONTEXT,
  );
  const toggleContext = useChatContextStore((state) => state.toggleContext);
  const removeFromContext = useChatContextStore(
    (state) => state.removeFromContext,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const conversations = useConversations(testId);
  const createConversation = useCreateConversation();
  const { files, updateContent } = useLocalFiles(testId);
  const { activeTabId } = useEditor(testId);

  const activeConversationId =
    selectedConversationId ?? conversations?.[0]?.id ?? null;
  const { messages, refetch } = useMessages(activeConversationId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  // const getFullPath = (fileId: string): string => {
  //   const file = files.find((f) => f.id === fileId);
  //   if (!file) return "";
  //   if (!file.parentId) return file.name;
  //   return `${getFullPath(file.parentId)}/${file.name}`;
  // };

  const getFullPath = (fileId: string): string => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return "";
    if (!file.parentId) return file.name;
    return `${getFullPath(file.parentId)}/${file.name}`;
  };

  // Thay thế hàm handleInsertCode cũ bằng hàm này
  const handleApplyToFile = (fileName: string, code: string) => {
    // Tìm file dựa trên tên hoặc đường dẫn tương đối
    const targetFile = files.find(
      (f) => f.name === fileName || getFullPath(f.id) === fileName,
    );

    if (targetFile) {
      updateContent(targetFile.id, code); // Ghi đè toàn bộ nội dung file
      toast.success(`Đã cập nhật file ${targetFile.name} thành công!`);
    } else {
      toast.error(`Không tìm thấy file "${fileName}" trong Workspace!`);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newId = await createConversation({
        testId,
        title: "Trợ giúp lập trình",
      });
      setSelectedConversationId(newId);
      return newId;
    } catch (error) {
      toast.error("Không thể tạo phiên chat mới.");
      return null;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = await handleCreateConversation();
      if (!convId) return;
    }

    const userMessage = input;
    setInput("");
    setShowContextMenu(false);
    setIsProcessing(true);

    try {
      // Logic gom file: Ưu tiên file được ghim, nếu không ghim thì lấy file đang mở
      const getFilesForContext = () => {
        const selectedNodes = new Set<FileNode>();

        const addNode = (nodeId: string) => {
          const node = files.find((f) => f.id === nodeId);
          if (!node) return;
          if (node.type === "file") {
            selectedNodes.add(node);
          } else {
            files
              .filter((f) => f.parentId === node.id)
              .forEach((c) => addNode(c.id));
          }
        };

        if (selectedContextIds.length > 0) {
          selectedContextIds.forEach(addNode);
        } else if (activeTabId) {
          addNode(activeTabId);
        }
        return Array.from(selectedNodes);
      };

      const currentCodebase = getFilesForContext().map((f) => ({
        name: getFullPath(f.id),
        content: f.content,
      }));

      await apiClient.post(`/conversations/${convId}/messages`, {
        content: userMessage,
        role: "user",
        codebase: currentCodebase, // Gửi mảng codebase xuống NestJS
      });
      await refetch();
    } catch (error) {
      toast.error("Gửi tin nhắn thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeTitle =
    conversations?.find((c) => c.id === activeConversationId)?.title ||
    "AI Tech Lead";

  return (
    <>
      <PastConversationsDialog
        testId={testId}
        open={pastConversationsOpen}
        onOpenChange={setPastConversationsOpen}
        onSelect={setSelectedConversationId}
      />

      <div className="flex flex-col h-full bg-sidebar border-r border-border/50">
        <div className="h-8.75 flex items-center justify-between border-b bg-muted/20 px-3 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <BotIcon className="size-4 text-indigo-500 shrink-0" />
            <span className="text-sm font-semibold truncate text-slate-700 dark:text-slate-300">
              {activeTitle}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              size="icon-xs"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => setPastConversationsOpen(true)}
            >
              <HistoryIcon className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              className="h-6 w-6"
              onClick={handleCreateConversation}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-4 min-h-0 scrollbar-thin"
          ref={scrollRef}
          onClick={() => setShowContextMenu(false)}
        >
          <div className="flex flex-col gap-6 pb-4">
            {messages?.length === 0 && !isProcessing && (
              <div className="text-center text-sm text-muted-foreground mt-10">
                Hãy đặt câu hỏi để AI hỗ trợ bạn giải quyết bài toán này.
              </div>
            )}

            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3 max-w-[100%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto",
                )}
              >
                <div
                  className={cn(
                    // Thêm whitespace-pre-wrap, break-words và max-w-full vào đây
                    "px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words max-w-full",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm ml-auto" // ĐÃ XÓA w-max
                      : "bg-muted/50 border border-border/50 text-foreground rounded-2xl rounded-tl-sm w-full",
                  )}
                >
                  {msg.role === "user" ? (
                    <UserIcon className="size-4" />
                  ) : (
                    <BotIcon className="size-4" />
                  )}
                </div>

                <div className="flex flex-col gap-1 w-full max-w-[90%]">
                  <div
                    className={cn(
                      "px-4 py-2.5 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm w-max ml-auto"
                        : "bg-muted/50 border border-border/50 text-foreground rounded-2xl rounded-tl-sm w-full",
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                        <ReactMarkdown
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }: any) {
                              const match = /language-(\w+)/.exec(
                                className || "",
                              );
                              const isBlock = !inline && match;
                              const codeString = String(children).replace(
                                /\n$/,
                                "",
                              );

                              if (isBlock) {
                                const firstLine = codeString.split("\n")[0];

                                // Tinh chỉnh Regex: Chấp nhận có hoặc không có dấu cách, bắt linh hoạt hơn
                                const fileMatch = firstLine.match(
                                  /\/\/\s*file:\s*([^\s]+)/i,
                                );
                                const targetFileName = fileMatch
                                  ? fileMatch[1].trim()
                                  : null;

                                // Bỏ đi dòng "// file: ..." để code render ra nhìn sạch sẽ hơn
                                const cleanCodeString = targetFileName
                                  ? codeString.replace(/^.*\n/, "") // Xóa dòng đầu tiên
                                  : codeString;

                                return (
                                  <div className="relative group my-4 rounded-md overflow-hidden bg-[#1e1e2e] border border-slate-700">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-[#11111b] border-b border-slate-700">
                                      <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                                        {/* Ưu tiên hiện tên file, nếu không có mới hiện ngôn ngữ (ts, js...) */}
                                        {targetFileName
                                          ? targetFileName
                                          : match[1]}
                                      </span>

                                      {/* ... Các nút Copy, Apply, Chèn giữ nguyên ... */}
                                      <div className="flex items-center gap-1">
                                        {targetFileName && (
                                          <button
                                            // Xài cleanCodeString để khi Apply không bị in dư dòng comment // file: ...
                                            onClick={() =>
                                              handleApplyToFile(
                                                targetFileName,
                                                cleanCodeString,
                                              )
                                            }
                                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-emerald-400 hover:text-white hover:bg-emerald-500/50 transition-colors"
                                          >
                                            <FileEdit className="w-3.5 h-3.5" />
                                            Apply
                                          </button>
                                        )}
                                        {/* ... */}
                                      </div>
                                    </div>
                                    <div className="p-3 overflow-x-auto text-[13px] text-slate-50 font-mono leading-relaxed custom-scrollbar">
                                      <code className={className} {...props}>
                                        {cleanCodeString}
                                      </code>
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <code
                                  className="bg-muted-foreground/20 rounded px-1.5 py-0.5 text-sm font-mono text-indigo-400 dark:text-indigo-300"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3 mr-auto max-w-[90%]">
                <div className="flex items-center justify-center size-7 shrink-0 rounded-full bg-indigo-500/20 text-indigo-500 mt-1">
                  <BotIcon className="size-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-muted/50 border border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderIcon className="size-4 animate-spin" />
                  AI đang suy nghĩ...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-background/50 border-t shrink-0 relative">
          {/* TAGS HIỂN THỊ CÁC FILE ĐÃ CHỌN */}
          {selectedContextIds.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedContextIds.map((id) => {
                const node = files.find((f) => f.id === id);
                if (!node) return null; // An toàn: ẩn nếu file đã bị xóa

                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-[11px] font-medium border border-indigo-500/20"
                  >
                    {node.type === "folder" ? (
                      <FolderIcon className="w-3 h-3" />
                    ) : (
                      <FileIconLucide className="w-3 h-3" />
                    )}
                    {getFullPath(id)}
                    <button
                      type="button"
                      onClick={() => removeFromContext(testId, id)}
                      className="hover:text-red-500 ml-1 transition-colors"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* MENU ĐÍNH KÈM FILE (Dùng div thuần, bỏ DropdownMenu để tránh lỗi thiếu file) */}
          {showContextMenu && (
            <div className="absolute bottom-[calc(100%+8px)] left-3 w-64 max-h-[250px] overflow-y-auto bg-popover border border-border rounded-xl shadow-xl z-[100] p-1.5 custom-scrollbar">
              <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Workspace Files
              </div>

              {files.length === 0 ? (
                <div className="px-2 py-4 text-xs text-center text-muted-foreground">
                  Không có file nào
                </div>
              ) : (
                [...files]
                  .sort((a, b) =>
                    getFullPath(a.id).localeCompare(getFullPath(b.id)),
                  )
                  .map((f) => {
                    const isSelected = selectedContextIds.includes(f.id);
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleContext(testId, f.id);
                        }}
                        className={cn(
                          "w-full text-left flex items-center justify-between gap-2 px-2 py-2 rounded-md text-sm hover:bg-accent transition-colors mb-0.5",
                          isSelected &&
                            "bg-accent text-accent-foreground font-medium",
                        )}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {f.type === "folder" ? (
                            <FolderIcon className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <FileIconLucide className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{getFullPath(f.id)}</span>
                        </div>
                        {isSelected && (
                          <CheckIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                        )}
                      </button>
                    );
                  })
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="relative flex items-end gap-2 bg-muted/30 border border-input rounded-xl p-1 focus-within:ring-1 focus-within:ring-ring focus-within:bg-background transition-all"
          >
            {/* Nút bật tắt Menu Paperclip */}
            <button
              type="button"
              onClick={() => setShowContextMenu(!showContextMenu)}
              className={cn(
                "absolute left-2 bottom-2 p-1.5 rounded-md hover:bg-accent transition-colors z-10",
                showContextMenu || selectedContextIds.length > 0
                  ? "text-indigo-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title="Đính kèm file/folder làm ngữ cảnh"
            >
              <PaperclipIcon className="w-4 h-4" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Yêu cầu AI hỗ trợ..."
              className="w-full min-h-[40px] max-h-[150px] bg-transparent pl-10 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none resize-none scrollbar-thin"
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="mb-1 mr-1 size-8 shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!input.trim() || isProcessing}
            >
              <SendIcon className="size-4" />
            </Button>
          </form>

          <div className="text-[10px] text-center text-muted-foreground mt-2 opacity-70">
            {selectedContextIds.length === 0
              ? "Mặc định AI chỉ đọc file bạn đang mở. Bấm biểu tượng 📎 để nạp thêm file."
              : `AI sẽ đọc nội dung của ${selectedContextIds.length} tệp/thư mục được chọn.`}
          </div>
        </div>
      </div>
    </>
  );
};
