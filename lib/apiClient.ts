/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  // QUAN TRỌNG NHẤT: Bắt trình duyệt tự động gửi Cookie kèm mọi request
  withCredentials: true, 
});

// ==============================================================================
// 1. CƠ CHẾ QUEUE (DÙNG CHO TRƯỜNG HỢP NHIỀU REQUEST CÙNG CHẾT LỖI 401 1 LÚC)
// ==============================================================================
let isRefreshing = false;
let failedQueue: any[] = [];

// Xử lý các request đang bị "treo" chờ refresh token
const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(); // Không cần truyền token nữa vì trình duyệt tự lo Cookie
    }
  });
  failedQueue = [];
};

// ==============================================================================
// 2. RESPONSE INTERCEPTOR: Xử lý 401 và tự động gọi Refresh
// ==============================================================================
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
    const silentEndpoints = ["/ai/suggestion", "/ai/quick-edit"];
    const isSilentEndpoint = silentEndpoints.some((endpoint) =>
      url.includes(endpoint),
    );

    if (isSilentEndpoint) {
      return Promise.reject(error);
    }

    const skipToast = originalRequest?.skipToast;

    // 3. XỬ LÝ LỖI 401 (HẾT HẠN COOKIE ACCESS TOKEN)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      url !== "/auth/refresh"
    ) {
      
      // Nếu có 1 request khác đang đi refresh rồi, thì request này phải xếp hàng
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Đánh dấu là đã thử retry để tránh lặp vô tận
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dùng axios thuần gọi Refresh, trình duyệt sẽ gửi Refresh Token (Cookie) lên
        await axios.post(
          `${originalRequest.baseURL || "http://localhost:3001"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Thành công!
        isRefreshing = false;
        processQueue(null);
        // Gọi lại chính cái request vừa bị chết 401
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // Refresh thất bại (Refresh Token cũng hết hạn sau 7 ngày) -> Đuổi ra trang Login
        isRefreshing = false;
        processQueue(refreshError);
        
        toast.error("Phiên đăng nhập đã hết hạn hoàn toàn");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    // 4. XỬ LÝ TOAST THÔNG BÁO CHO CÁC LỖI KHÁC
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