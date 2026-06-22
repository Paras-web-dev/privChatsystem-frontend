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
      if (!saved) { setLoading(false); return; }
      try {
        const res = await axios.get(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
        });
        setUser(res.data);
        localStorage.setItem("privchat_user", JSON.stringify(res.data));
        setToken(saved);
      } catch {
        localStorage.removeItem("privchat_token");
        localStorage.removeItem("privchat_user");
        setToken(null);
        setUser(null);
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
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  const login = useCallback(async (identifier, password) => {
    setError(null);
    try {
      const res = await axios.post(`${API}/api/auth/login`, { identifier, password });
      const { token: t, user: u } = res.data;
      localStorage.setItem("privchat_token", t);
      localStorage.setItem("privchat_user", JSON.stringify(u));
      setToken(t);
      setUser(u);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("privchat_token");
    localStorage.removeItem("privchat_user");
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem("privchat_user", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, loading, error, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
