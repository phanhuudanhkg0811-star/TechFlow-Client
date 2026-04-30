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
  BrainCircuit,
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
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500">
      <Navbar />
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[600px] h-[500px] bg-indigo-500/20 dark:bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/20 dark:bg-emerald-600/20 blur-[100px] rounded-full pointer-events-none" />

      <main className="relative z-10 pb-20 pt-24">
        {/* HERO SECTION (giữ nguyên) */}
        <section className="container mx-auto px-6 pt-20 pb-20 text-center flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tighter max-w-4xl mb-8 leading-tight"
          >
            Tuyển dụng kỹ sư bằng <br className="hidden md:block" />
            <span className="animate-gradient-reverse">AI TechFlow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed font-medium"
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
                className="w-full sm:w-auto h-14 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-[0_10px_40px_rgba(79,70,229,0.3)] dark:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 group"
              >
                Khởi tạo chiến dịch ngay
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link href="/tests">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-14 px-8 text-base border-slate-300 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-full backdrop-blur-sm transition-all hover:-translate-y-1"
              >
                <Code2 className="w-5 h-5 mr-2" /> Trải nghiệm Web-IDE
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* FLOATING MOCKUP (giữ nguyên) */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="container mx-auto px-4 max-w-6xl mb-32"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="relative rounded-2xl md:rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-2xl p-2 md:p-4 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5"
          >
            {/* Header Mockup */}
            <div className="flex items-center gap-2 px-4 pb-4 pt-2 border-b border-slate-100 dark:border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/80" />
              <div className="ml-4 flex-1 flex justify-center">
                <div className="bg-slate-100 dark:bg-white/5 px-4 py-1 rounded-md text-xs text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-white/5 flex items-center gap-2 shadow-inner">
                  <ShieldAlert className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />{" "}
                  ai-techflow-test-session.app
                </div>
              </div>
            </div>

            {/* Body Mockup */}
            <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0D0D12] grid grid-cols-1 md:grid-cols-3 min-h-[400px] mt-2">
              <div className="hidden md:block col-span-1 border-r border-slate-200 dark:border-white/5 p-4 bg-white dark:bg-transparent">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4 font-mono font-semibold">
                  <Terminal className="w-4 h-4" /> Explorer
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-1/2 ml-4" />
                  <div className="h-6 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs flex items-center px-2 rounded w-5/6 ml-4 border border-indigo-200 dark:border-indigo-500/20 font-mono">
                    main.ts
                  </div>
                  <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-2/3 ml-4" />
                </div>
              </div>
              <div className="col-span-2 p-6 font-mono text-sm leading-relaxed">
                <div className="text-slate-400 dark:text-slate-500 mb-2">
                  {"// Phân tích mã nguồn và bắt sự kiện gõ phím"}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400">
                  const{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    agenticReview
                  </span>{" "}
                  = await{" "}
                  <span className="text-amber-600 dark:text-yellow-200">
                    analyzeCandidateCode
                  </span>
                  ({"{"}
                </div>
                <div className="text-slate-700 dark:text-slate-300 ml-4">
                  sessionId:{" "}
                  <span className="text-orange-600 dark:text-orange-300">
                    &apos;req_8f72a&apos;
                  </span>
                  ,
                </div>
                <div className="text-slate-700 dark:text-slate-300 ml-4">
                  githubProfile:{" "}
                  <span className="text-orange-600 dark:text-orange-300">
                    &apos;@huudanh&apos;
                  </span>
                  ,
                </div>
                <div className="text-slate-700 dark:text-slate-300 ml-4">
                  enableIntegrityCheck:{" "}
                  <span className="text-purple-600 dark:text-purple-400">
                    true
                  </span>
                </div>
                <div className="text-emerald-600 dark:text-emerald-400">
                  {"}"});
                </div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 }}
                  className="mt-8 flex items-center gap-2 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-lg border border-indigo-200 dark:border-indigo-500/20 w-max shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />{" "}
                  <span className="font-semibold">
                    Integrity Score: 95% - Sẵn sàng phỏng vấn
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg border border-emerald-200 dark:border-emerald-500/20 w-max shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">
                    AI Match: 87% - Ứng viên tiềm năng
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 }}
                  className="mt-8 flex items-center gap-2 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-200 dark:border-red-500/20 w-max shadow-sm"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">
                    Cảnh báo: Phát hiện sao chép mã nguồn
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION: TÍNH NĂNG CHÍNH (giữ nguyên) */}
        <section
          id="features"
          className="container mx-auto px-6 max-w-4xl mb-32 pt-10"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Sức mạnh của AI TechFlow
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-full flex items-center gap-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-200"
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-indigo-600 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab.icon} {tab.title}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 md:p-12 shadow-xl dark:shadow-none min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === "scan" && (
                <motion.div
                  key="scan"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center max-w-xl"
                >
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Nhúng dữ liệu Vector tốc độ cao
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
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
                  className="text-center max-w-xl"
                >
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Terminal className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    WebContainers Thực chiến
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
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
                  className="text-center max-w-xl"
                >
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Cpu className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Đánh giá Tính toàn vẹn
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    AI tự động cào source code từ GitHub, phân tích cấu
                    trúc thư mục để phát hiện sự phóng đại trong CV. Sinh bộ câu
                    hỏi phỏng vấn &quot;xoáy&quot; chuyên sâu.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SECTION: LUỒNG HOẠT ĐỘNG (giữ nguyên) */}
        <section
          id="workflow"
          className="container mx-auto px-6 max-w-6xl mb-32 pt-10"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Vòng lặp tự động hóa khép kín
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
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
                className="relative bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:shadow-xl dark:hover:bg-white/[0.04] transition-all"
              >
                <div className="text-5xl font-black text-slate-100 dark:text-white/5 absolute top-4 right-6 pointer-events-none">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 relative z-10">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 relative z-10">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed relative z-10">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION: GIẢI PHÁP & ĐỐI TƯỢNG (MỚI - ĐẸP HƠN) */}
        <section
          id="solutions"
          className="container mx-auto px-6 max-w-6xl mb-32 pt-10"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Được xây dựng cho{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-emerald-500 animate-text-gradient">
                mọi vai trò
              </span>{" "}
              trong tuyển dụng IT
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Dù bạn là HR, Tech Lead hay ứng viên, AI‑TechFlow đều mang đến
              trải nghiệm khác biệt.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card HR */}
            <div className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:border-indigo-200 dark:hover:border-indigo-500/30">
              {/* Gradient border effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-[2px] shadow-lg shadow-blue-500/20">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Bộ phận Nhân sự
                </h3>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                  Tự động hóa 100% sàng lọc CV
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Không còn cảnh đọc hàng trăm email CV thủ công mỗi ngày.
                  Dashboard trực quan giúp ra quyết định nhanh chóng mà không
                  cần rành kỹ thuật.
                </p>
              </div>
            </div>

            {/* Card Tech Lead */}
            <div className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 hover:border-purple-200 dark:hover:border-purple-500/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[2px] shadow-lg shadow-purple-500/20">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
                    <GitBranch className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Quản lý Kỹ thuật
                </h3>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-4">
                  AI Tech Lead chấm code thay bạn
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Trút bỏ gánh nặng chấm bài test lặp đi lặp lại. Nhận ngay bộ
                  câu hỏi phỏng vấn &quot;xoáy&quot; vào các đoạn code copy hoặc
                  prompt hời hợt của ứng viên.
                </p>
              </div>
            </div>

            {/* Card Ứng viên */}
            <div className="group relative bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 hover:border-emerald-200 dark:hover:border-emerald-500/30">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-14 h-14 mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[2px] shadow-lg shadow-emerald-500/20">
                  <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
                    <Terminal className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  Ứng viên Tìm việc
                </h3>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">
                  Trải nghiệm test đẳng cấp
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Trải nghiệm môi trường test chuyên nghiệp, mượt mà trực tiếp
                  trên trình duyệt. Đánh giá dựa trên năng lực thực chiến thay
                  vì thuật toán khô khan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER MỚI - Bỏ hackathon */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black relative z-10">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-6 h-6 text-blue-400 dark:text-blue-500" />
                <span className="font-bold text-xl tracking-tight animate-gradient-reverse">
                  AI-TechFlow
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
                Nền tảng tuyển dụng IT thế hệ mới, nơi Agentic AI đánh giá năng
                lực thực chiến thay vì chỉ đọc CV.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    Tính năng
                  </Link>
                </li>
                <li>
                  <Link
                    href="#workflow"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    Quy trình
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Công ty</h4>
              <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                  >
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-white/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              © {new Date().getFullYear()} AI-TechFlow. Tất cả các quyền được
              bảo lưu.
            </p>
            <div className="flex gap-6">
              <Link
                href="/terms"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Điều khoản
              </Link>
              <Link
                href="/privacy"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                Bảo mật
              </Link>
              <Link
                href="https://github.com/huudanh/ai-techflow"
                target="_blank"
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
