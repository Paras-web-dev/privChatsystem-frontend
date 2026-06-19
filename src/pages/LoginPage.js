import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "./AuthLayout";
import styles from "./LoginPage.module.css";

const LoginPage = ({ onNavigateRegister }) => {
  const { login, error } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
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

    if (!identifier.trim() || !password.trim()) {
      showError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const result = await login(identifier.trim(), password);
    setLoading(false);

    if (!result.success) {
      showError(result.message || "Login failed");
    }
  };

  return (
    <AuthLayout shake={shake}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in with email or username</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.fieldWrap}>
          <label className={styles.label}>Email or Username</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}></span>
            <input
              className={styles.input}
              type="text"
              placeholder="email or username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <div className={styles.fieldWrap}>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon}></span>
            <input
              className={styles.input}
              type={showPass ? "text" : "password"}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? <><span className={styles.spinner} /> Signing in...</> : "Sign In"}
        </button>
      </form>

      <div className={styles.authSwitch}>
        <span>New to PrivChat?</span>
        <a href="/register" onClick={onNavigateRegister}>Create account</a>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerDot} />
       '' Safe conversations Starts here "
        <span className={styles.footerDot} />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
