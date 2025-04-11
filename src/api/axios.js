import axios from "axios";

let BASE_URL = "https://dana-app.up.railway.app/";

if (process.env.NODE_ENV === "production") {
  console.log("Running in Production Mode");
  BASE_URL = "https://dana-app.up.railway.app/";
} else {
  // BASE_URL = "http://localhost:8000/api/v1";
  console.log("Running in Development Mode");
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const logErrorToBackend = async (error) => {
  try {
    // Prevent logging errors from the logs-error API itself
    if (error.config?.url.includes("/logs-error/")) {
      return;
    }

    const errorPayload = {
      message: error.message,
      error: error.response?.data || {},
      statusText: error.response?.statusText || "Unknown",
      request: {
        url: error.config?.url || "Unknown URL",
        method: error.config?.method || "Unknown Method",
        data: error.config?.data || "No Request Body",
      },
    };

    await axios.post(`${BASE_URL}/auth/log-error/`, errorPayload);
  } catch (logError) {
    console.error("Failed to log error to backend:", logError);
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // await logErrorToBackend(error);
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error.response.data);
  }
);

export const get = async (url, params) => {
  return axiosInstance.get(url, { params }).then((res) => res.data);
};

export const post = async (url, data) => {
  return axiosInstance.post(url, data).then((res) => res.data);
};

export const put = async (url, data) => {
  return axiosInstance.put(url, data).then((res) => res.data);
};

export const patch = async (url, data) => {
  return axiosInstance.patch(url, data).then((res) => res.data);
};

export const _delete = async (url) => {
  return axiosInstance.delete(url).then((res) => res.data);
};

export default axiosInstance;
