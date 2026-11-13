const express = require('express');
const router = express.Router();
const store = require('../models/mockStore');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/patients - List patients (Admin & Doctor only)
router.get('/', authenticateToken, authorizeRoles('admin', 'doctor'), (req, res) => {
  const { search } = req.query;
  let results = [...store.patients];

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      p =>
        p.patient_name.toLowerCase().includes(s) ||
        p.email.toLowerCase().includes(s) ||
        (p.phone && p.phone.includes(s))
    );
  }

  res.json({ success: true, count: results.length, data: results });
});

// GET /api/patients/:id - Single patient details
router.get('/:id', authenticateToken, (req, res) => {
  const patient = store.patients.find(
    p => p.id === req.params.id || p.user_id === req.params.id
  );

  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  // Security check: patients can only access their own profile unless doctor or admin
  if (req.user.role === 'patient' && req.user.id !== patient.user_id) {
    return res.status(403).json({ success: false, message: 'Forbidden access' });
  }

  // Attach patient's medical records and appointments
  const appointments = store.appointments.filter(a => a.patient_id === patient.id);
  const records = store.medicalRecords.filter(r => r.patient_id === patient.id);
  const prescriptions = store.prescriptions.filter(pr => pr.patient_id === patient.id);

  res.json({
    success: true,
    data: {
      ...patient,
      appointments,
      medical_records: records,
      prescriptions
    }
  });
});

// PUT /api/patients/:id - Update profile
router.put('/:id', authenticateToken, (req, res) => {
  const index = store.patients.findIndex(
    p => p.id === req.params.id || p.user_id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  store.patients[index] = {
    ...store.patients[index],
    ...req.body
  };

  res.json({ success: true, message: 'Patient profile updated', data: store.patients[index] });
});

module.exports = router;
