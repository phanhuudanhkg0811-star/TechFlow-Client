"use client";

import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconBrandGithub } from "@tabler/icons-react";

// 1. Tách logic xử lý SearchParams ra một component con
function LoginContent() {
  const handleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${apiUrl}/auth/github`;
  };

  return (
    <Card className="w-full bg-card/60 dark:bg-card/30 backdrop-blur-lg border-border/50 shadow-xl">
      <CardHeader className="text-center">
        <CardDescription className="pt-1">
          Đăng nhập bằng tài khoản GitHub để bắt đầu hành trình của bạn.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button
          className="w-full h-12 text-base font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          onClick={handleSignIn}
        >
          <IconBrandGithub className="size-5" />
          Sign in with GitHub
        </Button>
      </CardContent>
    </Card>
  );
}

// 2. Component chính đóng vai trò là "vỏ bọc" Suspense
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}