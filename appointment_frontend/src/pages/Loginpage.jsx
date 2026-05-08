import { useState } from "react";
import { login } from "../services/api";

function LoginPage({ onLogin, goToRegister, goToForgot }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false); // toggle show/hide password

  async function handleLogin() {
    setError("");

    if (!email || !password) {
      setError("Please fill all fields!");
      return;
    }

    setLoading(true);
    const data = await login(email, password);
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      onLogin(data); // go to home page
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}></div>
        <h1 style={styles.title}>Appointment System</h1>
        <p style={styles.subtitle}>Login to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        {/* Email */}
        <div style={styles.group}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>

        {/* Password with show/hide toggle */}
        <div style={styles.group}>
          <label style={styles.label}>Password</label>
          <div style={styles.passwordWrap}>
            <input
              style={{ ...styles.input, flex: 1, border: "none", outline: "none" }}
              type={showPwd ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {/* Show / Hide button */}
            <button
              style={styles.eyeBtn}
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Forgot password link */}
        <div style={{ textAlign: "right", marginBottom: 20 }}>
          <span style={styles.link} onClick={goToForgot}>
            Forgot Password?
          </span>
        </div>

        {/* Login button */}
        <button style={styles.btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <span style={styles.link} onClick={goToRegister}>Register here</span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    width: 380,
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
  logo:     { fontSize: 48, textAlign: "center", marginBottom: 8 },
  title:    { textAlign: "center", fontSize: 22, fontWeight: 800, color: "#2c3e50", margin: "0 0 4px" },
  subtitle: { textAlign: "center", color: "#888", fontSize: 14, marginBottom: 24 },
  error: {
    background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
  },
  group:  { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  label:  { fontSize: 13, fontWeight: 600, color: "#444" },
  input:  { padding: "11px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none" },
  passwordWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: 8,
    paddingLeft: 14,
    overflow: "hidden",
  },
  eyeBtn: {
    background: "none",
    border: "none",
    padding: "11px 14px",
    cursor: "pointer",
    color: "#2980b9",
    fontSize: 13,
    fontWeight: 600,
  },
  btn: {
    width: "100%", background: "#2c3e50", color: "#fff", border: "none",
    padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700,
    cursor: "pointer", marginBottom: 16,
  },
  footer: { textAlign: "center", fontSize: 13, color: "#666", margin: 0 },
  link:   { color: "#2980b9", cursor: "pointer", fontWeight: 600 },
};

export default LoginPage;