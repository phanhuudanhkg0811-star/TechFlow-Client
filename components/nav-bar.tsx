/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  FileCode,
  Loader2,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import apiClient from "@/lib/apiClient";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: "CANDIDATE" | "HR" | "TECH_LEAD";
}

const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    try {
      // Backend sẽ tự động xóa Cookie khi gọi API này
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    } finally {
      // Đã XÓA dòng localStorage.removeItem("accessToken")
      setUser(null);
      router.push("/");
    }
  };

  const fetchUser = async () => {
    try {
      // Cứ gọi thẳng API, axios sẽ đính kèm Cookie (nếu có)
      const res = await apiClient.get<UserProfile>("/auth/me");
      console.log(res);

      // Lúc này res.data chính là thông tin user (do đã được unwrap ở Interceptor)
      setUser(res.data);
    } catch (error) {
      console.error("Chưa đăng nhập hoặc phiên đã hết hạn.");
      // Lỗi thì đơn giản là set user thành null, không cần gọi thêm hàm logout()
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, isLoading, logout };
};

const handleSmoothScroll = (
  e: React.MouseEvent<HTMLAnchorElement>,
  id: string,
) => {
  e.preventDefault();
  const element = document.getElementById(id);
  if (element) {
    const offset = 80; // Chiều cao của navbar cố định
    const elementPosition =
      element.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/20 dark:bg-black/20 backdrop-blur-xl border-b border-white/20 dark:border-white/5 shadow-sm"
          : "bg-transparent pt-4"
      }`}
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Bot className="w-6 h-6 text-blue-400 dark:text-blue-500 group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-bold tracking-tight animate-gradient-reverse">
            AI-TechFlow
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a
            href="#features"
            onClick={(e) => handleSmoothScroll(e, "features")}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            Tính năng
          </a>
          <a
            href="#workflow"
            onClick={(e) => handleSmoothScroll(e, "workflow")}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            Quy trình
          </a>
          <a
            href="#solutions"
            onClick={(e) => handleSmoothScroll(e, "solutions")}
            className="hover:text-indigo-600 dark:hover:text-white transition-colors"
          >
            Giải pháp
          </a>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Đổi giao diện"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Auth Section */}
          {isLoading ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 outline-none">
                  <Avatar className="w-9 h-9 border border-indigo-500/20">
                    <AvatarImage src={user.avatarUrl || ""} />
                    <AvatarFallback className="bg-indigo-600 text-white font-bold">
                      {user.name?.charAt(0).toUpperCase() ||
                        user.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-semibold">
                    {user.name || user.email?.split("@")[0] || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 rounded-2xl border-slate-200 dark:border-white/10 backdrop-blur-xl"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">
                      {user.name || "Người dùng"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
                      {user.role === "CANDIDATE"
                        ? "Ứng viên"
                        : user.role === "HR"
                          ? "HR"
                          : "Tech Lead"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Menu phân biệt theo role */}
                {user.role === "HR" || user.role === "TECH_LEAD" ? (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2 py-2.5"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="w-4 h-4" /> Quản lý chiến dịch
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer gap-2 py-2.5"
                  >
                    <Link href="/tests">
                      <FileCode className="w-4 h-4" /> Bài thi của tôi
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={logout}
                  className="gap-2 py-2.5 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                className="hidden sm:inline-flex rounded-full px-6"
              >
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-lg shadow-indigo-600/20"
              >
                <Link href="/login">Bắt đầu</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
