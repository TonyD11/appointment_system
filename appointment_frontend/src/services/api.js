// Backend address change this if your Go server runs on a different port
const BASE_URL = "http://localhost:8080";

// Get all doctors
export async function getDoctors() {
  const response = await fetch(`${BASE_URL}/doctors`);
  const data = await response.json();
  return data;
}

// Get all appointments
export async function getAppointments() {
  const response = await fetch(`${BASE_URL}/appointments`);
  const data = await response.json();
  return data;
}

// Create a new appointment
export async function createAppointment(appointment) {
  const response = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
  const data = await response.json();
  return data;
}

// Update an existing appointment
export async function updateAppointment(id, appointment) {
  const response = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appointment),
  });
  const data = await response.json();
  return data;
}

// Delete an appointment
export async function deleteAppointment(id) {
  const response = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  return data;
}