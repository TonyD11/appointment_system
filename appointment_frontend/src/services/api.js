// All API calls to the Go backend
const BASE_URL = "http://localhost:8080";

// ── Register
export async function register(username, email, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}

// ── Login
export async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}

// ── Forgot Password
export async function forgotPassword(email) {
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}

// ── Reset Password
export async function resetPassword(token, password) {
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

// ── Get all doctors
export async function getDoctors() {
  try {
    const response = await fetch(`${BASE_URL}/doctors`);
    return response.json();
  } catch {
    return [];
  }
}

// ── Get all appointments
export async function getAppointments() {
  try {
    const response = await fetch(`${BASE_URL}/appointments`);
    return response.json();
  } catch {
    return [];
  }
}

// ── Create appointment
export async function createAppointment(data) {
  try {
    const response = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}

// ── Update appointment
export async function updateAppointment(id, data) {
  try {
    const response = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}

// ── Delete appointment
export async function deleteAppointment(id) {
  try {
    const response = await fetch(`${BASE_URL}/appointments/${id}`, {
      method: "DELETE",
    });
    return response.json();
  } catch {
    return { error: "Cannot connect to server" };
  }
}