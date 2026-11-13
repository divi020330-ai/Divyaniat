import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  FileText,
  Pill,
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Activity,
  LogOut,
  Bell,
  Stethoscope,
  ChevronRight,
  Shield,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import { api } from './services/api';

export default function App() {
  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('medicare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('medicare_token') || '');

  // Navigation tab
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Login/Register Form State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginEmail, setLoginEmail] = useState('patient.alice@gmail.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
    specialization: '',
    qualification: ''
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data states
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  // Filter/Search states
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal states
  const [bookingModalDoc, setBookingModalDoc] = useState(null);
  const [bookDate, setBookDate] = useState('2026-11-16');
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookSymptoms, setBookSymptoms] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const [addRecordModal, setAddRecordModal] = useState(false);
  const [newRecordPatientId, setNewRecordPatientId] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newTreatmentPlan, setNewTreatmentPlan] = useState('');
  const [newBp, setNewBp] = useState('120/80');
  const [newHr, setNewHr] = useState('72');

  const [addPrescriptionModal, setAddPrescriptionModal] = useState(false);
  const [prescPatientId, setPrescPatientId] = useState('');
  const [prescMedName, setPrescMedName] = useState('');
  const [prescDosage, setPrescDosage] = useState('');
  const [prescDuration, setPrescDuration] = useState('');
  const [prescInstructions, setPrescInstructions] = useState('');

  const [addDoctorModal, setAddDoctorModal] = useState(false);
  const [newDocData, setNewDocData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: 'Cardiologist',
    qualification: 'MD, FACC',
    consultationFee: 120,
    departmentId: ''
  });

  // Load initial public and authenticated data
  useEffect(() => {
    loadPublicData();
  }, [doctorSearch, selectedDept]);

  useEffect(() => {
    if (token && user) {
      loadUserData();
    }
  }, [token, user]);

  const loadPublicData = async () => {
    try {
      const docRes = await api.getDoctors(doctorSearch, selectedDept);
      if (docRes.success) setDoctors(docRes.data);

      const deptRes = await api.getDepartments();
      if (deptRes.success) setDepartments(deptRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUserData = async () => {
    try {
      const [apptsRes, recsRes, presRes, notifRes] = await Promise.all([
        api.getAppointments(token),
        api.getMedicalRecords(token),
        api.getPrescriptions(token),
        api.getNotifications(token)
      ]);

      if (apptsRes.success) setAppointments(apptsRes.data);
      if (recsRes.success) setRecords(recsRes.data);
      if (presRes.success) setPrescriptions(presRes.data);
      if (notifRes.success) setNotifications(notifRes.data);

      if (user.role === 'admin' || user.role === 'doctor') {
        const patRes = await api.getPatients(token);
        if (patRes.success) setPatients(patRes.data);
      }

      if (user.role === 'admin') {
        const dashRes = await api.getAdminDashboard(token);
        if (dashRes.success) setAdminStats(dashRes.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auth Handlers
  const handleLogin = async (e) => {
    e?.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('medicare_user', JSON.stringify(res.user));
        localStorage.setItem('medicare_token', res.token);
        setActiveTab('overview');
      } else {
        setAuthError(res.message || 'Login failed');
      }
    } catch (err) {
      setAuthError('Unable to connect to healthcare backend');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await api.register(regData);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('medicare_user', JSON.stringify(res.user));
        localStorage.setItem('medicare_token', res.token);
        setActiveTab('overview');
      } else {
        setAuthError(res.message || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Registration network error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('medicare_user');
    localStorage.removeItem('medicare_token');
    setActiveTab('overview');
  };

  // Quick switch demo users
  const quickDemoLogin = (email, pass = 'password123') => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setAuthMode('login');
  };

  // Appointment actions
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in as a patient to book an appointment.');
      return;
    }
    try {
      const res = await api.bookAppointment(
        {
          doctorId: bookingModalDoc.id,
          appointmentDate: bookDate,
          appointmentTime: bookTime,
          symptoms: bookSymptoms
        },
        token
      );
      if (res.success) {
        setBookingSuccess('Appointment confirmed with ' + bookingModalDoc.doctor_name);
        setTimeout(() => {
          setBookingSuccess('');
          setBookingModalDoc(null);
          loadUserData();
          setActiveTab('appointments');
        }, 1200);
      }
    } catch (err) {
      alert('Error booking appointment');
    }
  };

  const handleStatusChange = async (apptId, newStatus) => {
    try {
      await api.updateAppointmentStatus(apptId, newStatus, token);
      loadUserData();
    } catch (err) {
      console.error(err);
    }
  };

  // Doctor adds diagnosis
  const handleCreateRecord = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addMedicalRecord(
        {
          patientId: newRecordPatientId,
          diagnosis: newDiagnosis,
          treatmentPlan: newTreatmentPlan,
          vitalSigns: {
            blood_pressure: newBp + ' mmHg',
            heart_rate: newHr + ' bpm',
            temperature: '98.6 °F',
            weight: '68 kg'
          }
        },
        token
      );
      if (res.success) {
        setAddRecordModal(false);
        setNewDiagnosis('');
        setNewTreatmentPlan('');
        loadUserData();
      }
    } catch (err) {
      alert('Failed to save medical record');
    }
  };

  // Doctor adds prescription
  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addPrescription(
        {
          patientId: prescPatientId,
          medications: [
            {
              name: prescMedName,
              dosage: prescDosage,
              duration: prescDuration,
              frequency: 'Twice daily after meals'
            }
          ],
          instructions: prescInstructions
        },
        token
      );
      if (res.success) {
        setAddPrescriptionModal(false);
        setPrescMedName('');
        setPrescDosage('');
        setPrescDuration('');
        setPrescInstructions('');
        loadUserData();
      }
    } catch (err) {
      alert('Failed to issue prescription');
    }
  };

  // Admin adds doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addDoctor(newDocData, token);
      if (res.success) {
        setAddDoctorModal(false);
        loadPublicData();
        loadUserData();
      }
    } catch (err) {
      alert('Failed to add doctor');
    }
  };

  // If not logged in, render Modern Hospital Landing & Authentication Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">MediCare</span>
                <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Health OS</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs font-medium text-slate-500 hidden sm:inline">Demo Quick Access:</span>
              <button
                onClick={() => quickDemoLogin('patient.alice@gmail.com')}
                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium transition"
              >
                👤 Patient Demo
              </button>
              <button
                onClick={() => quickDemoLogin('doctor.carter@medicare.com')}
                className="text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 px-2.5 py-1.5 rounded-lg border border-sky-200 font-medium transition"
              >
                🩺 Doctor Demo
              </button>
              <button
                onClick={() => quickDemoLogin('admin@medicare.com')}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 px-2.5 py-1.5 rounded-lg border border-purple-200 font-medium transition"
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>
        </header>

        {/* Hero & Login Section */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hospital Overview & Features */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-sky-600" />
              Connected Healthcare & PostgreSQL Cloud Ready
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
              Modern Digital Care for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">Patients & Clinicians</span>.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl">
              Complete healthcare management ecosystem: intuitive appointment booking, automated clinical diagnoses, verified electronic prescriptions, and multi-department analytics.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Instant Appointments</h4>
                <p className="text-xs text-slate-500 mt-1">Book consultations with specialist doctors in real-time.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                  <Pill className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">e-Prescriptions</h4>
                <p className="text-xs text-slate-500 mt-1">Digital prescriptions with dosage, frequency, and instructions.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Clinical Records</h4>
                <p className="text-xs text-slate-500 mt-1">Secure diagnoses, vitals monitoring, and lab history.</p>
              </div>
            </div>

            {/* Quick Demo Credentials Reminder */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">Default Demo Password:</span> <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-sky-700">password123</code>
              </div>
              <span className="text-slate-400">Click any demo button top-right to autofill</span>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
              <div className="flex border-b border-slate-200 pb-4 mb-6">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition ${
                    authMode === 'login'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition ${
                    authMode === 'register'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. patient.alice@gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-sky-500/20 transition flex items-center justify-center gap-2"
                  >
                    {authLoading ? 'Signing in...' : 'Sign in to Healthcare Portal'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={regData.firstName}
                        onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={regData.lastName}
                        onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                    <select
                      value={regData.role}
                      onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full mt-3 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition"
                  >
                    {authLoading ? 'Creating account...' : 'Register'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged In Dashboard Layout
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">MediCare</span>
              <span className="ml-1.5 text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {user.role} Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="font-bold text-sm text-slate-800">Notifications</span>
                    <span className="text-xs text-sky-600 font-semibold">{notifications.length} Total</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No new notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <p className="font-bold text-slate-800">{n.title}</p>
                          <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-sky-200"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800">{user.fullName}</div>
                <div className="text-[11px] text-slate-500 capitalize">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex gap-6">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobileMenuOpen ? 'block fixed inset-y-16 left-0 z-40 bg-white w-64 p-4 shadow-xl' : 'hidden'
          } md:block md:w-60 shrink-0 space-y-1.5`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">Navigation</div>

          <button
            onClick={() => {
              setActiveTab('overview');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'overview' ? 'bg-sky-50 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => {
              setActiveTab('appointments');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'appointments' ? 'bg-sky-50 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Appointments
            <span className="ml-auto bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {appointments.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('doctors');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'doctors' ? 'bg-sky-50 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Find Doctors
          </button>

          <button
            onClick={() => {
              setActiveTab('records');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'records' ? 'bg-sky-50 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Medical Records
          </button>

          <button
            onClick={() => {
              setActiveTab('prescriptions');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'prescriptions' ? 'bg-sky-50 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pill className="w-4 h-4" />
            Prescriptions
          </button>

          {(user.role === 'admin' || user.role === 'doctor') && (
            <button
              onClick={() => {
                setActiveTab('patients');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
                activeTab === 'patients' ? 'bg-sky-50 text-sky-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Patients Directory
            </button>
          )}

          {user.role === 'admin' && (
            <button
              onClick={() => {
                setActiveTab('admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition ${
                activeTab === 'admin' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin Controls
            </button>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-6">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold">Welcome back, {user.fullName}!</h2>
                  <p className="text-sky-100 text-sm mt-1">
                    {user.role === 'patient' && 'Track your upcoming appointments, prescriptions, and medical health history.'}
                    {user.role === 'doctor' && 'Review your scheduled patients, diagnose conditions, and issue prescriptions.'}
                    {user.role === 'admin' && 'Manage hospital departments, doctor rosters, patient records, and performance metrics.'}
                  </p>
                </div>
                {user.role === 'patient' && (
                  <button
                    onClick={() => setActiveTab('doctors')}
                    className="px-4 py-2.5 rounded-xl bg-white text-sky-700 font-bold text-sm shadow hover:bg-sky-50 transition"
                  >
                    Book Appointment
                  </button>
                )}
                {user.role === 'doctor' && (
                  <button
                    onClick={() => setAddRecordModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-white text-teal-700 font-bold text-sm shadow hover:bg-teal-50 transition"
                  >
                    + New Diagnosis
                  </button>
                )}
              </div>

              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500">Appointments</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{appointments.length}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">Scheduled</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500">Active Prescriptions</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{prescriptions.length}</div>
                  <div className="text-[11px] text-sky-600 font-medium mt-1">Digital Rx</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500">Medical Records</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{records.length}</div>
                  <div className="text-[11px] text-purple-600 font-medium mt-1">Clinical Entries</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500">Specialist Doctors</div>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{doctors.length}</div>
                  <div className="text-[11px] text-teal-600 font-medium mt-1">Available Today</div>
                </div>
              </div>

              {/* Upcoming Appointments Table / Card */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 text-base">Upcoming Appointments</h3>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {appointments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No appointments scheduled.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3">Doctor / Patient</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Date & Time</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.slice(0, 4).map((a) => (
                          <tr key={a.id} className="hover:bg-slate-50/80">
                            <td className="p-3 font-semibold text-slate-800">
                              {user.role === 'patient' ? a.doctor_name : a.patient_name}
                            </td>
                            <td className="p-3">{a.department_name}</td>
                            <td className="p-3">
                              {a.appointment_date} at {a.appointment_time}
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                  a.status === 'confirmed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : a.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td className="p-3">
                              {user.role === 'doctor' && a.status === 'pending' && (
                                <button
                                  onClick={() => handleStatusChange(a.id, 'confirmed')}
                                  className="text-[11px] bg-sky-50 hover:bg-sky-100 text-sky-700 px-2 py-1 rounded font-bold"
                                >
                                  Confirm
                                </button>
                              )}
                              {a.status === 'confirmed' && (
                                <button
                                  onClick={() => handleStatusChange(a.id, 'completed')}
                                  className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold"
                                >
                                  Complete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: FIND & BOOK DOCTORS */}
          {activeTab === 'doctors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Find Doctors & Specialists</h2>
                  <p className="text-xs text-slate-500">Search top healthcare professionals and check appointment slots.</p>
                </div>
                {user.role === 'admin' && (
                  <button
                    onClick={() => setAddDoctorModal(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Doctor
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    placeholder="Search doctor by name, specialty, or clinic..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200'}
                          alt={doc.doctor_name}
                          className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-100"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{doc.doctor_name}</h4>
                          <p className="text-xs font-semibold text-sky-600">{doc.specialization}</p>
                          <span className="inline-block mt-0.5 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                            {doc.department_name}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-3 line-clamp-2">{doc.bio}</p>

                      <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                        <div>
                          <span className="font-semibold text-slate-700">Fee:</span> ${doc.consultation_fee}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Available:</span>{' '}
                          {doc.available_days?.join(', ') || 'Mon, Wed, Fri'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingModalDoc(doc)}
                      className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white font-bold text-xs shadow-sm transition"
                    >
                      Book Consultation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Manage Appointments</h2>
                  <p className="text-xs text-slate-500">Track consultation requests, dates, and confirmed visits.</p>
                </div>
                <button
                  onClick={() => setActiveTab('doctors')}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Book New
                </button>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-4">Doctor</th>
                        <th className="p-4">Patient</th>
                        <th className="p-4">Department</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Symptoms / Reason</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/70">
                          <td className="p-4 font-semibold text-slate-800">{a.doctor_name}</td>
                          <td className="p-4 font-medium text-slate-700">{a.patient_name}</td>
                          <td className="p-4">{a.department_name}</td>
                          <td className="p-4">
                            {a.appointment_date} <br />
                            <span className="text-slate-400">{a.appointment_time}</span>
                          </td>
                          <td className="p-4 max-w-xs truncate">{a.symptoms || 'General'}</td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                                a.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : a.status === 'pending'
                                  ? 'bg-amber-100 text-amber-700'
                                  : a.status === 'completed'
                                  ? 'bg-sky-100 text-sky-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {a.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            {a.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(a.id, 'confirmed')}
                                className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]"
                              >
                                Confirm
                              </button>
                            )}
                            {a.status !== 'completed' && a.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(a.id, 'cancelled')}
                                className="px-2 py-1 rounded bg-rose-50 text-rose-700 font-bold text-[11px]"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MEDICAL RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Digital Medical Records</h2>
                  <p className="text-xs text-slate-500">Comprehensive patient history, vital signs, and clinical diagnoses.</p>
                </div>
                {(user.role === 'doctor' || user.role === 'admin') && (
                  <button
                    onClick={() => setAddRecordModal(true)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Record & Diagnosis
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {records.length === 0 ? (
                  <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
                    No medical records recorded yet.
                  </div>
                ) : (
                  records.map((rec) => (
                    <div key={rec.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <span className="text-xs font-bold text-sky-700 uppercase tracking-wide">Diagnosis</span>
                          <h4 className="text-base font-extrabold text-slate-900">{rec.diagnosis}</h4>
                        </div>
                        <div className="text-xs text-slate-500">
                          Recorded on <span className="font-bold text-slate-700">{rec.record_date}</span> by{' '}
                          <span className="font-bold text-slate-700">{rec.doctor_name}</span>
                        </div>
                      </div>

                      {/* Vitals row */}
                      {rec.vital_signs && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="p-3 bg-slate-50 rounded-xl text-xs">
                            <span className="text-slate-400">Blood Pressure:</span>
                            <div className="font-bold text-slate-800">{rec.vital_signs.blood_pressure}</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl text-xs">
                            <span className="text-slate-400">Heart Rate:</span>
                            <div className="font-bold text-slate-800">{rec.vital_signs.heart_rate}</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl text-xs">
                            <span className="text-slate-400">Temperature:</span>
                            <div className="font-bold text-slate-800">{rec.vital_signs.temperature}</div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl text-xs">
                            <span className="text-slate-400">Weight:</span>
                            <div className="font-bold text-slate-800">{rec.vital_signs.weight}</div>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-xs font-bold text-slate-700">Treatment Plan:</span>
                        <p className="text-xs text-slate-600 mt-1">{rec.treatment_plan || 'Routine outpatient monitoring.'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Electronic Prescriptions</h2>
                  <p className="text-xs text-slate-500">Certified digital medications, instructions, and duration.</p>
                </div>
                {(user.role === 'doctor' || user.role === 'admin') && (
                  <button
                    onClick={() => setAddPrescriptionModal(true)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Issue Prescription
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {prescriptions.map((presc) => (
                  <div key={presc.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-teal-600">Prescription Rx</div>
                        <h4 className="font-bold text-slate-900 text-sm">For: {presc.patient_name}</h4>
                      </div>
                      <span className="text-xs text-slate-400">{presc.issued_date}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">Medications:</div>
                      {presc.medications?.map((m, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                          <div className="font-bold text-slate-800">{m.name}</div>
                          <div className="text-slate-500">
                            {m.dosage} • {m.frequency} • {m.duration}
                          </div>
                        </div>
                      ))}
                    </div>

                    {presc.instructions && (
                      <div className="text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                        <span className="font-bold text-amber-800">Doctor Note:</span> {presc.instructions}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      Prescribed by <span className="font-semibold text-slate-700">{presc.doctor_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PATIENTS (Admin/Doctor) */}
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Patients Directory</h2>
                <p className="text-xs text-slate-500">Registered patients, contact details, blood groups, and medical alerts.</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Patient</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Gender & DOB</th>
                      <th className="p-4">Blood Group</th>
                      <th className="p-4">Allergies</th>
                      <th className="p-4">Chronic Conditions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patients.map((pat) => (
                      <tr key={pat.id} className="hover:bg-slate-50/70">
                        <td className="p-4 font-bold text-slate-800">{pat.patient_name}</td>
                        <td className="p-4">
                          <div>{pat.email}</div>
                          <div className="text-slate-400">{pat.phone}</div>
                        </td>
                        <td className="p-4">
                          {pat.gender} <br />
                          <span className="text-slate-400">{pat.date_of_birth}</span>
                        </td>
                        <td className="p-4 font-bold text-rose-600">{pat.blood_group}</td>
                        <td className="p-4 text-slate-600">{pat.allergies || 'None'}</td>
                        <td className="p-4 text-slate-600">{pat.chronic_conditions || 'None'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ADMIN CONTROLS */}
          {activeTab === 'admin' && adminStats && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Hospital Administration & Analytics</h2>
                <p className="text-xs text-slate-500">System overview, department capacities, and operational metrics.</p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400">Total Doctors</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{adminStats.stats.totalDoctors}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400">Total Patients</span>
                  <div className="text-2xl font-extrabold text-slate-900 mt-1">{adminStats.stats.totalPatients}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400">Bed Occupancy</span>
                  <div className="text-2xl font-extrabold text-teal-600 mt-1">{adminStats.stats.occupancyRate}</div>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400">Satisfaction Rate</span>
                  <div className="text-2xl font-extrabold text-sky-600 mt-1">{adminStats.stats.patientSatisfaction}</div>
                </div>
              </div>

              {/* Department breakdown */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Department Load Distribution</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {adminStats.departmentStats?.map((dept) => (
                    <div key={dept.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="font-bold text-slate-800 text-sm">{dept.name}</div>
                      <div className="mt-2 text-xs text-slate-500 space-y-1">
                        <div>Doctors: <span className="font-semibold text-slate-700">{dept.doctorCount}</span></div>
                        <div>Appointments: <span className="font-semibold text-slate-700">{dept.appointmentCount}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Book Appointment */}
      {bookingModalDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Book Appointment</h3>
                <p className="text-xs text-slate-500">with {bookingModalDoc.doctor_name}</p>
              </div>
              <button
                onClick={() => setBookingModalDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {bookingSuccess}
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="09:30 AM">09:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Symptoms</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    value={bookSymptoms}
                    onChange={(e) => setBookSymptoms(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalDoc(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white font-bold text-xs shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add Medical Record (Doctor) */}
      {addRecordModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add Clinical Diagnosis & Record</h3>
              <button onClick={() => setAddRecordModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  required
                  value={newRecordPatientId}
                  onChange={(e) => setNewRecordPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis, Hypertension Stage 1"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={newBp}
                    onChange={(e) => setNewBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="text"
                    value={newHr}
                    onChange={(e) => setNewHr(e.target.value)}
                    placeholder="72"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Plan</label>
                <textarea
                  rows={3}
                  placeholder="Outline medications, physical care, rest periods..."
                  value={newTreatmentPlan}
                  onChange={(e) => setNewTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md mt-2"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Issue Prescription (Doctor) */}
      {addPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Issue Digital Prescription</h3>
              <button onClick={() => setAddPrescriptionModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  required
                  value={prescPatientId}
                  onChange={(e) => setPrescPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin, Paracetamol"
                  value={prescMedName}
                  onChange={(e) => setPrescMedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mg"
                    value={prescDosage}
                    onChange={(e) => setPrescDosage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 7 days"
                    value={prescDuration}
                    onChange={(e) => setPrescDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Advisory</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take 1 tablet twice daily after meals with water."
                  value={prescInstructions}
                  onChange={(e) => setPrescInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md mt-2"
              >
                Issue Prescription
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Doctor (Admin) */}
      {addDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Doctor</h3>
              <button onClick={() => setAddDoctorModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newDocData.firstName}
                    onChange={(e) => setNewDocData({ ...newDocData, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newDocData.lastName}
                    onChange={(e) => setNewDocData({ ...newDocData, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newDocData.email}
                  onChange={(e) => setNewDocData({ ...newDocData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={newDocData.specialization}
                  onChange={(e) => setNewDocData({ ...newDocData, specialization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={newDocData.departmentId}
                  onChange={(e) => setNewDocData({ ...newDocData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-md mt-2"
              >
                Add Doctor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
