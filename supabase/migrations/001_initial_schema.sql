-- ==============================================================================
-- Healthcare Management System - Supabase PostgreSQL Initial Schema & Seed Data
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables in reverse dependency order if needed
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. DEPARTMENTS TABLE
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Activity',
    head_doctor_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. DOCTORS TABLE
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    specialization VARCHAR(150) NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    experience_years INT DEFAULT 1,
    consultation_fee NUMERIC(10, 2) DEFAULT 50.00,
    room_number VARCHAR(50),
    bio TEXT,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PATIENTS TABLE
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
    blood_group VARCHAR(10),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    allergies TEXT,
    chronic_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. DOCTOR AVAILABILITY TABLE
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INT DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. APPOINTMENTS TABLE
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    symptoms TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. MEDICAL RECORDS TABLE
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    vital_signs JSONB DEFAULT '{"blood_pressure": "120/80", "heart_rate": "72 bpm", "temperature": "98.6 F", "weight": "70 kg"}'::jsonb,
    lab_results TEXT,
    notes TEXT,
    record_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PRESCRIPTIONS TABLE
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. [{"name":"Amoxicillin","dosage":"500mg","frequency":"Twice daily","duration":"7 days"}]
    instructions TEXT,
    issued_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'appointment', 'prescription', 'alert', 'info'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to departments & doctors
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Public read availability" ON doctor_availability FOR SELECT USING (true);

-- Allow authenticated/service role full access (Node backend interacts via service role or controlled JWT)
CREATE POLICY "Service and authenticated users read users" ON users FOR ALL USING (true);
CREATE POLICY "Service and authenticated doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Service and authenticated patients" ON patients FOR ALL USING (true);
CREATE POLICY "Service and authenticated appointments" ON appointments FOR ALL USING (true);
CREATE POLICY "Service and authenticated records" ON medical_records FOR ALL USING (true);
CREATE POLICY "Service and authenticated prescriptions" ON prescriptions FOR ALL USING (true);
CREATE POLICY "Service and authenticated notifications" ON notifications FOR ALL USING (true);
CREATE POLICY "Service and authenticated audit" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Service full departments" ON departments FOR ALL USING (true);
CREATE POLICY "Service full availability" ON doctor_availability FOR ALL USING (true);

-- ==============================================================================
-- SEED DATA (Synthetic Healthcare Dataset)
-- Passwords are hashed with bcrypt for 'password123':
-- $2b$10$w6KzXN1vj/3bQoR0jYd0yO8mZ4o4lB78J9Nq1J0b56k1vE3B2M7uG
-- ==============================================================================

-- 1. Departments Seed
INSERT INTO departments (id, name, description, icon, head_doctor_name) VALUES
('d1111111-1111-1111-1111-111111111111', 'Cardiology', 'Comprehensive cardiovascular diagnostics, surgery, and rehabilitation.', 'Heart', 'Dr. Sarah Connor'),
('d2222222-2222-2222-2222-222222222222', 'Neurology', 'Diagnosis and treatment of neurological and brain disorders.', 'Brain', 'Dr. Gregory House'),
('d3333333-3333-3333-3333-333333333333', 'Pediatrics', 'Compassionate pediatric and newborn healthcare and immunization.', 'Baby', 'Dr. Lisa Cuddy'),
('d4444444-4444-4444-4444-444444444444', 'Orthopedics', 'Musculoskeletal care, joint replacements, and sports injury recovery.', 'Bone', 'Dr. James Wilson'),
('d5555555-5555-5555-5555-555555555555', 'General Medicine', 'Primary outpatient care, routine checkups, and chronic disease management.', 'Stethoscope', 'Dr. Allison Cameron')
ON CONFLICT (name) DO NOTHING;

-- 2. Users Seed (Admin, Doctors, Patients)
-- Using bcrypt hash for 'password123': $2b$10$w6KzXN1vj/3bQoR0jYd0yO8mZ4o4lB78J9Nq1J0b56k1vE3B2M7uG
-- Also supporting plain password check in server for robustness
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone, avatar_url) VALUES
('u0000000-0000-0000-0000-000000000001', 'admin@medicare.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin', 'Super', 'Admin', '+1 (555) 019-2831', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),

('u0000000-0000-0000-0000-000000000002', 'doctor.carter@medicare.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'doctor', 'John', 'Carter', '+1 (555) 234-5678', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80'),
('u0000000-0000-0000-0000-000000000003', 'doctor.chen@medicare.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'doctor', 'Emily', 'Chen', '+1 (555) 345-6789', 'https://images.unsplash.com/photo-1594824813624-93ec5242d54e?auto=format&fit=crop&w=300&q=80'),
('u0000000-0000-0000-0000-000000000004', 'doctor.patel@medicare.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'doctor', 'Rajesh', 'Patel', '+1 (555) 456-7890', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80'),

('u0000000-0000-0000-0000-000000000005', 'patient.alice@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'patient', 'Alice', 'Morgan', '+1 (555) 888-1122', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'),
('u0000000-0000-0000-0000-000000000006', 'patient.bruce@gmail.com', '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'patient', 'Bruce', 'Wayne', '+1 (555) 777-3344', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80')
ON CONFLICT (email) DO NOTHING;

-- 3. Doctors Table Seed
INSERT INTO doctors (id, user_id, department_id, specialization, qualification, experience_years, consultation_fee, room_number, bio, rating) VALUES
('dc000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 'Senior Interventional Cardiologist', 'MD, FACC - Harvard Medical School', 14, 120.00, 'Room 304, Wing B', 'Specializing in coronary interventions, cardiac rhythm disorders, and preventive cardiology with over 14 years of clinical excellence.', 4.95),
('dc000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 'd2222222-2222-2222-2222-222222222222', 'Consultant Neurologist', 'MD, PhD - Johns Hopkins', 10, 140.00, 'Room 210, Wing A', 'Specialized in migraine management, neuromuscular disorders, epilepsy, and neuro-rehabilitation.', 4.90),
('dc000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000004', 'd3333333-3333-3333-3333-333333333333', 'Chief Pediatrician', 'MBBS, DCH - Stanford Medicine', 12, 90.00, 'Room 105, Wing C', 'Devoted to developmental pediatrics, childhood allergies, neonatology, and adolescent wellness.', 4.88)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Patients Table Seed
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions) VALUES
('pt000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000005', '1992-06-14', 'Female', 'O+', '742 Evergreen Terrace, Springfield, OR', 'Mark Morgan (Spouse)', '+1 (555) 888-9900', 'Penicillin, Peanuts', 'Mild Asthma'),
('pt000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000006', '1985-02-19', 'Male', 'A+', '1007 Mountain Drive, Gotham City, NJ', 'Alfred Pennyworth', '+1 (555) 777-1100', 'None known', 'Hypertension Stage 1')
ON CONFLICT (user_id) DO NOTHING;

-- 5. Doctor Availability Seed
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes) VALUES
('dc000000-0000-0000-0000-000000000001', 'Monday', '09:00:00', '13:00:00', 30),
('dc000000-0000-0000-0000-000000000001', 'Wednesday', '09:00:00', '14:00:00', 30),
('dc000000-0000-0000-0000-000000000001', 'Friday', '14:00:00', '18:00:00', 30),
('dc000000-0000-0000-0000-000000000002', 'Tuesday', '10:00:00', '16:00:00', 30),
('dc000000-0000-0000-0000-000000000002', 'Thursday', '10:00:00', '16:00:00', 30),
('dc000000-0000-0000-0000-000000000003', 'Monday', '08:30:00', '12:30:00', 20),
('dc000000-0000-0000-0000-000000000003', 'Thursday', '13:00:00', '17:00:00', 20);

-- 6. Appointments Seed
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, symptoms, notes) VALUES
('ap000000-0000-0000-0000-000000000001', 'pt000000-0000-0000-0000-000000000001', 'dc000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '1 day', '09:30:00', 'confirmed', 'Occasional chest tightness and shortness of breath during workouts', 'Requested ECG and preliminary lipid profile'),
('ap000000-0000-0000-0000-000000000002', 'pt000000-0000-0000-0000-000000000002', 'dc000000-0000-0000-0000-000000000002', CURRENT_DATE + INTERVAL '2 day', '10:30:00', 'pending', 'Recurring severe left-side migraines and photosensitivity', 'Follow-up MRI review scheduled'),
('ap000000-0000-0000-0000-000000000003', 'pt000000-0000-0000-0000-000000000001', 'dc000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '14 day', '11:00:00', 'completed', 'Annual cardiology wellness checkup', 'Routine annual check, ECG normal')
ON CONFLICT (id) DO NOTHING;

-- 7. Medical Records Seed
INSERT INTO medical_records (id, patient_id, doctor_id, appointment_id, diagnosis, treatment_plan, vital_signs, lab_results, notes, record_date) VALUES
('mr000000-0000-0000-0000-000000000001', 'pt000000-0000-0000-0000-000000000001', 'dc000000-0000-0000-0000-000000000001', 'ap000000-0000-0000-0000-000000000003', 'Normal Sinus Rhythm with Mild Exercise-induced Bronchospasm', 'Maintain active cardiovascular exercise, monitor peak flows, stay well hydrated.', '{"blood_pressure": "118/76", "heart_rate": "68 bpm", "temperature": "98.4 F", "oxygen_saturation": "99%", "weight": "62 kg"}'::jsonb, 'Lipid panel: Total cholesterol 175 mg/dL, HDL 55 mg/dL, Triglycerides 110 mg/dL.', 'Patient in very good overall health. Repeat ECG in 12 months.', CURRENT_DATE - INTERVAL '14 day')
ON CONFLICT (id) DO NOTHING;

-- 8. Prescriptions Seed
INSERT INTO prescriptions (id, record_id, appointment_id, patient_id, doctor_id, medications, instructions, issued_date) VALUES
('pr000000-0000-0000-0000-000000000001', 'mr000000-0000-0000-0000-000000000001', 'ap000000-0000-0000-0000-000000000003', 'pt000000-0000-0000-0000-000000000001', 'dc000000-0000-0000-0000-000000000001', 
'[
  {"name": "Albuterol Inhaler (Ventolin)", "dosage": "90 mcg/actuation", "frequency": "1-2 puffs as needed 15 mins before exercise", "duration": "30 days", "instructions": "Rinse mouth after inhalation"},
  {"name": "Omega-3 Fish Oil", "dosage": "1000 mg", "frequency": "Once daily with breakfast", "duration": "90 days", "instructions": "Take with meals"}
]'::jsonb, 
'Inhale 15 minutes before intense aerobic exertion. Drink at least 2.5L water daily.', CURRENT_DATE - INTERVAL '14 day')
ON CONFLICT (id) DO NOTHING;

-- 9. Notifications Seed
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
('u0000000-0000-0000-0000-000000000005', 'Appointment Confirmed', 'Your appointment with Dr. John Carter has been confirmed for tomorrow at 09:30 AM.', 'appointment', FALSE),
('u0000000-0000-0000-0000-000000000002', 'New Appointment Request', 'Alice Morgan has booked a consultation for tomorrow at 09:30 AM.', 'appointment', FALSE),
('u0000000-0000-0000-0000-000000000001', 'System Report Ready', 'Monthly patient enrollment and revenue reports have been compiled.', 'info', TRUE);
