import React, { useState } from "react";
import styles from "./MessageBubble.module.css";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MessageBubble = ({ message, isOwn, showAvatar, apiUrl }) => {
  const [imgExpanded, setImgExpanded] = useState(false);

  return (
    <div className={`${styles.row} ${isOwn ? styles.rowOwn : styles.rowOther}`}>
      {/* Avatar (other user side) */}
      {!isOwn && (
        <div className={styles.avatarWrap}>
          {showAvatar ? (
            message.senderAvatar ? (
              <img
                src={`${apiUrl}${message.senderAvatar}`}
                alt={message.senderName}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {message.senderName?.[0]?.toUpperCase() || "?"}
              </div>
            )
          ) : (
            <div className={styles.avatarSpacer} />
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`${styles.bubbleWrap} ${isOwn ? styles.bubbleWrapOwn : ""}`}>
        {/* Sender name (only for other's messages, first in group) */}
        {!isOwn && showAvatar && (
          <div className={styles.senderName}>
            {message.senderRole === "admin" ? "👑 " : "👤 "}{message.senderName}
          </div>
        )}

        <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : styles.bubbleOther}`}>
          {/* Image message */}
          {message.type === "image" && message.imageUrl ? (
            <div className={styles.imageWrap}>
              <img
                src={`${apiUrl}${message.imageUrl}`}
                alt="Shared image"
                className={`${styles.sharedImage} ${imgExpanded ? styles.sharedImageExpanded : ""}`}
                onClick={() => setImgExpanded(!imgExpanded)}
              />
              {message.content && message.content !== "📸 Photo" && (
                <p className={styles.imageCaption}>{message.content}</p>
              )}
            </div>
          ) : (
            <p className={styles.text}>{message.content}</p>
          )}

          {/* Timestamp + read indicator */}
          <div className={styles.meta}>
            <span className={styles.time}>{formatTime(message.timestamp)}</span>
            {isOwn && (
              <span className={styles.readTick}>
                {message.isRead ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Own user avatar spacer */}
      {isOwn && <div className={styles.ownSpacer} />}
    </div>
  );
};

export default MessageBubble;
