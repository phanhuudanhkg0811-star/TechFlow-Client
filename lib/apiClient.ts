import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
});

// THÊM ĐOẠN NÀY ĐỂ TỰ ĐỘNG GẮN TOKEN:
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ nơi bạn lưu (thường là localStorage)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
