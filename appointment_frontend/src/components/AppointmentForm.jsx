import { useState } from "react";
import DoctorSelect from "./DoctorSelect";

function AppointmentForm({ doctors, onSubmit, editingData, onCancelEdit }) {

  // Get today's date in YYYY-MM-DD format
  function getTodayDate() {
    const now = new Date();
    const year  = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day   = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format existing date for the date input
  function formatDateOnly(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day   = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format existing time as HH:MM
  function formatTimeOnly(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const mins  = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${mins}`;
  }

  // Generate all 15-minute time slots for a day
  // e.g. 08:00, 08:15, 08:30 ... 17:45
  function generateTimeSlots() {
    const slots = [];
    for (let hour = 8; hour <= 17; hour++) {
      for (let min = 0; min < 60; min += 15) {
        // Skip slots in the past if today is selected
        if (selectedDate === getTodayDate()) {
          const now   = new Date();
          const slot  = new Date();
          slot.setHours(hour, min, 0, 0);
          if (slot <= now) continue; // skip past slots
        }
        const h = String(hour).padStart(2, "0");
        const m = String(min).padStart(2, "0");
        const time24 = `${h}:${m}`;

        // Also show 12-hour format for display
        const period = hour < 12 ? "AM" : "PM";
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        const label  = `${String(hour12).padStart(2, "0")}:${m} ${period}`;

        slots.push({ value: time24, label });
      }
    }
    return slots;
  }

  // Form fields
  const [patientName,   setPatientName]   = useState(editingData?.patientName   || "");
  const [doctorId,      setDoctorId]      = useState(editingData?.doctorId      || "");
  const [contactNumber, setContactNumber] = useState(editingData?.contactNumber || "");
  const [selectedDate,  setSelectedDate]  = useState(
    editingData?.appointmentDate ? formatDateOnly(editingData.appointmentDate) : ""
  );
  const [selectedTime,  setSelectedTime]  = useState(
    editingData?.appointmentDate ? formatTimeOnly(editingData.appointmentDate) : ""
  );

  function handleSubmit() {
    if (!patientName || !doctorId || !contactNumber || !selectedDate || !selectedTime) {
      alert("Please fill all fields including date and time!");
      return;
    }

    // Combine date and time into one string e.g. "2026-04-27T10:30"
    const appointmentDate = `${selectedDate}T${selectedTime}`;

    // Double check it is in the future
    if (new Date(appointmentDate) <= new Date()) {
      alert("Please select a future date and time!");
      return;
    }

    onSubmit({ patientName, doctorId, contactNumber, appointmentDate });

    // Clear form
    setPatientName("");
    setDoctorId("");
    setContactNumber("");
    setSelectedDate("");
    setSelectedTime("");
  }

  // Time slots depend on selected date
  const timeSlots = selectedDate ? generateTimeSlots() : [];

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>
        {editingData ? " Edit Appointment" : " Add New Appointment"}
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

      {/* Date Picker */}
      <div style={styles.group}>
        <label style={styles.label}>Appointment Date</label>
        <input
          style={styles.input}
          type="date"
          value={selectedDate}
          min={getTodayDate()}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime(""); // reset time when date changes
          }}
        />
      </div>

      {/* Time Slot Picker - only shows after date is selected */}
      {selectedDate && (
        <div style={styles.group}>
          <label style={styles.label}>Appointment Time</label>

          {timeSlots.length === 0 ? (
            <p style={styles.noSlots}>
               No available slots for today. Please select a future date.
            </p>
          ) : (
            <div style={styles.slotsGrid}>
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  style={{
                    ...styles.slotBtn,
                    background:   selectedTime === slot.value ? "#2c3e50" : "#f8f9fa",
                    color:        selectedTime === slot.value ? "#fff"    : "#333",
                    borderColor:  selectedTime === slot.value ? "#2c3e50" : "#ddd",
                    fontWeight:   selectedTime === slot.value ? 700       : 400,
                  }}
                  onClick={() => setSelectedTime(slot.value)}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}

          {selectedTime && (
            <p style={styles.selectedNote}>
                  Selected: <strong>{selectedDate} at {
                timeSlots.find(s => s.value === selectedTime)?.label
              }</strong>
            </p>
          )}
        </div>
      )}

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
    background: "#fff", border: "1px solid #ddd",
    borderRadius: 12, padding: 24, marginBottom: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: { fontSize: 18, fontWeight: 700, color: "#333", marginBottom: 20, marginTop: 0 },
  group: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: 600, color: "#444" },
  input: { padding: "10px 12px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14, outline: "none" },
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 8,
    marginTop: 4,
  },
  slotBtn: {
    padding: "8px 4px", border: "1px solid #ddd",
    borderRadius: 8, fontSize: 13, cursor: "pointer",
    textAlign: "center", transition: "all 0.15s",
  },
  selectedNote: {
    fontSize: 13, color: "#155724",
    background: "#d4edda", borderRadius: 6,
    padding: "8px 12px", marginTop: 8,
  },
  noSlots: { fontSize: 13, color: "#856404", background: "#fff3cd", padding: "10px 12px", borderRadius: 8 },
  buttons: { display: "flex", gap: 10, marginTop: 16 },
  btnGreen: {
    background: "#28a745", color: "#fff", border: "none",
    padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  btnGray: {
    background: "#6c757d", color: "#fff", border: "none",
    padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
};

export default AppointmentForm;