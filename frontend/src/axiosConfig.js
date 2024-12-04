// src/axiosConfig.js
import axios from "axios";

const setupAxiosInterceptors = (handleLogout) => {
  // Add request interceptor
  axios.interceptors.request.use(
    (config) => {
      const user = JSON.parse(
        window.localStorage.getItem("loggedInUser") || "{}"
      );
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Only logout if the token is actually expired
        if (error.response?.data?.error === "token expired") {
          // Remove stored user data
          window.localStorage.removeItem("loggedInUser");
          // Store the error message
          window.localStorage.setItem(
            "authError",
            "Your session has expired. Please login again."
          );
          // Call handleLogout
          handleLogout();
        }
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxiosInterceptors;
