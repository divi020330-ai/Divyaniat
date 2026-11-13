const express = require('express');
const router = express.Router();
const store = require('../models/mockStore');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/prescriptions - List prescriptions based on role
router.get('/', authenticateToken, (req, res) => {
  const { role, id, patientId, doctorId } = req.user;
  let list = [...store.prescriptions];

  if (role === 'patient') {
    const pat = store.patients.find(p => p.user_id === id);
    const pId = pat ? pat.id : patientId;
    list = list.filter(p => p.patient_id === pId);
  } else if (role === 'doctor') {
    const doc = store.doctors.find(d => d.user_id === id);
    const dId = doc ? doc.id : doctorId;
    list = list.filter(p => p.doctor_id === dId);
  }

  res.json({ success: true, count: list.length, data: list });
});

// POST /api/prescriptions - Create & upload prescription (Doctor only)
router.post('/', authenticateToken, authorizeRoles('doctor', 'admin'), (req, res) => {
  const { patientId, recordId, appointmentId, medications, instructions } = req.body;

  if (!patientId || !medications || !medications.length) {
    return res.status(400).json({ success: false, message: 'Patient and at least one medication are required' });
  }

  const patient = store.patients.find(p => p.id === patientId);
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const doctor = store.doctors.find(d => d.user_id === req.user.id) || store.doctors[0];

  const newPrescriptionId = 'pr' + Date.now().toString().slice(-12).padStart(34, '0');
  const newPrescription = {
    id: newPrescriptionId,
    patient_id: patient.id,
    patient_name: patient.patient_name,
    doctor_id: doctor.id,
    doctor_name: doctor.doctor_name,
    record_id: recordId || null,
    appointment_id: appointmentId || null,
    medications, // Array of { name, dosage, frequency, duration, instructions }
    instructions: instructions || 'Take medications as directed with full glass of water.',
    issued_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };

  store.prescriptions.unshift(newPrescription);

  // Notify patient
  store.notifications.unshift({
    id: 'nt' + Date.now().toString().slice(-12).padStart(34, '0'),
    user_id: patient.user_id,
    title: 'New Digital Prescription Issued',
    message: `${doctor.doctor_name} has generated a new digital prescription for your treatment.`,
    type: 'prescription',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Prescription issued successfully',
    data: newPrescription
  });
});

module.exports = router;
