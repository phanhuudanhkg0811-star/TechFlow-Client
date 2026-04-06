"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  IconLayoutDashboard, 
  IconBriefcase, 
  IconUsers, 
  IconSettings,
  IconSparkles,
  IconLogout
} from "@tabler/icons-react";
import apiClient from "@/lib/apiClient";
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { name: "Tổng quan", href: "/dashboard", icon: <IconLayoutDashboard size={20} /> },
    { name: "Chiến dịch & Đề thi", href: "/dashboard/jobs", icon: <IconBriefcase size={20} /> },
    { name: "Hồ sơ Ứng viên", href: "/dashboard/candidates", icon: <IconUsers size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      // 1. Gửi request xuống NestJS. 
      // API client phải bật `withCredentials: true` để nó tự đính kèm cookie gửi đi
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error("Lỗi khi gọi API đăng xuất:", error);
    } finally {
      // 2. Dù API thành công hay thất bại, thì cứ phải hủy cái vé tạm thời trên tay đã
      localStorage.removeItem("accessToken");
      
      // 3. Đá văng về trang đăng nhập
      router.push("/login");
    }
  }

  return (
    <div className="flex h-screen w-full bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <IconSparkles className="text-primary" /> AI-TechFlow
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors" onClick={handleLogout}>
            <IconLogout size={20} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex-shrink-0 border-b bg-background flex items-center justify-between px-6">
          <h2 className="font-semibold text-lg text-foreground">
            {navItems.find(item => item.href === pathname)?.name || "Workspace"}
          </h2>
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground">
              <IconSettings size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
              HR
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}