import { useState } from "react";
import DoctorSelect from "./DoctorSelect";

function AppointmentForm({ doctors, onSubmit, editingData, onCancelEdit }) {

  // Fill form with editingData if editing, otherwise empty
  const [patientName,   setPatientName]   = useState(editingData?.patientName   || "");
  const [doctorId,      setDoctorId]      = useState(editingData?.doctorId      || "");
  const [contactNumber, setContactNumber] = useState(editingData?.contactNumber || "");

  // When form is submitted
  function handleSubmit() {
    if (!patientName || !doctorId || !contactNumber) {
      alert("Please fill all fields!");
      return;
    }

    onSubmit({ patientName, doctorId, contactNumber });

    // Clear form
    setPatientName("");
    setDoctorId("");
    setContactNumber("");
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>
        {editingData ? "Edit Appointment" : " Add New Appointment"}
      </h2>

      {/* Patient Name */}
      <div style={styles.group}>
        <label style={styles.label}>Patient Name</label>
        <input
          style={styles.input}
          placeholder="e.g. Kamal Bandara"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
      </div>

      {/* Doctor Dropdown */}
      <DoctorSelect
        doctors={doctors}
        value={doctorId}
        onChange={setDoctorId}
      />

      {/* Contact Number */}
      <div style={styles.group}>
        <label style={styles.label}>Contact Number</label>
        <input
          style={styles.input}
          placeholder="e.g. 0771234567"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div style={styles.buttons}>
        <button style={styles.btnGreen} onClick={handleSubmit}>
          {editingData ? "Save Changes" : "Add Appointment"}
        </button>

        {editingData && (
          <button style={styles.btnGray} onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#333",
    marginBottom: 20,
    marginTop: 0,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
  },
  input: {
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 14,
  },
  buttons: {
    display: "flex",
    gap: 10,
    marginTop: 16,
  },
  btnGreen: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnGray: {
    background: "#6c757d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default AppointmentForm;