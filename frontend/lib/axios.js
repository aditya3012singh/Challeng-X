import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://api-codearena.duckdns.org/api",
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  },
});

// Request interceptor - useful for logging in development
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Cookies are automatically sent via withCredentials: true
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
let isRefreshing = false;
let failedQueue = [];
let injectedStore = null;

export const injectStore = (store) => {
  injectedStore = store;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    // 🛡️ CRITICAL: Do NOT attempt refresh logic if the request itself WAS the refresh call!
    // This prevents a deadlock where the refresh request queues itself.
    if (error.response?.status === 401 && originalRequest.url?.includes("/auth/refresh")) {
      isRefreshing = false;
      processQueue(error, null);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        if (!injectedStore) throw new Error("Redux store not injected");
        const { refreshAccessToken } = await import("../store/api/auth.thunk.js");

        // Attempt to refresh the token using injected store
        await injectedStore.dispatch(refreshAccessToken()).unwrap();
        processQueue(null);
        isRefreshing = false;
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        // Redirect if not already handled
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error("Forbidden access");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error("An error occurred:", error.response.data);
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
