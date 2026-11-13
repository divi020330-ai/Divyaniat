// In-memory data store preloaded with high-fidelity synthetic healthcare data
// Perfectly matches Supabase schema so the application runs immediately out of the box
// even before credentials are plugged in, and allows full write/CRUD operations!

const initialUsers = [
  {
    id: 'u0000000-0000-0000-0000-000000000001',
    email: 'admin@medicare.com',
    password: 'password123',
    role: 'admin',
    first_name: 'Super',
    last_name: 'Admin',
    phone: '+1 (555) 019-2831',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'u0000000-0000-0000-0000-000000000002',
    email: 'doctor.carter@medicare.com',
    password: 'password123',
    role: 'doctor',
    first_name: 'John',
    last_name: 'Carter',
    phone: '+1 (555) 234-5678',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'u0000000-0000-0000-0000-000000000003',
    email: 'doctor.chen@medicare.com',
    password: 'password123',
    role: 'doctor',
    first_name: 'Emily',
    last_name: 'Chen',
    phone: '+1 (555) 345-6789',
    avatar_url: 'https://images.unsplash.com/photo-1594824813624-93ec5242d54e?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'u0000000-0000-0000-0000-000000000004',
    email: 'doctor.patel@medicare.com',
    password: 'password123',
    role: 'doctor',
    first_name: 'Rajesh',
    last_name: 'Patel',
    phone: '+1 (555) 456-7890',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'u0000000-0000-0000-0000-000000000005',
    email: 'patient.alice@gmail.com',
    password: 'password123',
    role: 'patient',
    first_name: 'Alice',
    last_name: 'Morgan',
    phone: '+1 (555) 888-1122',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'u0000000-0000-0000-0000-000000000006',
    email: 'patient.bruce@gmail.com',
    password: 'password123',
    role: 'patient',
    first_name: 'Bruce',
    last_name: 'Wayne',
    phone: '+1 (555) 777-3344',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

const initialDepartments = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    name: 'Cardiology',
    description: 'Comprehensive cardiovascular diagnostics, surgery, and rehabilitation.',
    icon: 'Heart',
    head_doctor_name: 'Dr. Sarah Connor',
    created_at: new Date().toISOString()
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    name: 'Neurology',
    description: 'Diagnosis and treatment of neurological and brain disorders.',
    icon: 'Brain',
    head_doctor_name: 'Dr. Gregory House',
    created_at: new Date().toISOString()
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    name: 'Pediatrics',
    description: 'Compassionate pediatric and newborn healthcare and immunization.',
    icon: 'Baby',
    head_doctor_name: 'Dr. Lisa Cuddy',
    created_at: new Date().toISOString()
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Orthopedics',
    description: 'Musculoskeletal care, joint replacements, and sports injury recovery.',
    icon: 'Bone',
    head_doctor_name: 'Dr. James Wilson',
    created_at: new Date().toISOString()
  },
  {
    id: 'd5555555-5555-5555-5555-555555555555',
    name: 'General Medicine',
    description: 'Primary outpatient care, routine checkups, and chronic disease management.',
    icon: 'Stethoscope',
    head_doctor_name: 'Dr. Allison Cameron',
    created_at: new Date().toISOString()
  }
];

const initialDoctors = [
  {
    id: 'dc000000-0000-0000-0000-000000000001',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    department_id: 'd1111111-1111-1111-1111-111111111111',
    department_name: 'Cardiology',
    doctor_name: 'Dr. John Carter',
    specialization: 'Senior Interventional Cardiologist',
    qualification: 'MD, FACC - Harvard Medical School',
    experience_years: 14,
    consultation_fee: 120.0,
    room_number: 'Room 304, Wing B',
    bio: 'Specializing in coronary interventions, cardiac rhythm disorders, and preventive cardiology with over 14 years of clinical excellence.',
    rating: 4.95,
    email: 'doctor.carter@medicare.com',
    phone: '+1 (555) 234-5678',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    available_days: ['Monday', 'Wednesday', 'Friday'],
    created_at: new Date().toISOString()
  },
  {
    id: 'dc000000-0000-0000-0000-000000000002',
    user_id: 'u0000000-0000-0000-0000-000000000003',
    department_id: 'd2222222-2222-2222-2222-222222222222',
    department_name: 'Neurology',
    doctor_name: 'Dr. Emily Chen',
    specialization: 'Consultant Neurologist',
    qualification: 'MD, PhD - Johns Hopkins',
    experience_years: 10,
    consultation_fee: 140.0,
    room_number: 'Room 210, Wing A',
    bio: 'Specialized in migraine management, neuromuscular disorders, epilepsy, and neuro-rehabilitation.',
    rating: 4.9,
    email: 'doctor.chen@medicare.com',
    phone: '+1 (555) 345-6789',
    avatar_url: 'https://images.unsplash.com/photo-1594824813624-93ec5242d54e?auto=format&fit=crop&w=300&q=80',
    available_days: ['Tuesday', 'Thursday'],
    created_at: new Date().toISOString()
  },
  {
    id: 'dc000000-0000-0000-0000-000000000003',
    user_id: 'u0000000-0000-0000-0000-000000000004',
    department_id: 'd3333333-3333-3333-3333-333333333333',
    department_name: 'Pediatrics',
    doctor_name: 'Dr. Rajesh Patel',
    specialization: 'Chief Pediatrician',
    qualification: 'MBBS, DCH - Stanford Medicine',
    experience_years: 12,
    consultation_fee: 90.0,
    room_number: 'Room 105, Wing C',
    bio: 'Devoted to developmental pediatrics, childhood allergies, neonatology, and adolescent wellness.',
    rating: 4.88,
    email: 'doctor.patel@medicare.com',
    phone: '+1 (555) 456-7890',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    available_days: ['Monday', 'Thursday'],
    created_at: new Date().toISOString()
  }
];

const initialPatients = [
  {
    id: 'pt000000-0000-0000-0000-000000000001',
    user_id: 'u0000000-0000-0000-0000-000000000005',
    patient_name: 'Alice Morgan',
    email: 'patient.alice@gmail.com',
    phone: '+1 (555) 888-1122',
    date_of_birth: '1992-06-14',
    gender: 'Female',
    blood_group: 'O+',
    address: '742 Evergreen Terrace, Springfield, OR',
    emergency_contact_name: 'Mark Morgan (Spouse)',
    emergency_contact_phone: '+1 (555) 888-9900',
    allergies: 'Penicillin, Peanuts',
    chronic_conditions: 'Mild Asthma',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'pt000000-0000-0000-0000-000000000002',
    user_id: 'u0000000-0000-0000-0000-000000000006',
    patient_name: 'Bruce Wayne',
    email: 'patient.bruce@gmail.com',
    phone: '+1 (555) 777-3344',
    date_of_birth: '1985-02-19',
    gender: 'Male',
    blood_group: 'A+',
    address: '1007 Mountain Drive, Gotham City, NJ',
    emergency_contact_name: 'Alfred Pennyworth',
    emergency_contact_phone: '+1 (555) 777-1100',
    allergies: 'None known',
    chronic_conditions: 'Hypertension Stage 1',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    created_at: new Date().toISOString()
  }
];

const initialAppointments = [
  {
    id: 'ap000000-0000-0000-0000-000000000001',
    patient_id: 'pt000000-0000-0000-0000-000000000001',
    patient_name: 'Alice Morgan',
    patient_phone: '+1 (555) 888-1122',
    doctor_id: 'dc000000-0000-0000-0000-000000000001',
    doctor_name: 'Dr. John Carter',
    department_name: 'Cardiology',
    appointment_date: '2026-11-14',
    appointment_time: '09:30 AM',
    status: 'confirmed',
    symptoms: 'Occasional chest tightness and shortness of breath during workouts',
    notes: 'Requested ECG and preliminary lipid profile',
    created_at: new Date().toISOString()
  },
  {
    id: 'ap000000-0000-0000-0000-000000000002',
    patient_id: 'pt000000-0000-0000-0000-000000000002',
    patient_name: 'Bruce Wayne',
    patient_phone: '+1 (555) 777-3344',
    doctor_id: 'dc000000-0000-0000-0000-000000000002',
    doctor_name: 'Dr. Emily Chen',
    department_name: 'Neurology',
    appointment_date: '2026-11-15',
    appointment_time: '10:30 AM',
    status: 'pending',
    symptoms: 'Recurring severe left-side migraines and photosensitivity',
    notes: 'Follow-up MRI review scheduled',
    created_at: new Date().toISOString()
  },
  {
    id: 'ap000000-0000-0000-0000-000000000003',
    patient_id: 'pt000000-0000-0000-0000-000000000001',
    patient_name: 'Alice Morgan',
    patient_phone: '+1 (555) 888-1122',
    doctor_id: 'dc000000-0000-0000-0000-000000000001',
    doctor_name: 'Dr. John Carter',
    department_name: 'Cardiology',
    appointment_date: '2026-11-01',
    appointment_time: '11:00 AM',
    status: 'completed',
    symptoms: 'Annual cardiology wellness checkup',
    notes: 'Routine annual check, ECG normal',
    created_at: new Date().toISOString()
  }
];

const initialMedicalRecords = [
  {
    id: 'mr000000-0000-0000-0000-000000000001',
    patient_id: 'pt000000-0000-0000-0000-000000000001',
    patient_name: 'Alice Morgan',
    doctor_id: 'dc000000-0000-0000-0000-000000000001',
    doctor_name: 'Dr. John Carter',
    appointment_id: 'ap000000-0000-0000-0000-000000000003',
    diagnosis: 'Normal Sinus Rhythm with Mild Exercise-induced Bronchospasm',
    treatment_plan: 'Maintain active cardiovascular exercise, monitor peak flows, stay well hydrated.',
    vital_signs: {
      blood_pressure: '118/76 mmHg',
      heart_rate: '68 bpm',
      temperature: '98.4 °F',
      oxygen_saturation: '99%',
      weight: '62 kg'
    },
    lab_results: 'Lipid panel: Total cholesterol 175 mg/dL, HDL 55 mg/dL, Triglycerides 110 mg/dL.',
    notes: 'Patient in very good overall health. Repeat ECG in 12 months.',
    record_date: '2026-11-01',
    created_at: new Date().toISOString()
  }
];

const initialPrescriptions = [
  {
    id: 'pr000000-0000-0000-0000-000000000001',
    record_id: 'mr000000-0000-0000-0000-000000000001',
    appointment_id: 'ap000000-0000-0000-0000-000000000003',
    patient_id: 'pt000000-0000-0000-0000-000000000001',
    patient_name: 'Alice Morgan',
    doctor_id: 'dc000000-0000-0000-0000-000000000001',
    doctor_name: 'Dr. John Carter',
    medications: [
      {
        name: 'Albuterol Inhaler (Ventolin)',
        dosage: '90 mcg/actuation',
        frequency: '1-2 puffs as needed 15 mins before exercise',
        duration: '30 days',
        instructions: 'Rinse mouth after inhalation'
      },
      {
        name: 'Omega-3 Fish Oil',
        dosage: '1000 mg',
        frequency: 'Once daily with breakfast',
        duration: '90 days',
        instructions: 'Take with food'
      }
    ],
    instructions: 'Inhale 15 minutes before intense aerobic exertion. Drink at least 2.5L water daily.',
    issued_date: '2026-11-01',
    created_at: new Date().toISOString()
  }
];

const initialNotifications = [
  {
    id: 'nt000000-0000-0000-0000-000000000001',
    user_id: 'u0000000-0000-0000-0000-000000000005',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. John Carter is confirmed for tomorrow at 09:30 AM.',
    type: 'appointment',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'nt000000-0000-0000-0000-000000000002',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    title: 'New Appointment Scheduled',
    message: 'Alice Morgan has scheduled a consultation with you for tomorrow at 09:30 AM.',
    type: 'appointment',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: 'nt000000-0000-0000-0000-000000000003',
    user_id: 'u0000000-0000-0000-0000-000000000001',
    title: 'System Analytics Ready',
    message: 'Healthcare portal health metrics, patient intake, and department reports are ready.',
    type: 'info',
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
];

// Memory Store State
const store = {
  users: [...initialUsers],
  departments: [...initialDepartments],
  doctors: [...initialDoctors],
  patients: [...initialPatients],
  appointments: [...initialAppointments],
  medicalRecords: [...initialMedicalRecords],
  prescriptions: [...initialPrescriptions],
  notifications: [...initialNotifications]
};

module.exports = store;
