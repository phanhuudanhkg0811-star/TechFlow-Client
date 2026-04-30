/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/apiClient";

// 1. Định nghĩa Type chuẩn khớp với Backend (Prisma)
export type Conversation = {
  id: string;
  testId: string;
  title: string;
  createdAt: string;
};

export type Message = {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  status: "processing" | "completed" | "cancelled" | "failed";
  createdAt: string;
};

// ============================================================================
// CUSTOM HOOKS
// LƯU Ý: Các đường dẫn API (VD: /conversations) cần khớp với Route bên NestJS
// ============================================================================

export const useConversation = (id: string | null) => {
  const [data, setData] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!id) return;

    apiClient
      .get(`/conversations/${id}`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Lỗi tải hội thoại:", err));
  }, [id]);

  return data;
};

export const useMessages = (conversationId: string | null) => {
  // Trả về undefined lúc ban đầu để UI biết là đang loading (giống logic của Convex)
  const [data, setData] = useState<Message[] | undefined>(undefined);

  // Dùng để re-fetch tin nhắn mới
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      const res = await apiClient.get(
        `/conversations/${conversationId}/messages`,
      );
      setData(res.data);
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
      setData([]); // Fallback về mảng rỗng nếu lỗi
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [conversationId, fetchMessages]);

  return { messages: data, refetch: fetchMessages };
};

export const useConversations = (testId: string | null) => {
  const [data, setData] = useState<Conversation[] | undefined>(undefined);

  useEffect(() => {
    if (!testId) return;
    // Đổi projectId thành testId để đồng bộ với logic hiện tại của AI-TechFlow
    apiClient
      .get(`/tests/${testId}/conversations`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Lỗi tải danh sách hội thoại:", err);
        setData([]);
      });
  }, [testId]);

  return data;
};

export const useCreateConversation = () => {
  // Trả về một async function (mô phỏng useMutation)
  const createConversation = async (payload: {
    testId: string;
    title: string;
  }) => {
    try {
      const response = await apiClient.post("/conversations", payload);
      // Trả về ID của conversation vừa tạo để UI điều hướng
      return response.data.id;
    } catch (error) {
      console.error("Lỗi tạo hội thoại mới:", error);
      throw error;
    }
  };

  return createConversation;
};
