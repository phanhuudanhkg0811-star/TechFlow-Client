"use client";

import { useEffect, useState } from "react";
import { LoaderIcon, RefreshCwIcon, GlobeIcon } from "lucide-react";
import { getWebContainer } from "../hooks/use-webcontainer";

export const Preview = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const listenToPreview = async () => {
      try {
        const wc = await getWebContainer();
        
        // Lắng nghe sự kiện khi có một port được mở (ví dụ ứng viên chạy npm run dev)
        wc.on('server-ready', (port, previewUrl) => {
          if (mounted) {
            setUrl(previewUrl);
            setIsLoading(false);
          }
        });

      } catch (err) {
        console.error("Lỗi hook Preview:", err);
      }
    };

    listenToPreview();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = () => {
    if (url) {
      setIsLoading(true);
      setUrl((prev) => prev ? `${prev}?t=${Date.now()}` : prev);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-border/50">
      {/* Thanh địa chỉ giả lập */}
      <div className="flex items-center gap-2 p-2 bg-slate-100 border-b border-slate-200 shrink-0">
        <button 
          onClick={handleRefresh}
          disabled={!url}
          className="p-1.5 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-slate-600 transition-colors"
          title="Tải lại trang"
        >
          <RefreshCwIcon className="w-3.5 h-3.5" />
        </button>
        <div className="flex flex-1 items-center gap-2 bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-500 overflow-hidden shadow-sm">
          <GlobeIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {url || "Đang chờ server khởi động (VD: port 3000)..."}
          </span>
        </div>
      </div>

      {/* Vùng hiển thị website */}
      <div className="flex-1 relative bg-white min-h-0">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 backdrop-blur-sm">
            <LoaderIcon className="w-6 h-6 animate-spin text-indigo-500 mb-3" />
            <p className="text-sm text-slate-500 font-medium">
              {url ? "Đang tải Preview..." : "Vui lòng chạy app trong Terminal"}
            </p>
          </div>
        )}
        
        {url ? (
          <iframe 
            src={url} 
            className="w-full h-full border-none"
            title="Preview Sandbox"
            onLoad={() => setIsLoading(false)}
            allow="cross-origin-isolated"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Chưa có Preview nào được hiển thị
          </div>
        )}
      </div>
    </div>
  );
};