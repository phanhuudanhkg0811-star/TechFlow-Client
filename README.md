<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-react/lucide/main/icons/bot.svg" width="80" height="80" />
  <h1>🖥️ AI-TechFlow Frontend</h1>
  <p><b>Next-Gen Web-IDE & Recruitment Dashboard</b></p>

  <p>
    <img src="https://img.shields.io/badge/Framework-Next.js_15_(App_Router)-black?style=flat-square&logo=next.js" />
    <img src="https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript" />
    <img src="https://img.shields.io/badge/Editor-CodeMirror_6-FF4081?style=flat-square" />
    <img src="https://img.shields.io/badge/Runtime-WebContainers-000000?style=flat-square" />
    <img src="https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css" />
  </p>

  <p><i>Phần giao diện người dùng của hệ thống tuyển dụng AI-TechFlow, tích hợp môi trường lập trình trực tuyến và bảng điều khiển phân tích ứng viên.</i></p>
</div>

---

## 🚀 Tổng quan module Frontend

Frontend của AI-TechFlow không chỉ là các trang web tĩnh mà là một **Single Page Application (SPA)** phức tạp với khả năng giả lập môi trường hệ điều hành ngay trên trình duyệt.

### 🧩 Các Module Chính

1.  **Web-IDE Engine (`/features/editor`)**:
    * Sử dụng **WebContainers API** để chạy Node.js runtime trong trình duyệt.
    * **Terminal (`XTerm.js`)**: Kết nối trực tiếp với shell của WebContainer, hỗ trợ paste và resize linh hoạt.
    * **Browser Preview**: Iframe hiển thị kết quả thời gian thực của ứng dụng (hỗ trợ hot-reload).

2.  **Smart Editor Core (`/features/editor/components/code-editor.tsx`)**:
    * Dựa trên **CodeMirror 6** với kiến trúc extension.
    * **AI Suggestion**: Ghost text tự động hiện ra khi gõ (tương tự Copilot).
    * **Quick Edit (Cmd+K)**: Bôi đen code và ra lệnh cho AI chỉnh sửa trực tiếp.
    * **Minimap & Indent Markers**: Tối ưu trải nghiệm lập trình chuyên nghiệp.

3.  **AI Chat Sidebar (`/features/conversation`)**:
    * Hỗ trợ Markdown rendering cực đẹp với `react-markdown`.
    * **Context-Aware**: Cho phép ứng viên đính kèm tệp/thư mục làm ngữ cảnh cho câu hỏi.
    * **One-click Apply**: AI trả về code block kèm nút "Apply", nhấn vào sẽ tự động ghi đè code vào file tương ứng.

4.  **HR Dashboard (`/app/dashboard`)**:
    * Bảng xếp hạng ứng viên dựa trên điểm số AI.
    * Trình xem chi tiết hồ sơ: So sánh nội dung CV, phân tích Github và xem lại mã nguồn bài làm của ứng viên.

---

## 🛠 Công nghệ sử dụng

* **Core:** Next.js 15, React 19, TypeScript.
* **State Management:** `Zustand` (Quản lý File System local, Tab Editor và Chat Context).
* **Communication:** `Axios` với interceptors tự động xử lý xoay vòng JWT (Access/Refresh Token).
* **UI Components:** `Shadcn/ui`, `Framer Motion` (Animation), `Lucide` & `Tabler Icons`.
* **Layout:** `Allotment` (Tạo các panel có thể kéo dãn kích thước như VS Code).

---

## 📂 Cấu trúc thư mục

```text
src/
├── app/                  # Next.js App Router (Auth, Dashboard, Tests)
├── components/           # UI Components dùng chung (Button, Input, etc.)
├── features/             # Các tính năng nghiệp vụ lớn
│   ├── editor/           # Logic WebContainer, CodeMirror, Terminal
│   ├── conversation/     # Chatbot, Lịch sử hội thoại, Context Store
│   ├── test/             # File Explorer, Đếm ngược thời gian, Nộp bài
│   └── dashboard-detail/ # Các Dialog phân tích sâu ứng viên
├── lib/                  # Cấu hình API Client, Utils
└── store/                # Global states (Zustand)