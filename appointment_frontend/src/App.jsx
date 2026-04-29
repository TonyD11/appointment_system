import { useState, useEffect } from "react";

// Import components
import AppointmentForm from "./components/AppointmentForm";
import AppointmentList from "./components/AppointmentList";

// Import API functions
import {
  getDoctors,
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "./services/api";

function App() {
  // State (data the app remembers)
  const [doctors,      setDoctors]      = useState([]); // list of doctors
  const [appointments, setAppointments] = useState([]); // list of appointments
  const [editingData,  setEditingData]  = useState(null); // appointment being edited
  const [message,      setMessage]      = useState(""); // success/error message

  // Load doctors and appointments when page opens
  useEffect(() => {
    loadDoctors();
    loadAppointments();
  }, []);

  // Show a message for 3 seconds
  function showMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  // Load all doctors from backend
  async function loadDoctors() {
    try {
    const data = await getDoctors();
    setDoctors(data || []);
  } catch (error) {
    console.error("Cannot load doctors:", error);
    setDoctors([]);
  }
  
}

  // Load all appointments from backend
  async function loadAppointments() {
    try {
    const data = await getAppointments();
    setAppointments(data || []);
    } catch (error) {
      console.error("Cannot load appointments:", error);
      setAppointments([]);
    }
  }

  // Add or Update appointment
  async function handleFormSubmit(formData) {
    if (editingData) {
      // UPDATE existing appointment
      await updateAppointment(editingData.id, formData);
      showMessage("Appointment updated successfully!");
      setEditingData(null);
    } else {
      // CREATE new appointment
      const newAppointment = await createAppointment(formData);
      setAppointments([newAppointment, ...appointments]);
      showMessage("Appointment added successfully!");
    }

    // Reload the list
    loadAppointments();
  }

  // Click Edit button
  function handleEdit(appointment) {
    setEditingData(appointment);
    // Scroll to top so user can see the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Click Delete button
  async function handleDelete(id) {
    // Ask user to confirm
    const confirmed = window.confirm("Are you sure you want to delete this appointment?");
    if (!confirmed) return;

    await deleteAppointment(id);
    setAppointments(appointments.filter((a) => a.id !== id));
    showMessage("Appointment deleted!");
  }

  // Cancel editing
  function handleCancelEdit() {
    setEditingData(null);
  }

  // UI
  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Appointment System</h1>
        <p style={styles.headerSub}>Manage patient appointments easily</p>
      </div>

      <div style={styles.content}>

        {/* Success / Error Message */}
        {message && (
          <div style={styles.message}>{message}</div>
        )}

        {/* Add / Edit Form */}
        <AppointmentForm
          doctors={doctors}
          onSubmit={handleFormSubmit}
          editingData={editingData}
          onCancelEdit={handleCancelEdit}
        />

        {/* Appointments Table */}
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
  page: {
    minHeight: "100vh",
    background: "#f4f6f9",
    fontFamily: "sans-serif",
  },
  header: {
    background: "#2c3e50",
    padding: "24px 40px",
    color: "#fff",
  },
  headerTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
  },
  headerSub: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "#aaa",
  },
  content: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "32px 24px",
  },
  message: {
    background: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
    borderRadius: 8,
    padding: "12px 16px",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 600,
  },
};

export default App;