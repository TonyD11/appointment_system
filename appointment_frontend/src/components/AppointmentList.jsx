
function AppointmentList({ appointments, onEdit, onDelete }) {

  // Format date nicely for display
  // e.g. "27 Apr 2026, 10:30 AM"
  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-LK", {
      day:    "2-digit",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Check if appointment is upcoming or past
  function isUpcoming(dateString) {
    if (!dateString) return false;
    return new Date(dateString) > new Date();
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div style={styles.empty}>
        <p>No appointments yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>
         All Appointments ({appointments.length})
      </h2>

      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>#</th>
            <th style={styles.th}>Patient Name</th>
            <th style={styles.th}>Doctor</th>
            <th style={styles.th}>Contact</th>
            <th style={styles.th}>Date & Time</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, index) => (
            <tr key={appointment.id} style={styles.row}>

              <td style={styles.td}>{index + 1}</td>

              <td style={styles.td}>
                <strong>{appointment.patientName}</strong>
              </td>

              <td style={styles.td}>{appointment.doctorName}</td>

              <td style={styles.td}>{appointment.contactNumber}</td>

              {/* Date and Time */}
              <td style={styles.td}>
                {formatDate(appointment.appointmentDate)}
              </td>

              {/* Status badge - upcoming or past */}
              <td style={styles.td}>
                {isUpcoming(appointment.appointmentDate) ? (
                  <span style={styles.badgeGreen}>Upcoming</span>
                ) : (
                  <span style={styles.badgeGray}>Past</span>
                )}
              </td>

              <td style={styles.td}>
                <div style={styles.actions}>
                  <button style={styles.btnEdit} onClick={() => onEdit(appointment)}>
                    Edit
                  </button>
                  <button style={styles.btnDelete} onClick={() => onDelete(appointment.id)}>
                    Delete
                  </button>
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff", border: "1px solid #ddd",
    borderRadius: 12, padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: 18, fontWeight: 700, color: "#333",
    marginBottom: 16, marginTop: 0,
  },
  empty: {
    background: "#fff", border: "1px solid #ddd",
    borderRadius: 12, padding: 24,
    textAlign: "center", color: "#888",
  },
  table:     { width: "100%", borderCollapse: "collapse" },
  headerRow: { background: "#f8f9fa" },
  th: {
    textAlign: "left", padding: "10px 14px",
    fontSize: 13, fontWeight: 700, color: "#555",
    borderBottom: "2px solid #eee",
  },
  row: { borderBottom: "1px solid #f0f0f0" },
  td: {
    padding: "12px 14px", fontSize: 14,
    color: "#333", verticalAlign: "middle",
  },
  actions:   { display: "flex", gap: 8 },
  btnEdit: {
    background: "#007bff", color: "#fff", border: "none",
    padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
  },
  btnDelete: {
    background: "#dc3545", color: "#fff", border: "none",
    padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
  },
  badgeGreen: {
    background: "#d4edda", color: "#155724",
    padding: "3px 10px", borderRadius: 6,
    fontSize: 12, fontWeight: 600,
  },
  badgeGray: {
    background: "#e2e3e5", color: "#6c757d",
    padding: "3px 10px", borderRadius: 6,
    fontSize: 12, fontWeight: 600,
  },
};

export default AppointmentList;