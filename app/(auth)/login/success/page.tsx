"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

// Component con: Chuyên làm nhiệm vụ đọc URL và lưu Token
function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Đọc tham số ?token=... từ URL
    const token = searchParams.get("accessToken");

    if (token) {
      // Lưu token vào localStorage để dùng cho các request sau
      localStorage.setItem("accessToken", token);
      
      // Chờ một chút xíu (khoảng 500ms) để UI load xong rồi mới đá sang trang tests 
      // (Tạo cảm giác mượt mà, không bị chớp màn hình)
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } else {
      // Nếu không có token (lỗi hoặc truy cập bậy), đá về lại trang login
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <IconLoader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">
        Đang xác thực hệ thống, vui lòng chờ...
      </p>
    </div>
  );
}

// Component Gốc: Bọc Suspense ở ngoài cùng
export default function AuthSuccessPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="pt-6">
            <Suspense 
              fallback={
                <div className="flex flex-col items-center justify-center space-y-4">
                  <IconLoader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground font-medium">
                    Đang thiết lập kết nối an toàn...
                  </p>
                </div>
              }
            >
              <AuthCallbackHandler />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}