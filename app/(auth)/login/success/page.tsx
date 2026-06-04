"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { Card, CardContent } from "@/components/ui/card";

function AuthCallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }, [router]);

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
