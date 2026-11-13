const express = require('express');
const router = express.Router();
const store = require('../models/mockStore');
const { authenticateToken } = require('../middleware/auth');

// GET /api/appointments - List appointments based on role
router.get('/', authenticateToken, (req, res) => {
  const { role, id, doctorId, patientId } = req.user;
  const { status, date } = req.query;

  let list = [...store.appointments];

  if (role === 'patient') {
    // find patient id
    const currentPatient = store.patients.find(p => p.user_id === id);
    const pId = currentPatient ? currentPatient.id : patientId;
    list = list.filter(a => a.patient_id === pId);
  } else if (role === 'doctor') {
    const currentDoc = store.doctors.find(d => d.user_id === id);
    const dId = currentDoc ? currentDoc.id : doctorId;
    list = list.filter(a => a.doctor_id === dId);
  }

  if (status && status !== 'all') {
    list = list.filter(a => a.status === status);
  }

  if (date) {
    list = list.filter(a => a.appointment_date === date);
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));

  res.json({ success: true, count: list.length, data: list });
});

// POST /api/appointments - Book new appointment
router.post('/', authenticateToken, (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, symptoms, notes } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Please provide doctor, date and time slot' });
    }

    const doctor = store.doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Selected doctor not found' });
    }

    // Determine patient
    let patient = null;
    if (req.user.role === 'patient') {
      patient = store.patients.find(p => p.user_id === req.user.id);
    } else if (req.body.patientId) {
      patient = store.patients.find(p => p.id === req.body.patientId);
    }

    if (!patient) {
      return res.status(400).json({ success: false, message: 'Patient profile could not be identified' });
    }

    const newApptId = 'ap' + Date.now().toString().slice(-12).padStart(34, '0');
    const newAppointment = {
      id: newApptId,
      patient_id: patient.id,
      patient_name: patient.patient_name,
      patient_phone: patient.phone,
      doctor_id: doctor.id,
      doctor_name: doctor.doctor_name,
      department_name: doctor.department_name,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'pending',
      symptoms: symptoms || 'General Medical Consultation',
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    store.appointments.unshift(newAppointment);

    // Notify doctor
    store.notifications.unshift({
      id: 'nt' + Date.now().toString().slice(-12).padStart(34, '0'),
      user_id: doctor.user_id,
      title: 'New Appointment Booked',
      message: `${patient.patient_name} has scheduled an appointment for ${appointmentDate} at ${appointmentTime}.`,
      type: 'appointment',
      is_read: false,
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully!',
      data: newAppointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ success: false, message: 'Server error booking appointment' });
  }
});

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', authenticateToken, (req, res) => {
  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const appt = store.appointments.find(a => a.id === req.params.id);
  if (!appt) {
    return res.status(404).json({ success: false, message: 'Appointment not found' });
  }

  appt.status = status;
  appt.updated_at = new Date().toISOString();

  // Find patient user id to notify
  const patient = store.patients.find(p => p.id === appt.patient_id);
  if (patient) {
    store.notifications.unshift({
      id: 'nt' + Date.now().toString().slice(-12).padStart(34, '0'),
      user_id: patient.user_id,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your appointment with ${appt.doctor_name} on ${appt.appointment_date} is now marked as ${status}.`,
      type: 'appointment',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.json({ success: true, message: `Appointment status updated to ${status}`, data: appt });
});

module.exports = router;
