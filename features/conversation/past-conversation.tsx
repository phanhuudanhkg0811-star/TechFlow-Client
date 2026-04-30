"use client";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useConversations } from "./hooks/use-conversations";

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
}

export const PastConversationsDialog = ({
  testId,
  open,
  onOpenChange,
  onSelect,
}: PastConversationsDialogProps) => {
  const conversations: Conversation[] | undefined = useConversations(testId);

  const handleSelect = (conversationId: string) => {
    onSelect(conversationId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-[500px]">
        {/* Header ẩn để tuân thủ chuẩn Accessiblity của Dialog */}
        <DialogHeader className="hidden">
          <DialogTitle>Lịch sử hội thoại</DialogTitle>
        </DialogHeader>

        <Command className="border-none rounded-lg">
          <CommandInput
            placeholder="Tìm kiếm hội thoại..."
            className="border-none focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>Không tìm thấy cuộc hội thoại nào.</CommandEmpty>
            <CommandGroup heading="Danh sách hội thoại">
              {conversations?.map((conversation) => (
                <CommandItem
                  key={conversation.id}
                  value={`${conversation.title}-${conversation.id}`}
                  onSelect={() => handleSelect(conversation.id)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{conversation.title}</span>
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
        </Command>
      </DialogContent>
    </Dialog>
  );
};
