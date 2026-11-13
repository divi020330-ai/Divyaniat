const API_BASE = '/api';

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  // Doctors
  getDoctors: async (search = '', dept = '') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (dept && dept !== 'all') params.append('department', dept);
    const res = await fetch(`${API_BASE}/doctors?${params.toString()}`);
    return res.json();
  },

  getDoctorById: async (id) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`);
    return res.json();
  },

  addDoctor: async (doctorData, token) => {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(doctorData)
    });
    return res.json();
  },

  deleteDoctor: async (id, token) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Appointments
  getAppointments: async (token) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  bookAppointment: async (appointmentData, token) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(appointmentData)
    });
    return res.json();
  },

  updateAppointmentStatus: async (id, status, token) => {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Medical Records
  getMedicalRecords: async (token) => {
    const res = await fetch(`${API_BASE}/records`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  addMedicalRecord: async (recordData, token) => {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(recordData)
    });
    return res.json();
  },

  // Prescriptions
  getPrescriptions: async (token) => {
    const res = await fetch(`${API_BASE}/prescriptions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  addPrescription: async (data, token) => {
    const res = await fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Patients
  getPatients: async (token, search = '') => {
    const res = await fetch(`${API_BASE}/patients?search=${encodeURIComponent(search)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Departments
  getDepartments: async () => {
    const res = await fetch(`${API_BASE}/departments`);
    return res.json();
  },

  // Admin Dashboard
  getAdminDashboard: async (token) => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  // Notifications
  getNotifications: async (token) => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  markNotificationRead: async (id, token) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  }
};
