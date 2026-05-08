import { useState } from "react";
import { register } from "../services/api";

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
  const rules = checkPassword(password);
  return Object.values(rules).every(Boolean);
}

// ── Small component for each password rule row
function RuleItem({ ok, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
      <span style={{ color: ok ? "green" : "#ccc", fontSize: 14, fontWeight: 700 }}>
        {ok ? "" : ""}
      </span>
      <span style={{ fontSize: 13, color: ok ? "green" : "#888" }}>{text}</span>
    </div>
  );
}

function RegisterPage({ goToLogin }) {
  const [username, setUsername] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Live password rules
  const rules = checkPassword(password);

  async function handleRegister() {
    setError("");

    // Check all fields filled
    if (!username || !email || !password || !confirm) {
      setError("Please fill all fields!");
      return;
    }

    // Check password rules
    if (!isPasswordValid(password)) {
      setError("Password does not meet the requirements!");
      return;
    }

    // Check passwords match
    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    const data = await register(username, email, password);
    setLoading(false);

    if (data.error) {
      setError(data.error);
    } else {
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => goToLogin(), 2000);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.logo}></div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Register as a patient</p>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {/* Username */}
        <div style={styles.group}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Email */}
        <div style={styles.group}>
          <label style={styles.label}>Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password with live rules */}
        <div style={styles.group}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setShowRules(true); // show rules when user starts typing
            }}
          />

          {/* Live rules checker - shows as user types */}
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
          <label style={styles.label}>Confirm Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {/* Show if passwords match */}
          {confirm && (
            <p style={{ fontSize: 12, marginTop: 4, color: password === confirm ? "green" : "red" }}>
              {password === confirm ? " Passwords match" : " Passwords do not match"}
            </p>
          )}
        </div>

        {/* Register button - grey when password not valid */}
        <button
          style={{
            ...styles.btn,
            background: isPasswordValid(password) ? "#27ae60" : "#aaa",
            cursor: isPasswordValid(password) ? "pointer" : "not-allowed",
          }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p style={styles.footer}>
          Already have an account?{" "}
          <span style={styles.link} onClick={goToLogin}>Login here</span>
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
    width: 400,
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
  logo:     { fontSize: 48, textAlign: "center", marginBottom: 8 },
  title:    { textAlign: "center", fontSize: 22, fontWeight: 800, color: "#2c3e50", margin: "0 0 4px" },
  subtitle: { textAlign: "center", color: "#888", fontSize: 14, marginBottom: 24 },
  error: {
    background: "#f8d7da", color: "#721c24", border: "1px solid #f5c6cb",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
  },
  success: {
    background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb",
    borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16,
  },
  group:  { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  label:  { fontSize: 13, fontWeight: 600, color: "#444" },
  input:  { padding: "11px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, outline: "none" },
  rulesBox: {
    background: "#f8f9fa",
    border: "1px solid #eee",
    borderRadius: 8,
    padding: "12px 14px",
    marginTop: 8,
  },
  rulesTitle: { fontSize: 12, fontWeight: 700, color: "#555", margin: "0 0 8px" },
  btn: {
    width: "100%", color: "#fff", border: "none",
    padding: "12px", borderRadius: 8, fontSize: 15, fontWeight: 700, marginBottom: 16,
    transition: "background 0.2s",
  },
  footer: { textAlign: "center", fontSize: 13, color: "#666", margin: 0 },
  link:   { color: "#2980b9", cursor: "pointer", fontWeight: 600 },
};

export default RegisterPage;