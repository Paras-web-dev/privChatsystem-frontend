import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API = process.env.REACT_APP_API_URL || "";

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem("privchat_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    localStorage.removeItem("privchat_user");
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(getSavedUser);
  const [token, setToken]     = useState(localStorage.getItem("privchat_token"));
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const isLoggedIn = Boolean(token && user);

  // Set axios default header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem("privchat_token");
      if (!saved) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
          timeout: 10000,
        });
        setUser(res.data);
        localStorage.setItem("privchat_user", JSON.stringify(res.data));
        setToken(saved);
      } catch (err) {
        const status = err.response?.status;

        // Only wipe session on actual auth errors (401/403)
        // Network errors, timeouts, 500s = keep session (Render cold start)
        if (status === 401 || status === 403) {
          localStorage.removeItem("privchat_token");
          localStorage.removeItem("privchat_user");
          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    setError(null);
    try {
      await axios.post(`${API}/api/auth/register`, { username, email, password });
      return { success: true };
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      return { success: false, message: msg, status };
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    setError(null);
    try {
      const res = await axios.post(
        `${API}/api/auth/login`,
        { identifier, password },
        { timeout: 15000 }
      );
      const { token: t, user: u } = res.data;
      localStorage.setItem("privchat_token", t);
      localStorage.setItem("privchat_user", JSON.stringify(u));
      setToken(t);
      setUser(u);
      return { success: true };
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.message || "Login failed";

      if (!err.response) {
        msg = "Cannot reach server. Please try again in a moment.";
      } else if (status === 409) {
        // Backend sends the exact username in the message — use it directly
        msg = err.response.data?.message || "Already logged in on another device.";
      } else if (status === 401) {
        msg = "Invalid username or password.";
      } else if (status === 500) {
        msg = "Server error. Please try again.";
      }

      setError(msg);
      return { success: false, message: msg, status };
    }
  }, []);

  const logout = useCallback(async () => {
    const savedToken = localStorage.getItem("privchat_token");

    // Clear local state immediately — UI switches to login right away
    localStorage.removeItem("privchat_token");
    localStorage.removeItem("privchat_user");
    setToken(null);
    setUser(null);
    setError(null);

    // Best-effort HTTP logout — matches POST /api/auth/logout on backend
    // Sets isOnline=false in MongoDB immediately
    // Socket disconnect does this too, but this is a safety net
    if (savedToken) {
      try {
        await axios.post(
          `${API}/api/auth/logout`,
          {},
          { headers: { Authorization: `Bearer ${savedToken}` }, timeout: 3000 }
        );
      } catch {
        // Silently ignore — socket disconnect handles it on backend
      }
    }
  }, []);

  // ✅ NEW: selfUnlock — matches POST /api/auth/self-unlock on backend
  // Called when user is stuck with isOnline=true and cannot login
  // Backend verifies password before unlocking — no admin needed
  const selfUnlock = useCallback(async (identifier, password) => {
    setError(null);
    try {
      await axios.post(
        `${API}/api/auth/self-unlock`,
        { identifier, password },
        { timeout: 10000 }
      );
      return { success: true, message: "Account unlocked. You can now log in." };
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.message || "Unlock failed. Check your credentials.";

      if (!err.response) {
        msg = "Cannot reach server. Please try again in a moment.";
      } else if (status === 401) {
        msg = "Wrong credentials. Cannot unlock account.";
      } else if (status === 500) {
        msg = "Server error. Please try again.";
      }

      setError(msg);
      return { success: false, message: msg, status };
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("privchat_user", JSON.stringify(next));
      return next;
    });
  }, []);

  // Clear error — called by LoginPage on input change
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user, token, isLoggedIn, loading, error,
      register, login, logout, updateUser, clearError,
      selfUnlock,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};