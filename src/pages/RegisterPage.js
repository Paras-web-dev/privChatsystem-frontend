import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";
import styles from "./LoginPage.module.css";

const RegisterPage = ({ onNavigateLogin }) => {
  const { register, error } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [shake, setShake] = useState(false);

  const showError = (message) => {
    setLocalError(message);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    if (!username.trim() || !email.trim() || !password.trim()) {
      showError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await register({ username: username.trim(), email: email.trim(), password });
    setLoading(false);

    if (!result.success) {
      showError(result.message || "Registration failed");
      return;
    }

    setSuccess("Account created. Redirecting to login...");
    setTimeout(() => {
      onNavigateLogin?.({ preventDefault: () => {} });
    }, 700);
  };

  return (
    <AuthLayout shake={shake}>
      <h1 className={styles.title}>Create account</h1>
      <p className={styles.subtitle}>Register with username, email, and password</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldWrap}>
          <label className={styles.label}>Username</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>U</span>
            <input
              className={styles.input}
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Email</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>@</span>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}>K</span>
            <input
              className={styles.input}
              type={showPass ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {(localError || error) && <div className={styles.error}>{localError || error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinner} /> Creating...</> : "Create Account"}
        </button>
      </form>

      <div className={styles.authSwitch}>
        <span>Already have an account?</span>
        <a href="/login" onClick={onNavigateLogin}>Sign in</a>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerDot} />
        Admin role comes only from ADMIN_EMAIL
        <span className={styles.footerDot} />
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
