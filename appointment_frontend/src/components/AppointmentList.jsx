function AppointmentList({ appointments, onEdit, onDelete }) {
  // If no appointments yet
  if (!appointments.length === 0) {
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
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, index) => (
            <tr key={appointment.id} style={styles.row}>
              {/* Row number */}
              <td style={styles.td}>{index + 1}</td>

              {/* Patient name */}
              <td style={styles.td}>
                <strong>{appointment.patientName}</strong>
              </td>

              {/* Doctor name */}
              <td style={styles.td}>{appointment.doctorName}</td>

              {/* Contact number */}
              <td style={styles.td}>{appointment.contactNumber}</td>

              {/* Edit and Delete buttons */}
              <td style={styles.td}>
                <div style={styles.actions}>
                  <button
                    style={styles.btnEdit}
                    onClick={() => onEdit(appointment)}
                  >
                    Edit
                  </button>
                  <button
                    style={styles.btnDelete}
                    onClick={() => onDelete(appointment.id)}
                  >
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
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#333",
    marginBottom: 16,
    marginTop: 0,
  },
  empty: {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 24,
    textAlign: "center",
    color: "#888",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    background: "#f8f9fa",
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    fontSize: 13,
    fontWeight: 700,
    color: "#555",
    borderBottom: "2px solid #eee",
  },
  row: {
    borderBottom: "1px solid #f0f0f0",
  },
  td: {
    padding: "12px 14px",
    fontSize: 14,
    color: "#333",
    verticalAlign: "middle",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  btnEdit: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
  },
  btnDelete: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
  },
};

export default AppointmentList;