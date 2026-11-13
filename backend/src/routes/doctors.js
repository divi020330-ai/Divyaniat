const express = require('express');
const router = express.Router();
const store = require('../models/mockStore');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// GET /api/doctors - List all doctors (with optional search & department filter)
router.get('/', (req, res) => {
  const { search, department, minRating } = req.query;
  let results = [...store.doctors];

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      d =>
        d.doctor_name.toLowerCase().includes(s) ||
        d.specialization.toLowerCase().includes(s) ||
        d.department_name.toLowerCase().includes(s)
    );
  }

  if (department && department !== 'all') {
    results = results.filter(
      d => d.department_name.toLowerCase() === department.toLowerCase() || d.department_id === department
    );
  }

  if (minRating) {
    results = results.filter(d => Number(d.rating) >= Number(minRating));
  }

  res.json({ success: true, count: results.length, data: results });
});

// GET /api/doctors/:id - Single doctor details
router.get('/:id', (req, res) => {
  const doctor = store.doctors.find(d => d.id === req.params.id || d.user_id === req.params.id);
  if (!doctor) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  // Get availability & upcoming slots
  const availability = {
    days: doctor.available_days || ['Monday', 'Wednesday', 'Friday'],
    timeSlots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '02:00 PM', '02:30 PM', '03:00 PM', '04:00 PM']
  };

  res.json({ success: true, data: { ...doctor, availability } });
});

// POST /api/doctors - Add doctor (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { firstName, lastName, email, phone, specialization, qualification, departmentId, consultationFee, roomNumber, bio, availableDays } = req.body;

  if (!firstName || !lastName || !email || !specialization) {
    return res.status(400).json({ success: false, message: 'Missing required doctor fields' });
  }

  const dept = store.departments.find(d => d.id === departmentId) || store.departments[0];
  const newUserId = 'u' + Date.now().toString().slice(-12).padStart(35, '0');
  const newDoctorId = 'dc' + Date.now().toString().slice(-12).padStart(34, '0');

  const newUser = {
    id: newUserId,
    email: email.toLowerCase(),
    password: 'password123',
    role: 'doctor',
    first_name: firstName,
    last_name: lastName,
    phone: phone || '',
    avatar_url: `https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80`,
    is_active: true,
    created_at: new Date().toISOString()
  };

  const newDoctor = {
    id: newDoctorId,
    user_id: newUserId,
    department_id: dept.id,
    department_name: dept.name,
    doctor_name: `Dr. ${firstName} ${lastName}`,
    specialization,
    qualification: qualification || 'MD, MBBS',
    experience_years: 6,
    consultation_fee: Number(consultationFee) || 100.0,
    room_number: roomNumber || 'Wing B-201',
    bio: bio || 'Expert medical practitioner.',
    rating: 5.0,
    email: email.toLowerCase(),
    phone: phone || '',
    avatar_url: newUser.avatar_url,
    available_days: availableDays || ['Monday', 'Tuesday', 'Thursday'],
    created_at: new Date().toISOString()
  };

  store.users.push(newUser);
  store.doctors.push(newDoctor);

  res.status(201).json({ success: true, message: 'Doctor added successfully', data: newDoctor });
});

// PUT /api/doctors/:id - Update doctor
router.put('/:id', authenticateToken, authorizeRoles('admin', 'doctor'), (req, res) => {
  const index = store.doctors.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  store.doctors[index] = {
    ...store.doctors[index],
    ...req.body
  };

  res.json({ success: true, message: 'Doctor updated successfully', data: store.doctors[index] });
});

// DELETE /api/doctors/:id - Delete doctor (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const index = store.doctors.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Doctor not found' });
  }

  const deleted = store.doctors.splice(index, 1)[0];
  res.json({ success: true, message: 'Doctor removed successfully', data: deleted });
});

module.exports = router;
