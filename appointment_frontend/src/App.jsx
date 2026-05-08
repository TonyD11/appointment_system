import { useState, useEffect } from "react";

// Pages
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage  from "./pages/ResetPasswordPage";

// Components
import AppointmentForm from "./components/AppointmentForm";
import AppointmentList from "./components/AppointmentList";

const BASE_URL = "http://localhost:8080";

async function getDoctors() {
  try { const res = await fetch(`${BASE_URL}/doctors`); return res.json(); }
  catch { return []; }
}

async function getAppointments() {
  try { const res = await fetch(`${BASE_URL}/appointments`); return res.json(); }
  catch { return []; }
}

async function createAppointment(data) {
  try {
    const res = await fetch(`${BASE_URL}/appointments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch { return null; }
}

async function updateAppointment(id, data) {
  try {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  } catch { return null; }
}

async function deleteAppointment(id) {
  try {
    const res = await fetch(`${BASE_URL}/appointments/${id}`, { method: "DELETE" });
    return res.json();
  } catch { return null; }
}

function App() {

  // Check if URL has reset token → show reset page
  const [page, setPage] = useState(() => {
    if (window.location.search.includes("token=")) return "reset";
    return "login";
  });

  const [patient, setPatient] = useState(null);

  const [doctors,      setDoctors]      = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [editingData,  setEditingData]  = useState(null);
  const [message,      setMessage]      = useState("");

  useEffect(() => {
    if (page === "home") {
      loadDoctors();
      loadAppointments();
    }
  }, [page]);

  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function loadDoctors() {
    const data = await getDoctors();
    setDoctors(data || []);
  }

  async function loadAppointments() {
    const data = await getAppointments();
    setAppointments(data || []);
  }

  function handleLogin(patientData) {
    setPatient(patientData);
    setPage("home");
  }

  function handleLogout() {
    setPatient(null);
    setPage("login");
  }

  async function handleFormSubmit(formData) {
    if (editingData) {
      await updateAppointment(editingData.id, formData);
      showMessage("Appointment updated successfully!");
      setEditingData(null);
    } else {
      const newAppointment = await createAppointment(formData);
      setAppointments([newAppointment, ...appointments]);
      showMessage("Appointment added successfully!");
    }
    loadAppointments();
  }

  function handleEdit(appointment) {
    setEditingData(appointment);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete?");
    if (!confirmed) return;
    await deleteAppointment(id);
    setAppointments(appointments.filter((a) => a.id !== id));
    showMessage("Appointment deleted!");
  }

  // ── Login page
  if (page === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        goToRegister={() => setPage("register")}
        goToForgot={() => setPage("forgot")}
      />
    );
  }

  // ── Register page
  if (page === "register") {
    return <RegisterPage goToLogin={() => setPage("login")} />;
  }

  // ── Forgot password page
  if (page === "forgot") {
    return <ForgotPasswordPage goToLogin={() => setPage("login")} />;
  }

  // ── Reset password page (when coming from email link)
  if (page === "reset") {
    return <ResetPasswordPage goToLogin={() => setPage("login")} />;
  }

  // ── Home page
  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}> Appointment System</h1>
          <p style={styles.headerSub}>Welcome, {patient?.username}!</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={styles.content}>

        {message && <div style={styles.message}>{message}</div>}

        <AppointmentForm
          key={editingData?.id || "new"}
          doctors={doctors}
          onSubmit={handleFormSubmit}
          editingData={editingData}
          onCancelEdit={() => setEditingData(null)}
        />

        <AppointmentList
          appointments={appointments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f4f6f9", fontFamily: "sans-serif" },
  header: {
    background: "#2c3e50", padding: "20px 40px", color: "#fff",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  headerTitle: { margin: 0, fontSize: 22, fontWeight: 800 },
  headerSub:   { margin: "4px 0 0", fontSize: 13, color: "#aaa" },
  logoutBtn: {
    background: "#e74c3c", color: "#fff", border: "none",
    padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer",
  },
  content: { maxWidth: 800, margin: "0 auto", padding: "32px 24px" },
  message: {
    background: "#d4edda", color: "#155724", border: "1px solid #c3e6cb",
    borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 14, fontWeight: 600,
  },
};

export default App;