import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const tenantDbName =
      localStorage.getItem("tenantDbName") ||
      sessionStorage.getItem("tenantDbName");

    if (tenantDbName) {
      config.headers["X-TenantID"] = tenantDbName;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
