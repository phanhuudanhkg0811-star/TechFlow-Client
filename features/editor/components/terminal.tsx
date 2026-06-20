// file: features/editor/components/terminal.tsx
"use client";

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
// 1. Import Clipboard Addon
import "@xterm/xterm/css/xterm.css";
import { ClipboardAddon } from '@xterm/addon-clipboard';
import { getWebContainer } from "../hooks/use-webcontainer";
import { useLocalFiles, FileNode } from "@/features/test/hooks/use-local-files";
import { transformToWebContainerFiles } from "../lib/webcontainer-utils";

export const Terminal = ({ testId }: { testId: string }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const { files, isLoaded } = useLocalFiles(testId);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const fitAddon = new FitAddon();
    // 2. Khởi tạo Clipboard Addon
    const clipboardAddon = new ClipboardAddon();

    const term = new XTerm({
      cursorBlink: true,
      theme: { background: "#1e1e2e", foreground: "#cdd6f4" },
      fontFamily: '"Fira Code", monospace',
      fontSize: 13,
      // 3. Cấu hình để hỗ trợ phím tắt Paste mặc định của trình duyệt
      allowProposedApi: true, 
    });
    
    term.loadAddon(fitAddon);
    // 4. Load Clipboard Addon vào terminal
    term.loadAddon(clipboardAddon);
    
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    const resizeObserver = new ResizeObserver(() => {
      try { fitAddon.fit(); } catch (e) {}
    });
    resizeObserver.observe(terminalRef.current);

    const initTerminal = async () => {
      term.writeln("\x1b[1;36mKhởi động môi trường WebContainer...\x1b[0m");
      try {
        const wc = await getWebContainer();
        
        if (isLoaded && !isMountedRef.current) {
          const containerFiles = transformToWebContainerFiles(files);
          await wc.mount(containerFiles);
          isMountedRef.current = true;
          term.writeln("\x1b[1;32m✅ Đã đồng bộ mã nguồn.\x1b[0m\r\n");
        }

        const shellProcess = await wc.spawn("jsh");
        shellProcess.output.pipeTo(new WritableStream({
          write(data) { term.write(data); }
        }));

        const input = shellProcess.input.getWriter();
        term.onData((data) => {
          input.write(data);
        });

        // 5. Xử lý Paste thủ công qua sự kiện browser để đảm bảo 100% hoạt động
        terminalRef.current?.addEventListener('paste', (e) => {
          const text = e.clipboardData?.getData('text');
          if (text) {
            input.write(text);
          }
        });

      } catch (err) {
        term.writeln("\r\n\x1b[31mLỗi khởi động.\x1b[0m");
      }
    };

    initTerminal();

    return () => {
      resizeObserver.disconnect();
      term.dispose(); //hủy bỏ instance term để đỡ tốn RAM
      xtermRef.current = null; //set xtermRef là null để cho bài test khác sử dụng
    };
  }, [testId, isLoaded]);

  // Thêm ref này để lưu lại trạng thái file trước đó
  const prevFilesRef = useRef<FileNode[]>([]);

  useEffect(() => {
    const syncFiles = async () => {
      if (!isMountedRef.current) return;
      const wc = await getWebContainer();

      // Hàm đệ quy để tìm đường dẫn đầy đủ của file (ví dụ: src/components/Button.jsx)
      const getFullPath = (fileId: string, allFiles: FileNode[]): string => {
        const file = allFiles.find((f) => f.id === fileId);
        if (!file) return "";
        if (!file.parentId) return file.name;
        return `${getFullPath(file.parentId, allFiles)}/${file.name}`;
      };

      for (const node of files) {
        if (node.type === "file") {
          // Tìm file cũ để so sánh
          const oldFile = prevFilesRef.current.find(f => f.id === node.id);

          // CHỈ ghi vào WebContainer nếu file mới tạo hoặc nội dung bị thay đổi
          if (!oldFile || oldFile.content !== node.content) {
            const fullPath = getFullPath(node.id, files);
            try {
              // Phân tích lấy thư mục cha
              const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
              if (dirPath) {
                // Tạo thư mục nếu chưa tồn tại (tránh lỗi ENOENT)
                try { await wc.fs.mkdir(dirPath, { recursive: true }); } catch (e) {}
              }
              // Ghi file vào đúng vị trí
              await wc.fs.writeFile(fullPath, node.content || "");
            } catch (err) {
              console.error(`Lỗi đồng bộ file ${fullPath}:`, err);
            }
          }
        }
      }
      // Cập nhật lại lịch sử file
      prevFilesRef.current = files;
    };
    
    syncFiles();
  }, [files]);

  return (
    <div className="h-full w-full bg-[#1e1e2e] p-2 overflow-hidden flex flex-col">
      <div ref={terminalRef} className="flex-1 w-full min-h-0 overflow-hidden" />
    </div>
  );
};