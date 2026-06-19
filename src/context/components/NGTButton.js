import React, { useState } from "react";
import { useSocket } from "../SocketContext";
import styles from "./NGTButton.module.css";

const NGTButton = () => {
  const { triggerNGT } = useSocket();
  const [confirm, setConfirm] = useState(false);

  const handleClick = () => {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    // Execute NGT: open Flipkart + redirect away
    triggerNGT();
    window.open("https://www.flipkart.com", "_blank");
    setTimeout(() => { window.location.href = "about:blank"; }, 300);
  };

  return (
    <button
      className={`${styles.btn} ${confirm ? styles.btnConfirm : ""}`}
      onClick={handleClick}
      title={confirm ? "Click again to confirm NGT!" : "NGT Emergency Button"}
    >
      {confirm ? (
        <span className={styles.confirmText}>⚠️ Confirm?</span>
      ) : (
        <span className={styles.ngtText}>NGT</span>
      )}
    </button>
  );
};

export default NGTButton;
