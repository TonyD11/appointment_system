function DoctorSelect({ doctors, value, onChange }) {
  return (
    <div style={styles.group}>
      <label style={styles.label}>Select Doctor</label>
      <select
        style={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">-- Select a Doctor --</option>

        {/* Loop through doctors and show each one */}
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.name} — {doctor.speciality}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles = {
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
  select: {
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: "#fff",
    cursor: "pointer",
  },
};

export default DoctorSelect;