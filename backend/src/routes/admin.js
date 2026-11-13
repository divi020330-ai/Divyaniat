const express = require('express');
const router = express.Router();
const store = require('../models/mockStore');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/departments - List all clinical departments
router.get('/', (req, res) => {
  res.json({ success: true, count: store.departments.length, data: store.departments });
});

// POST /api/departments - Add department (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { name, description, icon, headDoctorName } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Department name is required' });
  }

  const newDept = {
    id: 'd' + Date.now().toString().slice(-12).padStart(35, '0'),
    name,
    description: description || '',
    icon: icon || 'Activity',
    head_doctor_name: headDoctorName || 'Chief Medical Officer',
    created_at: new Date().toISOString()
  };

  store.departments.push(newDept);
  res.status(201).json({ success: true, message: 'Department added successfully', data: newDept });
});

// GET /api/admin/dashboard - High-level analytics & metrics
router.get('/dashboard', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const totalDoctors = store.doctors.length;
  const totalPatients = store.patients.length;
  const totalAppointments = store.appointments.length;
  const pendingAppointments = store.appointments.filter(a => a.status === 'pending').length;
  const completedAppointments = store.appointments.filter(a => a.status === 'completed').length;
  const totalPrescriptions = store.prescriptions.length;

  // Department distribution
  const departmentStats = store.departments.map(dept => {
    const docCount = store.doctors.filter(d => d.department_id === dept.id || d.department_name === dept.name).length;
    const apptCount = store.appointments.filter(a => a.department_name === dept.name).length;
    return {
      id: dept.id,
      name: dept.name,
      doctorCount: docCount,
      appointmentCount: apptCount
    };
  });

  // Recent system activity
  const recentAppointments = store.appointments.slice(0, 5);

  res.json({
    success: true,
    data: {
      stats: {
        totalDoctors,
        totalPatients,
        totalAppointments,
        pendingAppointments,
        completedAppointments,
        totalPrescriptions,
        occupancyRate: '88.4%',
        patientSatisfaction: '96.2%'
      },
      departmentStats,
      recentAppointments
    }
  });
});

module.exports = router;
