"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // Quan trọng: Dùng next/navigation
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconBrandGithub } from "@tabler/icons-react";

// 1. Tách logic xử lý SearchParams ra một component con
function LoginContent() {
  const handleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${apiUrl}/auth/github`;
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="text-xl">Login</CardTitle>
        <CardDescription>Login with your Github Account</CardDescription>
      </CardHeader>

      <CardContent>
        <Button className="w-full" variant="outline" onClick={handleSignIn}>
          <IconBrandGithub className="mr-2 size-4" /> Sign in with Github
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