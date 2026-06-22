import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "../context/components/MessageBubble";
import TypingIndicator from "../context/components/TypingIndicator";
import ProfileModal from "../context/components/ProfileModal";
import NGTButton from "../context/components/NGTButton";
import styles from "./ChatPage.module.css";

const API = process.env.REACT_APP_API_URL || "";

const ChatPage = () => {
  const { user, logout, token } = useAuth();
  const {
    messages, connected, typingUser, chatCleared,
    sendMessage, sendTypingStart, sendTypingStop, markRead, loadMessages,
  } = useSocket();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const [chatClearedBanner, setChatClearedBanner] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  // Load message history
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        loadMessages(res.data.map((m) => ({
          _id: m._id,
          sender: m.sender._id,
          senderName: m.senderName,
          senderRole: m.senderRole,
          senderAvatar: m.sender.avatar,
          content: m.content,
          type: m.type,
          imageUrl: m.imageUrl,
          timestamp: m.timestamp,
          isRead: m.isRead,
          hiddenFromUser: m.hiddenFromUser,
        })));
      } catch (err) {
        console.error("Load messages error:", err);
      }
    };
    load();
  }, [token, loadMessages]);

  // Load other user info
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const other = res.data.find((u) => u._id !== user._id);
        setOtherUser(other);
      } catch (err) {
        console.error("Fetch users error:", err);
      }
    };
    fetchUsers();
  }, [token, user._id]);

  // Mark messages read when focused
  useEffect(() => {
    markRead();
  }, [messages.length, markRead]);

  // Show chat cleared banner
  useEffect(() => {
    if (chatCleared) {
      setChatClearedBanner(true);
      setTimeout(() => setChatClearedBanner(false), 4000);
    }
  }, [chatCleared]);

  const handleInput = (e) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStart();
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStop();
    }, 1500);
  };

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || !connected) return;
    sendMessage(trimmed, "text");
    setInput("");
    setIsTyping(false);
    sendTypingStop();
    clearTimeout(typingTimerRef.current);
  }, [input, connected, sendMessage, sendTypingStop]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(`${API}/api/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      sendMessage("📸 Photo", "image", res.data.imageUrl);
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setImgUploading(false);
      e.target.value = "";
    }
  };

  const handleLogout = () => {
    logout();
  };

  const downloadChatAsPDF = async () => {
    try {
      const element = document.querySelector(`.${styles.messagesArea}`);
      if (!element || messages.length === 0) {
        alert("No messages to download");
        return;
      }

      // Create a temporary container for PDF content
      const pdfContainer = document.createElement("div");
      pdfContainer.style.padding = "20px";
      pdfContainer.style.backgroundColor = "#fff";
      pdfContainer.style.width = "800px";

      // Add title
      const title = document.createElement("h1");
      title.textContent = `Chat with ${otherUser?.username || "User"}`;
      title.style.textAlign = "center";
      title.style.marginBottom = "10px";
      title.style.fontSize = "20px";
      pdfContainer.appendChild(title);

      // Add date
      const dateText = document.createElement("p");
      dateText.textContent = `Downloaded: ${new Date().toLocaleString()}`;
      dateText.style.textAlign = "center";
      dateText.style.color = "#666";
      dateText.style.marginBottom = "20px";
      dateText.style.fontSize = "12px";
      pdfContainer.appendChild(dateText);

      // Add messages
      messages.forEach((msg) => {
        const msgDiv = document.createElement("div");
        msgDiv.style.marginBottom = "15px";
        msgDiv.style.padding = "10px";
        msgDiv.style.backgroundColor = "#f5f5f5";
        msgDiv.style.borderRadius = "8px";

        const isOwn = msg.sender === user._id || msg.senderName === user.username;

        // Sender info
        const senderInfo = document.createElement("div");
        senderInfo.style.fontWeight = "bold";
        senderInfo.style.marginBottom = "5px";
        senderInfo.style.fontSize = "12px";
        senderInfo.style.color = isOwn ? "#0066cc" : "#cc6600";
        senderInfo.textContent = `${msg.senderName} (${msg.senderRole || "user"})`;
        msgDiv.appendChild(senderInfo);

        // Message content
        const contentDiv = document.createElement("div");
        contentDiv.style.fontSize = "14px";
        contentDiv.style.wordBreak = "break-word";
        contentDiv.style.whiteSpace = "pre-wrap";
        contentDiv.textContent = msg.content;
        msgDiv.appendChild(contentDiv);

        // Timestamp
        const timeDiv = document.createElement("div");
        timeDiv.style.fontSize = "11px";
        timeDiv.style.color = "#999";
        timeDiv.style.marginTop = "5px";
        timeDiv.textContent = new Date(msg.timestamp).toLocaleString();
        msgDiv.appendChild(timeDiv);

        pdfContainer.appendChild(msgDiv);
      });

      // Temporarily add to DOM for canvas rendering
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      // Remove temporary element
      document.body.removeChild(pdfContainer);

      // Generate PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      // Download PDF
      const fileName = `chat_${otherUser?.username || "export"}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Error downloading chat as PDF");
    }
  };

  const isOwnMessage = (msg) => msg.sender === user._id || msg.senderName === user.username;

  return (
    <div className={styles.root}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div
            className={styles.avatarWrap}
            onClick={() => setShowProfile(true)}
            title="Edit profile"
          >
            {user.avatar ? (
              <img
                src={`${API}${user.avatar}`}
                alt={user.username}
                className={styles.headerAvatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.username[0].toUpperCase()}
              </div>
            )}
            <div className={styles.onlineDot} />
          </div>

          <div className={styles.headerInfo}>
            <div className={styles.headerName}>
              {user.role === "admin" ? "👑 " : "👤 "}
              {user.username}
              <span className={styles.roleBadge}>{user.role}</span>
            </div>
            <div className={styles.headerSub}>
              {connected ? (
                <><span className={styles.connectedDot} /> Connected</>
              ) : (
                <><span className={styles.disconnectedDot} /> Connecting...</>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Other user status */}
          {otherUser && (
            <div className={styles.otherUserChip}>
              <div className={styles.otherDot} />
              {otherUser.username}
            </div>
          )}

          {/* Download chat as PDF */}
          <button
            className={styles.downloadBtn}
            onClick={downloadChatAsPDF}
            disabled={messages.length === 0}
            title="Download chat as PDF"
          >
            📥
          </button>

          {/* NGT button */}
          <NGTButton />

          {/* Logout */}
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </header>

      {/* ── Chat cleared banner ─────────────────────────────────────────── */}
      {chatClearedBanner && (
        <div className={styles.clearedBanner}>
          🗑️ Chat history cleared — user logged out
        </div>
      )}

      {/* ── Messages area ───────────────────────────────────────────────── */}
      <div className={styles.messagesArea}>
        {/* Empty state */}
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyTitle}>No messages yet</p>
            <p className={styles.emptySub}>Start the conversation below!</p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg._id || idx}
            message={msg}
            isOwn={isOwnMessage(msg)}
            showAvatar={
              idx === 0 || messages[idx - 1]?.senderName !== msg.senderName
            }
            apiUrl={API}
          />
        ))}

        {/* Typing indicator */}
        {typingUser && <TypingIndicator username={typingUser} />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input bar ───────────────────────────────────────────────────── */}
      <div className={styles.inputBar}>
        {/* Image upload */}
        <button
          className={styles.attachBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={imgUploading}
          title="Send image"
        >
          {imgUploading ? "⏳" : "📎"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />

        {/* Text input */}
        <textarea
          className={styles.textInput}
          placeholder="Type a message..."
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {/* Emoji quick-insert */}
        <button
          className={styles.emojiBtn}
          onClick={() => setInput((prev) => prev + "😊")}
          title="Add emoji"
        >
          😊
        </button>

        {/* Send */}
        <button
          className={`${styles.sendBtn} ${input.trim() && connected ? styles.sendBtnActive : ""}`}
          onClick={handleSend}
          disabled={!input.trim() || !connected}
          title="Send message"
        >
          ➤
        </button>
      </div>

      {/* ── Profile Modal ────────────────────────────────────────────────── */}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} apiUrl={API} />
      )}
    </div>
  );
};

export default ChatPage;
