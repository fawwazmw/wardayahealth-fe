import type { AuthProvider } from "@refinedev/core";
import axios from "axios";

// In production, use the full backend URL. In dev, use Vite proxy.
export const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

export const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token && request.headers) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  return request;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const customError: Record<string, unknown> = {
      ...error,
      message: error.response?.data?.message || "An error occurred.",
      statusCode: error.response?.status,
    };
    return Promise.reject(customError);
  }
);

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      const payload = response.data;
      
      if (payload.token || (payload.data && payload.data.token)) {
        const token = payload.token || payload.data.token;
        const user = payload.user || payload.data.user;
        
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        return {
          success: true,
          redirectTo: "/",
          successNotification: {
            message: "Login Successful",
            description: "Welcome back! Redirecting to dashboard...",
          },
        };
      }
      return {
        success: false,
        error: {
          name: "LoginError",
          message: "Invalid credentials. Please try again.",
        },
      };
    } catch (error: unknown) {
      // Extract user-friendly error message
      let errorMessage = "Invalid credentials. Please try again.";
      
      const err = error as Record<string, Record<string, Record<string, unknown>>>;
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = (errors[0] as Record<string, string>).message || errorMessage;
        }
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message as string;
      }
      
      return {
        success: false,
        error: {
          name: "LoginError",
          message: errorMessage,
        },
      };
    }
  },
  register: async ({ email, password, fullName, passwordConfirmation }) => {
    try {
      const response = await axiosInstance.post("/auth/signup", { 
        email, 
        password, 
        passwordConfirmation, 
        fullName 
      });
      const payload = response.data;
      
      // Registration successful - redirect to login page (don't auto-login)
      if (payload.token || payload.user || (payload.data && (payload.data.token || payload.data.user))) {
        return {
          success: true,
          redirectTo: "/login",
          successNotification: {
            message: "Registration Successful",
            description: "Your account has been created. Please sign in.",
          },
        };
      }
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: "Registration failed. Please try again.",
        },
      };
    } catch (error: unknown) {
      // Extract user-friendly error message
      let errorMessage = "Registration failed. Please try again.";
      
      const err = error as Record<string, Record<string, Record<string, unknown>>>;
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = (errors[0] as Record<string, string>).message || errorMessage;
        }
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message as string;
      }
      
      return {
        success: false,
        error: {
          name: "RegisterError",
          message: errorMessage,
        },
      };
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error(error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const user = localStorage.getItem("user");
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },
  onError: async (error) => {
    // Only force logout if there is no token at all (truly unauthenticated)
    // Do NOT redirect on every 401 — dataProvider errors are handled by the UI
    return { error };
  },
};
