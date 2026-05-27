/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

// ==============================================================================
// 1. CƠ CHẾ QUEUE & DECODE JWT CHO REQUEST INTERCEPTOR
// ==============================================================================
let isRefreshing = false;
let requestQueue: any[] = [];

// Xử lý các request đang bị "treo" chờ refresh token
const processQueue = (error: any, token: string | null = null) => {
  requestQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  requestQueue = [];
};

// Hàm dịch ngược JWT để lấy thời gian mà không cần thư viện ngoài
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// ==============================================================================
// 2. REQUEST INTERCEPTOR: TỰ ĐỘNG REFRESH TOKEN KHI ĐẠT 70% THỜI GIAN SỐNG
// ==============================================================================
apiClient.interceptors.request.use(
  async (config) => {
    // Bỏ qua các route auth để tránh lặp vô tận
    if (config.url?.includes("/auth/")) return config;

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (token) {
        // Gắn Bearer Token vào header (phòng hờ backend cần lấy từ header thay vì Cookie)
        config.headers.Authorization = `Bearer ${token}`;

        const decoded = parseJwt(token);
        if (decoded && decoded.exp && decoded.iat) {
          const currentTime = Date.now() / 1000;
          const lifetime = decoded.exp - decoded.iat;

          // Mốc 70% thời gian sống
          const timeToRefresh = decoded.iat + lifetime * 0.7;

          // Nếu đã chạm mốc 70% nhưng chưa hết hạn hẳn
          if (currentTime >= timeToRefresh && currentTime < decoded.exp) {
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                // Dùng axios thuần để gọi refresh, tránh kích hoạt lại chính interceptor này
                const res = await axios.post(
                  `${config.baseURL}/auth/refresh`,
                  {},
                  { withCredentials: true },
                );
                const newToken =
                  res.data?.data?.accessToken || res.data?.accessToken;

                if (newToken) {
                  localStorage.setItem("accessToken", newToken);
                  config.headers.Authorization = `Bearer ${newToken}`;
                  processQueue(null, newToken);
                }
              } catch (err) {
                processQueue(err, null);
              } finally {
                isRefreshing = false;
              }
            } else {
              // Nếu đang có 1 request khác làm nhiệm vụ refresh rồi, các request tới cùng lúc phải xếp hàng đợi
              return new Promise((resolve, reject) => {
                requestQueue.push({ resolve, reject });
              })
                .then((newToken) => {
                  config.headers.Authorization = `Bearer ${newToken}`;
                  return config;
                })
                .catch((err) => Promise.reject(err));
            }
          }
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ==============================================================================
// 3. RESPONSE INTERCEPTOR (Phương án dự phòng - Fallback)
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
        // QUAN TRỌNG: Dùng axios thuần giống hệt ở trên để tránh bị dính interceptor
        const res = await axios.post(
          `${originalRequest.baseURL || "http://localhost:3001"}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        // Lấy token mới từ body response
        const newToken = res.data?.data?.accessToken || res.data?.accessToken;

        if (newToken) {
          // 1. Cập nhật localStorage để các request sau dùng
          localStorage.setItem("accessToken", newToken);
          // 2. Cập nhật header cho request đang bị lỗi để nó gửi lại đúng
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // 3. Gọi lại API bị lỗi
          return apiClient(originalRequest);
        } else {
          throw new Error("Không nhận được token mới từ server");
        }
      } catch (refreshError) {
        // Refresh thất bại (hết 7 ngày) -> Đuổi thẳng cổ ra Login
        console.error("Phiên đăng nhập đã hết hạn hoàn toàn");
        localStorage.removeItem("accessToken"); // Nhớ dọn rác luôn
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
