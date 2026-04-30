import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

// CHỈ SỬ DỤNG 1 RESPONSE INTERCEPTOR DUY NHẤT
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap data (Nếu backend trả về { data: ... })
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data
    ) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error) => {
    // 1. Bỏ qua hoàn toàn nếu đây là lỗi do ta chủ động hủy (AbortController)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const url = originalRequest?.url || "";

    // 2. TẠO DANH SÁCH "ĐƯỜNG CẤM" (Silent endpoints)
    // Nếu gọi AI bị lỗi 429 hay 503 thì âm thầm trả về reject, không hiện Toast
    const silentEndpoints = ["/ai/suggestion", "/ai/quick-edit"];
    const isSilentEndpoint = silentEndpoints.some((endpoint) =>
      url.includes(endpoint),
    );

    if (isSilentEndpoint) {
      return Promise.reject(error);
    }

    const skipToast = originalRequest?.skipToast;

    // 3. XỬ LÝ LỖI 401 (HẾT HẠN TOKEN)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;

      try {
        // Trình duyệt tự nhét Refresh Cookie vào
        await apiClient.post("/auth/refresh");

        // Có token mới (Cookie tự update), gọi lại API bị lỗi
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại (hết 7 ngày) -> Đuổi thẳng cổ ra Login
        console.error("Phiên đăng nhập đã hết hạn hoàn toàn");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // 4. XỬ LÝ TOAST THÔNG BÁO CHO CÁC LỖI KHÁC
    // Nếu lỗi chính là từ /auth/refresh thì block try-catch ở trên đã xử lý redirect rồi, không cần Toast.
    if (!skipToast && url !== "/auth/refresh") {
      let message = "Đã có lỗi xảy ra. Vui lòng thử lại.";

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        switch (status) {
          case 400:
            message = serverMessage || "Dữ liệu không hợp lệ.";
            break;
          case 401:
            message = "Phiên đăng nhập hết hạn. Đang chuyển hướng...";
            break;
          case 403:
            message = "Bạn không có quyền thực hiện hành động này.";
            break;
          case 404:
            message = "Không tìm thấy tài nguyên.";
            break;
          case 422:
            message = serverMessage || "Dữ liệu không hợp lệ.";
            break;
          case 500:
            message = "Lỗi máy chủ. Vui lòng thử lại sau.";
            break;
          default:
            message = serverMessage || `Lỗi không xác định (${status})`;
        }
      } else if (error.request) {
        message = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.";
      } else {
        message = error.message || "Đã xảy ra lỗi không mong muốn.";
      }

      toast.error(message, { duration: 5000 });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
