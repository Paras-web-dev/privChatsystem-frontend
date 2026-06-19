import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({});
  const [chatCleared, setChatCleared] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("🔌 Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("🔌 Socket disconnected");
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("typing_start", ({ username }) => {
      if (username !== user.username) setTypingUser(username);
    });

    socket.on("typing_stop", () => setTypingUser(null));

    socket.on("user_status", ({ userId, username, isOnline }) => {
      setOnlineStatus((prev) => ({ ...prev, [userId]: isOnline }));
    });

    socket.on("force_disconnect", ({ message }) => {
      console.error(message);
      socket.disconnect();
    });

    socket.on("chat_cleared", () => {
      if (user.role !== "admin") {
        setMessages([]);
        setChatCleared(true);
        setTimeout(() => setChatCleared(false), 4000);
      }
    });

    socket.on("messages_read", () => {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    socket.on("ngt_redirect", () => {
      window.open("https://www.flipkart.com", "_blank");
      window.location.href = "about:blank";
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  const sendMessage = (content, type = "text", imageUrl = null) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("send_message", { content, type, imageUrl });
    }
  };

  const sendTypingStart = () => {
    if (socketRef.current?.connected) socketRef.current.emit("typing_start");
  };

  const sendTypingStop = () => {
    if (socketRef.current?.connected) socketRef.current.emit("typing_stop");
  };

  const markRead = () => {
    if (socketRef.current?.connected) socketRef.current.emit("mark_read");
  };

  const triggerNGT = () => {
    if (socketRef.current?.connected) socketRef.current.emit("ngt_triggered");
  };

  const loadMessages = (msgs) => setMessages(msgs);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        messages,
        typingUser,
        onlineStatus,
        chatCleared,
        sendMessage,
        sendTypingStart,
        sendTypingStop,
        markRead,
        triggerNGT,
        loadMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be inside SocketProvider");
  return ctx;
};
