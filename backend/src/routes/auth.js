const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('../models/mockStore');
const { getPgPool } = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'patient', firstName, lastName, phone, specialization, qualification, departmentId } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Please provide email, password, first name and last name' });
    }

    // Check if user exists
    const existing = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUserId = 'u' + Date.now().toString().slice(-12).padStart(35, '0');
    const newUser = {
      id: newUserId,
      email: email.toLowerCase(),
      password: password, // For mock ease
      password_hash: passwordHash,
      role,
      first_name: firstName,
      last_name: lastName,
      phone: phone || '',
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}_${lastName}`,
      is_active: true,
      created_at: new Date().toISOString()
    };

    store.users.push(newUser);

    // If role is patient, create patient record
    if (role === 'patient') {
      const newPatient = {
        id: 'pt' + Date.now().toString().slice(-12).padStart(34, '0'),
        user_id: newUserId,
        patient_name: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        phone: phone || '',
        date_of_birth: '1995-01-01',
        gender: 'Other',
        blood_group: 'O+',
        address: 'Outpatient Address',
        emergency_contact_name: 'Next of Kin',
        emergency_contact_phone: phone || '',
        allergies: 'None',
        chronic_conditions: 'None',
        avatar_url: newUser.avatar_url,
        created_at: new Date().toISOString()
      };
      store.patients.push(newPatient);
    } else if (role === 'doctor') {
      const dept = store.departments.find(d => d.id === departmentId) || store.departments[0];
      const newDoctor = {
        id: 'dc' + Date.now().toString().slice(-12).padStart(34, '0'),
        user_id: newUserId,
        department_id: dept.id,
        department_name: dept.name,
        doctor_name: `Dr. ${firstName} ${lastName}`,
        specialization: specialization || 'General Practitioner',
        qualification: qualification || 'MD, MBBS',
        experience_years: 5,
        consultation_fee: 100.0,
        room_number: 'Wing A',
        bio: 'Dedicated healthcare professional.',
        rating: 5.0,
        email: email.toLowerCase(),
        phone: phone || '',
        avatar_url: newUser.avatar_url,
        available_days: ['Monday', 'Wednesday', 'Friday'],
        created_at: new Date().toISOString()
      };
      store.doctors.push(newDoctor);
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: `${firstName} ${lastName}` },
      process.env.JWT_SECRET || 'super_secret_healthcare_jwt_key_2026_xyz!#',
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        fullName: `${newUser.first_name} ${newUser.last_name}`,
        avatarUrl: newUser.avatar_url
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Validate password (plain or bcrypt)
    const isMatch = (user.password === password) || (user.password_hash && await bcrypt.compare(password, user.password_hash));
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Fetch related profile if patient or doctor
    let doctorProfile = null;
    let patientProfile = null;

    if (user.role === 'doctor') {
      doctorProfile = store.doctors.find(d => d.user_id === user.id) || null;
    } else if (user.role === 'patient') {
      patientProfile = store.patients.find(p => p.user_id === user.id) || null;
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        doctorId: doctorProfile ? doctorProfile.id : null,
        patientId: patientProfile ? patientProfile.id : null,
        name: `${user.first_name} ${user.last_name}`
      },
      process.env.JWT_SECRET || 'super_secret_healthcare_jwt_key_2026_xyz!#',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: `${user.first_name} ${user.last_name}`,
        phone: user.phone,
        avatarUrl: user.avatar_url,
        doctorId: doctorProfile ? doctorProfile.id : null,
        patientId: patientProfile ? patientProfile.id : null
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

module.exports = router;
