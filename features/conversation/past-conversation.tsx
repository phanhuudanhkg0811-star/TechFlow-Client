"use client";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale"; // Dùng tiếng Việt cho thời gian

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useConversations } from "./hooks/use-conversations";

// Hook này sẽ dùng apiClient để gọi API từ NestJS thay vì Convex

// Định nghĩa lại Type mô phỏng dữ liệu từ Backend trả về
export type Conversation = {
  id: string;
  title: string;
  createdAt: string | Date;
};

interface PastConversationsDialogProps {
  testId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (conversationId: string) => void;
};

export const PastConversationsDialog = ({
  testId,
  open,
  onOpenChange,
  onSelect,
}: PastConversationsDialogProps) => {
  // Lấy danh sách hội thoại dựa trên testId hiện tại
  const conversations: (Conversation[] | undefined) = useConversations(testId);   

  const handleSelect = (conversationId: string) => {
    onSelect(conversationId);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Lịch sử hội thoại"
      description="Tìm kiếm và xem lại các phiên trò chuyện trước đó"
    >
      <CommandInput placeholder="Tìm kiếm hội thoại..." />
      <CommandList>
        <CommandEmpty>Không tìm thấy cuộc hội thoại nào.</CommandEmpty>
        <CommandGroup heading="Danh sách hội thoại">
          {conversations?.map((conversation) => (
            <CommandItem
              key={conversation.id}
              value={`${conversation.title}-${conversation.id}`}
              onSelect={() => handleSelect(conversation.id)}
            >
              <div className="flex flex-col gap-0.5">
                <span>{conversation.title}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};