import React, { useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import styles from "./ProfileModal.module.css";

const ProfileModal = ({ onClose, apiUrl }) => {
  const { user, token, updateUser } = useAuth();
  const [uploading, setUploading]   = useState(false);
  const [success, setSuccess]       = useState("");
  const [error, setError]           = useState("");
  const fileRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axios.post(`${apiUrl}/api/upload/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      updateUser({ avatar: res.data.avatarUrl });
      setSuccess("Profile picture updated! ✅");
    } catch (err) {
      setError("Upload failed. Try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <h2 className={styles.title}>Your Profile</h2>

        {/* Avatar preview */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrap} onClick={() => fileRef.current?.click()}>
            {user.avatar ? (
              <img
                src={`${apiUrl}${user.avatar}`}
                alt={user.username}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.username?.[0]?.toUpperCase()}
              </div>
            )}
            <div className={styles.cameraOverlay}>
              {uploading ? "⏳" : "📷"}
            </div>
          </div>
          <p className={styles.avatarHint}>Tap to change photo</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleAvatarUpload}
          />
        </div>

        {/* User info */}
        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Username</span>
            <span className={styles.infoValue}>{user.username}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Role</span>
            <span className={`${styles.infoValue} ${styles.roleValue}`}>
              {user.role === "admin" ? "👑 Admin" : "👤 User"}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Status</span>
            <span className={styles.infoValue} style={{ color: "var(--green)" }}>🟢 Online</span>
          </div>
        </div>

        {/* Feedback */}
        {success && <div className={styles.successBox}>{success}</div>}
        {error   && <div className={styles.errorBox}>{error}</div>}

        {/* Privacy note */}
        <p className={styles.privacyNote}>
          🔒 This is a private 2-user channel. Only you and the other user can see these messages.
        </p>
      </div>
    </div>
  );
};

export default ProfileModal;
