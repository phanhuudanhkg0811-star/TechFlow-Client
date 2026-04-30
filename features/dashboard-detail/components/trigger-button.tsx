// Thêm các icon này vào danh sách import @tabler/icons-react ở đầu file
import { IconMailFast, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

export default function TriggerPipelineButton() {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTrigger = async () => {
    try {
      setIsTriggering(true);
      const res = await apiClient.post('/ai/trigger-pipeline');
      
      toast.success(res.data?.message || "Đã ra lệnh quét hòm thư!");
    } catch (error) {
      toast.error("Không thể kích hoạt Pipeline lúc này.");
    } finally {
      // Giữ trạng thái xoay 1.5s cho có cảm giác hệ thống đang xử lý
      setTimeout(() => setIsTriggering(false), 1500);
    }
  };

  return (
    <Button 
      onClick={handleTrigger} 
      disabled={isTriggering}
      variant="secondary"
      className="gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30"
    >
      {isTriggering ? (
        <IconRefresh className="animate-spin" size={18} />
      ) : (
        <IconMailFast size={18} />
      )}
      {isTriggering ? "Đang quét hòm thư..." : "Quét CV ngay"}
    </Button>
  );
}