import { useState } from "react";

const BASE_URL = "http://localhost:8080";

async function forgotPassword(email) {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}

function ForgotPasswordPage({ goToLogin }) {
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  async function handleSend() {
    setError("");

    if (!email) {
      setError("Please enter your email!");
      return;
    }

    setLoading(true);
    const data = await forgotPassword(email);
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setSent(true);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>🔒</div>
        <h1 style={styles.title}>Forgot Password?</h1>
        <p style={styles.subtitle}>
          Enter your email and we'll send you a reset link
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {/* After email sent — show success screen */}
        {sent ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>📧</div>
            <h3 style={styles.successTitle}>Check your email!</h3>
            <p style={styles.successText}>
              We sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and spam folder.
            </p>
            <p style={styles.successNote}>
              The link expires in <strong>1 hour</strong>.
            </p>
            <button style={styles.btnBack} onClick={goToLogin}>
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <div style={styles.group}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
            </div>

            <button style={styles.btn} onClick={handleSend} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p style={styles.footer}>
              Remember your password?{" "}
              <span style={styles.link} onClick={goToLogin}>Back to Login</span>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh", background: "#f4f6f9",
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif",
  },
  card: {
    background: "#fff", borderRadius: 16, padding: "40px 36px",
    width: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
  logo:     { fontSize: 48, textAlign: "center", marginBottom: 8 },
  title:    { textAlign: "center", fontSize: 22, fontWeight: 800, color: "#2c3e50", margin: "0 0 4px" },
  subtitle: { textAlign: "center", color: "#888", fontSize: 13, marginBottom: 24 },
  error: {
    background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
  },
  group:  { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  label:  { fontSize: 13, fontWeight: 600, color: "#444" },
  input:  { padding: "11px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none" },
  btn: {
    width: "100%", background: "#2c3e50", color: "#fff", border: "none",
    padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 16,
  },
  footer: { textAlign: "center", fontSize: 13, color: "#666", margin: 0 },
  link:   { color: "#2980b9", cursor: "pointer", fontWeight: 600 },
  successBox:   { textAlign: "center", padding: "10px 0" },
  successIcon:  { fontSize: 52, marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: 800, color: "#2c3e50", margin: "0 0 10px" },
  successText:  { fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 8 },
  successNote:  { fontSize: 13, color: "#888", marginBottom: 20 },
  btnBack: {
    background: "#2c3e50", color: "#fff", border: "none",
    padding: "11px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer",
  },
};

export default ForgotPasswordPage;