"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ShieldAlert,
  Code2,
  ArrowRight,
  CheckCircle2,
  Layers,
  Cpu,
  Mail,
  GitBranch,
  LineChart,
  Users,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/nav-bar";

const featureTabs = [
  { id: "scan", title: "Quét CV Vector", icon: <Layers className="w-4 h-4" /> },
  {
    id: "ide",
    title: "Web-IDE Giám sát",
    icon: <Terminal className="w-4 h-4" />,
  },
  { id: "ai", title: "Tech Lead Ảo", icon: <Cpu className="w-4 h-4" /> },
];

const workflows = [
  {
    step: "01",
    title: "Nhận & Sàng lọc Email",
    desc: "Hệ thống tự động lắng nghe IMAP, bóc tách PDF và đối chiếu CV bằng pgvector.",
    icon: <Mail className="w-6 h-6" />,
  },
  {
    step: "02",
    title: "Điều phối Bài Test",
    desc: "Nếu CV đạt chuẩn, ứng viên nhận ngay email chứa link vào phòng thi Web-IDE an toàn.",
    icon: <ArrowRight className="w-6 h-6" />,
  },
  {
    step: "03",
    title: "Thực chiến & Thu thập",
    desc: "Bắt gọn sự kiện Copy/Paste và lưu trữ hội thoại Prompt nội bộ.",
    icon: <Code2 className="w-6 h-6" />,
  },
  {
    step: "04",
    title: "Phân tích & Tóm tắt",
    desc: "Gemini Agent đọc mã nguồn GitHub và bài thi để xuất Dashboard điểm số toàn diện.",
    icon: <LineChart className="w-6 h-6" />,
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState(featureTabs[0].id);

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden font-sans transition-colors duration-500">
      <Navbar />
      
      {/* ===== REFACTORED LUSH MESH GRADIENT LAYER EMBED ===== */}
      <div className="mesh-gradient-container">
        <div className="mesh-ball-1" />
        <div className="mesh-ball-2" />
        <div className="mesh-ball-3" />
        <div className="mesh-grid-overlay" />
      </div>

      <main className="relative z-10 pb-20 pt-24">
        {/* HERO SECTION */}
        <section className="container mx-auto px-6 pt-20 pb-20 text-center flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tighter max-w-4xl mb-8 leading-tight text-slate-900 dark:text-white"
          >
            Tuyển dụng kỹ sư bằng <br className="hidden md:block" />
            <span className="animate-gradient-reverse">AI TechFlow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed font-medium"
          >
            Vượt khỏi ranh giới của CV tĩnh. Hệ thống tự động truy xuất GitHub,
            khởi tạo môi trường Web-IDE và đánh giá tư duy kiến trúc mã nguồn
            như một Tech Lead thực thụ.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/dashboard/jobs">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 text-base bg-primary hover:opacity-90 text-primary-foreground rounded-full shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 group"
              >
                Khởi tạo chiến dịch ngay
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/tests">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base border-border bg-card/40 hover:bg-muted/60 text-foreground rounded-full backdrop-blur-md transition-all hover:-translate-y-1"
              >
                <Code2 className="w-5 h-5 mr-2" /> Trải nghiệm Web-IDE
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* FLOATING MOCKUP */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="container mx-auto px-4 max-w-6xl mb-32"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative rounded-2xl md:rounded-[2rem] border border-border/80 bg-card/60 dark:bg-card/30 backdrop-blur-xl p-2 md:p-4 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.3)] overflow-hidden ring-1 ring-black/5 dark:ring-white/5"
          >
            {/* Header Mockup */}
            <div className="flex items-center gap-2 px-4 pb-4 pt-2 border-b border-border/50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 flex justify-center">
                <div className="bg-muted/60 px-4 py-1 rounded-md text-xs text-muted-foreground font-mono border border-border/40 flex items-center gap-2 shadow-inner">
                  <ShieldAlert className="w-3 h-3 text-primary" />{" "}
                  ai-techflow-test-session.app
                </div>
              </div>
            </div>

            {/* Body Mockup */}
            <div className="rounded-xl overflow-hidden border border-border/40 bg-muted/30 dark:bg-black/40 grid grid-cols-1 md:grid-cols-3 min-h-[400px] mt-2">
              <div className="hidden md:block col-span-1 border-r border-border/40 p-4 bg-card/40 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-mono font-semibold">
                  <Terminal className="w-4 h-4" /> Explorer
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-border/80 rounded w-3/4" />
                  <div className="h-3 bg-border/50 rounded w-1/2 ml-4" />
                  <div className="h-6 bg-accent text-accent-foreground text-xs flex items-center px-2 rounded w-5/6 ml-4 border border-border font-mono">
                    main.ts
                  </div>
                  <div className="h-3 bg-border/50 rounded w-2/3 ml-4" />
                </div>
              </div>
              
              <div className="col-span-2 p-6 font-mono text-sm leading-relaxed bg-[#1e1e24] text-slate-300 dark:bg-[#0a0a0f]">
                <div className="text-slate-500 mb-2">{"// Phân tích mã nguồn và bắt sự kiện gõ phím"}</div>
                <div className="text-emerald-400">
                  const <span className="text-blue-400">agenticReview</span> = await{" "}
                  <span className="text-yellow-200">analyzeCandidateCode</span>({"{"}
                </div>
                <div className="ml-4">
                  sessionId: <span className="text-orange-300">&apos;req_8f72a&apos;</span>,
                </div>
                <div className="ml-4">
                  githubProfile: <span className="text-orange-300">&apos;@huudanh&apos;</span>,
                </div>
                <div className="ml-4">
                  enableIntegrityCheck: <span className="text-purple-400">true</span>
                </div>
                <div className="text-emerald-400">{"}"});</div>

                <div className="mt-6 space-y-3">
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-2 text-blue-400 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20 w-max text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">Integrity Score: 95% - Sẵn sàng phỏng vấn</span>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 w-max text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-semibold">AI Match: 87% - Ứng viên tiềm năng</span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                    className="flex items-center gap-2 text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20 w-max text-xs"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-semibold">Cảnh báo: Phát hiện sao chép mã nguồn</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION: TÍNH NĂNG CHÍNH */}
        <section id="features" className="container mx-auto px-6 max-w-4xl mb-32 pt-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Sức mạnh của AI TechFlow
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-2 justify-center mb-8">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-full flex items-center gap-2 font-semibold transition-colors${
                  activeTab === tab.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon} {tab.title}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-card/60 dark:bg-card/20 border border-border rounded-[2rem] p-8 md:p-12 shadow-xl backdrop-blur-md min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === "scan" && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center max-w-xl min-h-52"
                >
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Layers className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Quét CV Vector tốc độ cao</h3>
                  <p className="text-muted-foreground text-base">
                    Hệ thống tự động đọc PDF, bóc tách dữ liệu và nhúng thành
                    3072 chiều bằng pgvector. Phân tích độ tương thích giữa CV
                    và Job Description chính xác tuyệt đối.
                  </p>
                </motion.div>
              )}
              {activeTab === "ide" && (
                <motion.div
                  key="ide"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center max-w-xl min-h-52"
                >
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Terminal className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">WebContainers Thực chiến</h3>
                  <p className="text-muted-foreground text-base">
                    Môi trường Node.js chạy trực tiếp trên trình duyệt. Thu thập
                    telemetry: sự kiện dán code, chuyển tab, và lịch sử tương
                    tác với trợ lý AI nội bộ.
                  </p>
                </motion.div>
              )}
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center max-w-xl min-h-52"
                >
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Đánh giá Tính toàn vẹn</h3>
                  <p className="text-muted-foreground text-base">
                    AI tự động cào source code từ GitHub, phân tích cấu
                    trúc thư mục để phát hiện sự phóng đại trong CV. Sinh bộ câu
                    hỏi phỏng vấn &quot;xoáy&quot; chuyên sâu.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SECTION: LUỒNG HOẠT ĐỘNG */}
        <section id="workflow" className="container mx-auto px-6 max-w-6xl mb-32 pt-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Vòng lặp tự động hóa khép kín
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Từ email ứng tuyển đến báo cáo năng lực chi tiết, mọi thứ đều diễn
              ra ngầm mà không cần sự can thiệp thủ công.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {workflows.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-card/40 dark:bg-card/10 border border-border rounded-2xl p-6 hover:shadow-xl hover:bg-card/70 dark:hover:bg-card/20 backdrop-blur-xs transition-all"
              >
                <div className="text-5xl font-black text-primary/5 absolute top-4 right-4 pointer-events-none">
                  {item.step}
                </div>
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION: GIẢI PHÁP */}
        <section id="solutions" className="container mx-auto px-6 max-w-6xl mb-32 pt-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Được xây dựng cho <span className="text-primary">mọi vai trò</span> trong tuyển dụng IT
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bộ phận Nhân sự */}
            <div className="group relative bg-card/40 dark:bg-card/10 border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 mb-4 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Bộ phận Nhân sự</h3>
              <p className="text-xs font-semibold text-blue-500 mb-3">Tự động hóa 100% sàng lọc CV</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Không còn cảnh đọc hàng trăm email CV thủ công mỗi ngày. Dashboard trực quan giúp ra quyết định nhanh chóng mà không cần rành kỹ thuật.
              </p>
            </div>

            {/* Quản lý Kỹ thuật */}
            <div className="group relative bg-card/40 dark:bg-card/10 border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 mb-4 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Quản lý Kỹ thuật</h3>
              <p className="text-xs font-semibold text-purple-500 mb-3">AI Tech Lead chấm code thay bạn</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Trút bỏ gánh nặng chấm bài test lặp đi lặp lại. Nhận ngay bộ câu hỏi phỏng vấn &quot;xoáy&quot; vào các đoạn code copy hời hợt.
              </p>
            </div>

            {/* Ứng viên */}
            <div className="group relative bg-card/40 dark:bg-card/10 border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="w-12 h-12 mb-4 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold mb-1">Ứng viên Tìm việc</h3>
              <p className="text-xs font-semibold text-emerald-500 mb-3">Trải nghiệm test đẳng cấp</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Trải nghiệm môi trường test chuyên nghiệp trực tiếp trên trình duyệt. Đánh giá dựa trên năng lực thực chiến thay vì thuật toán khô khan.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-md relative z-10">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg tracking-tight animate-gradient-reverse">
                  AI-TechFlow
                </span>
              </div>
              <p className="text-muted-foreground text-xs max-w-sm">
                Nền tảng tuyển dụng IT thế hệ mới, nơi Agentic AI đánh giá năng lực thực chiến thay vì chỉ đọc CV.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-xs uppercase tracking-wider">Sản phẩm</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition">Tính năng</Link></li>
                <li><Link href="#workflow" className="hover:text-primary transition">Quy trình</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3 text-xs uppercase tracking-wider">Công ty</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition">Về chúng tôi</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition">Liên hệ</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} AI-TechFlow. Tất cả các quyền được
              bảo lưu.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition">Điều khoản</Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition">Bảo mật</Link>
              <Link href="https://github.com/huudanh/ai-techflow" target="_blank" className="text-xs text-muted-foreground hover:text-primary transition">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
