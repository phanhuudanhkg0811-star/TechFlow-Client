"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function RoleErrorHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "forbidden") {
      toast.error("Truy cập bị từ chối", {
        description: "Bạn không có quyền hạn (privileges) để xem trang này.",
        duration: 4000,
      });

      // Xóa param ?error=forbidden khỏi URL để trang sạch đẹp
      const currentPath = window.location.pathname;
      window.history.replaceState({}, "", currentPath);
    }
  }, [searchParams]);

  return null; // Không render UI
}