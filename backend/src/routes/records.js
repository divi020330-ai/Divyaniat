const express = require('express');
const router = express.Router();
const store = require('../models/mockStore');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/records - Get medical records (filtered by patient or doctor role)
router.get('/', authenticateToken, (req, res) => {
  const { role, id, patientId, doctorId } = req.user;
  let records = [...store.medicalRecords];

  if (role === 'patient') {
    const pat = store.patients.find(p => p.user_id === id);
    const pId = pat ? pat.id : patientId;
    records = records.filter(r => r.patient_id === pId);
  } else if (role === 'doctor') {
    const doc = store.doctors.find(d => d.user_id === id);
    const dId = doc ? doc.id : doctorId;
    records = records.filter(r => r.doctor_id === dId);
  }

  res.json({ success: true, count: records.length, data: records });
});

// POST /api/records - Add medical record & diagnosis (Doctors only)
router.post('/', authenticateToken, authorizeRoles('doctor', 'admin'), (req, res) => {
  const { patientId, appointmentId, diagnosis, treatmentPlan, vitalSigns, labResults, notes } = req.body;

  if (!patientId || !diagnosis) {
    return res.status(400).json({ success: false, message: 'Patient and diagnosis are required' });
  }

  const patient = store.patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const doctor = store.doctors.find(d => d.user_id === req.user.id) || store.doctors[0];

  const newRecordId = 'mr' + Date.now().toString().slice(-12).padStart(34, '0');
  const newRecord = {
    id: newRecordId,
    patient_id: patient.id,
    patient_name: patient.patient_name,
    doctor_id: doctor.id,
    doctor_name: doctor.doctor_name,
    appointment_id: appointmentId || null,
    diagnosis,
    treatment_plan: treatmentPlan || '',
    vital_signs: vitalSigns || {
      blood_pressure: '120/80 mmHg',
      heart_rate: '72 bpm',
      temperature: '98.6 °F',
      oxygen_saturation: '98%',
      weight: '70 kg'
    },
    lab_results: labResults || '',
    notes: notes || '',
    record_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  store.medicalRecords.unshift(newRecord);

  // If appointment exists, mark appointment as completed
  if (appointmentId) {
    const appt = store.appointments.find(a => a.id === appointmentId);
    if (appt) {
      appt.status = 'completed';
    }
  }

  // Notify patient
  store.notifications.unshift({
    id: 'nt' + Date.now().toString().slice(-12).padStart(34, '0'),
    user_id: patient.user_id,
    title: 'New Medical Record Added',
    message: `${doctor.doctor_name} has updated your clinical diagnosis and medical record.`,
    type: 'alert',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json({ success: true, message: 'Medical record created successfully', data: newRecord });
});

module.exports = router;
