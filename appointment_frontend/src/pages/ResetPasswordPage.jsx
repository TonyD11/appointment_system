import { useState } from "react";

const BASE_URL = "http://localhost:8080";

async function resetPassword(token, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}

// Check password rules
function checkPassword(password) {
  return {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    symbol:    /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
}

function isPasswordValid(password) {
  return Object.values(checkPassword(password)).every(Boolean);
}

function RuleItem({ ok, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ color: ok ? "green" : "#ccc", fontSize: 14, fontWeight: 700 }}>
        {ok ? "✓" : "✕"}
      </span>
      <span style={{ fontSize: 13, color: ok ? "green" : "#888" }}>{text}</span>
    </div>
  );
}

function ResetPasswordPage({ goToLogin }) {
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Get token from URL e.g. ?token=abc123
  const token = new URLSearchParams(window.location.search).get("token");

  const rules = checkPassword(password);

  async function handleReset() {
    setError("");

    if (!password || !confirm) {
      setError("Please fill all fields!");
      return;
    }

    if (!isPasswordValid(password)) {
      setError("Password does not meet the requirements!");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    const data = await resetPassword(token, password);
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setDone(true);
      // Go to login after 3 seconds
      setTimeout(() => goToLogin(), 3000);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}>🔑</div>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>Enter your new password below</p>

        {error && <div style={styles.error}>{error}</div>}

        {/* Success screen */}
        {done ? (
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h3 style={styles.successTitle}>Password Updated!</h3>
            <p style={styles.successText}>
              Your password has been changed successfully.
              Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            {/* New Password */}
            <div style={styles.group}>
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowRules(true);
                }}
              />
              {/* Live password rules */}
              {showRules && (
                <div style={styles.rulesBox}>
                  <p style={styles.rulesTitle}>Password must have:</p>
                  <RuleItem ok={rules.length}    text="At least 8 characters" />
                  <RuleItem ok={rules.uppercase} text="At least 1 uppercase letter (A-Z)" />
                  <RuleItem ok={rules.lowercase} text="At least 1 lowercase letter (a-z)" />
                  <RuleItem ok={rules.number}    text="At least 1 number (0-9)" />
                  <RuleItem ok={rules.symbol}    text="At least 1 symbol (!@#$%^&*)" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={styles.group}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Repeat new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {confirm && (
                <p style={{ fontSize: 12, marginTop: 4, color: password === confirm ? "green" : "red" }}>
                  {password === confirm ? "✓ Passwords match" : "✕ Passwords do not match"}
                </p>
              )}
            </div>

            <button
              style={{
                ...styles.btn,
                background: isPasswordValid(password) ? "#27ae60" : "#aaa",
                cursor: isPasswordValid(password) ? "pointer" : "not-allowed",
              }}
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <p style={styles.footer}>
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
  group:  { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  label:  { fontSize: 13, fontWeight: 600, color: "#444" },
  input:  { padding: "11px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none" },
  rulesBox: {
    background: "#f8f9fa", border: "1px solid #eee",
    borderRadius: 8, padding: "10px 14px", marginTop: 8,
  },
  rulesTitle: { fontSize: 12, fontWeight: 700, color: "#555", margin: "0 0 8px" },
  btn: {
    width: "100%", color: "#fff", border: "none",
    padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, marginBottom: 16,
  },
  footer: { textAlign: "center", fontSize: 13, color: "#666", margin: 0 },
  link:   { color: "#2980b9", cursor: "pointer", fontWeight: 600 },
  successBox:   { textAlign: "center", padding: "10px 0" },
  successIcon:  { fontSize: 52, marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: 800, color: "#2c3e50", margin: "0 0 10px" },
  successText:  { fontSize: 14, color: "#555", lineHeight: 1.6 },
};

export default ResetPasswordPage;