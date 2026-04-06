import { ModeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconSparkles, IconArrowRight, IconCode } from "@tabler/icons-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans selection:bg-primary/20">
      {/* 1. Header (Navbar) có hiệu ứng kính mờ (Backdrop Blur) */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/60 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2 font-bold tracking-tight text-lg">
          <IconSparkles className="h-5 w-5 text-primary" />
          <span>AI-TechFlow</span>
        </div>
        <ModeToggle />
      </header>

      {/* 2. Hero Section (Phần nội dung chính) */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-20 pb-32 text-center md:pt-32">
        {/* Tiêu đề chính (Headline) dùng gradient text cực xịn */}
        <h1 className="mb-6 max-w-4xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent text-5xl font-extrabold tracking-tight md:text-7xl">
          Định hình lại tuyển dụng IT với <br className="hidden md:block" />
          {/* Cụm từ Agentic AI với hiệu ứng Animated Gradient */}
          <span className="animate-text-gradient bg-linear-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-size-[200%_auto] bg-clip-text text-transparent">
            Agentic AI
          </span>
        </h1>

        {/* Đoạn mô tả (Subheadline) */}
        <p className="mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Vượt xa những trang CV tĩnh. AI-TechFlow tự động bóc tách tư duy kiến
          trúc và đánh giá năng lực thực chiến thông qua Web-based IDE tích hợp
          giám sát chống gian lận.
        </p>

        {/* Các nút bấm (Call To Action) */}
        <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
          <Link href="/tests" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full rounded-full px-8 gap-2 text-md h-12"
            >
              Khởi tạo môi trường Test <IconArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="#features" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full rounded-full px-8 gap-2 text-md h-12 border-border/60 hover:bg-muted/50"
            >
              <IconCode className="h-5 w-5" /> Tìm hiểu kiến trúc
            </Button>
          </Link>
        </div>
      </main>

      {/* 3. Lưới Background trang trí (Tùy chọn cho đẹp) */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  );
}
