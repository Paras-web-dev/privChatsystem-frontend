import React from "react";
import styles from "./TypingIndicator.module.css";

const TypingIndicator = ({ username }) => (
  <div className={styles.row}>
    <div className={styles.avatarPlaceholder}>
      {username?.[0]?.toUpperCase() || "?"}
    </div>
    <div className={styles.wrap}>
      <div className={styles.label}>{username} is typing...</div>
      <div className={styles.bubble}>
        <span className={styles.dot} style={{ animationDelay: "0ms" }}   />
        <span className={styles.dot} style={{ animationDelay: "160ms" }} />
        <span className={styles.dot} style={{ animationDelay: "320ms" }} />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
