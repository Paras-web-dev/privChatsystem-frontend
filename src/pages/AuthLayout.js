import React from "react";
import styles from "./LoginPage.module.css";

const DOODLE_MESSAGES = [
  { text: "Hey! You there?", side: "right", delay: 0 },
  { text: "Yes, I am here", side: "left", delay: 0.8 },
  { text: "Private chat only", side: "right", delay: 1.6 },
  { text: "Backend-secured roles", side: "left", delay: 2.4 },
];

const AuthLayout = ({ children, shake = false }) => (
  <div className={styles.root}>
    <div className={`${styles.blob} ${styles.blob1}`} />
    <div className={`${styles.blob} ${styles.blob2}`} />
    <div className={`${styles.blob} ${styles.blob3}`} />

    <div className={styles.leftPanel}>
      <div className={styles.doodleStage}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${styles.sparkle} ${styles[`sp${i + 1}`]}`} />
        ))}

        {DOODLE_MESSAGES.map((message, i) => (
          <div
            key={message.text}
            className={`${styles.bubble} ${message.side === "right" ? styles.bubbleRight : styles.bubbleLeft}`}
            style={{ animationDelay: `${message.delay}s`, top: `${20 + i * 58}px` }}
          >
            {message.text}
          </div>
        ))}

        <div className={styles.doodlePhone}>
          <div className={styles.phoneScreen}>
            <div className={`${styles.phoneLine} ${styles.phoneLineActive}`} />
            <div className={styles.phoneLine} />
            <div className={`${styles.phoneLine} ${styles.phoneLineActive}`} style={{ width: "50%" }} />
            <div className={styles.phoneLine} />
            <div className={`${styles.phoneLine} ${styles.phoneLineActive}`} style={{ width: "70%" }} />
          </div>
          <div className={styles.phoneHome} />
        </div>
      </div>

      <div className={styles.tagline}>
        <span className={styles.taglineMain}>PrivChat</span>
        <span className={styles.taglineSub}>Chat freely , Stay private Always</span>
      </div>

      <div className={styles.featurePills}>
        {["Private", "Trusted", "Encrypted", "Secure"].map((feature) => (
          <span key={feature} className={styles.pill}>{feature}</span>
        ))}
      </div>
    </div>

    <div className={`${styles.rightPanel} ${shake ? styles.shake : ""}`}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>PC</div>
        <div>
          <div className={styles.logoName}>PrivChat</div>
          <div className={styles.logoSub}>Private & Secure</div>
        </div>
      </div>

      {children}
    </div>
  </div>
);

export default AuthLayout;
