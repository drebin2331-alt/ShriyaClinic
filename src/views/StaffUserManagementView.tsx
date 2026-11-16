import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StaffUser, UserRole } from '../types';
import { Sidebar } from '../components/common/Sidebar';
import { ClayButton } from '../components/common/ClayButton';
import { ClayInput } from '../components/common/ClayInput';
import { ClaySelect } from '../components/common/ClaySelect';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit3,
  Building2,
  Phone,
  Mail,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Lock,
  HeartPulse,
  Camera,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { compressImageFile } from '../utils/safeStorage';

export const StaffUserManagementView: React.FC = () => {
  const { 
    staffMembers, 
    addStaffMember, 
    updateStaffMember, 
    deleteStaffMember, 
    addToast,
    addPatient,
    patients
  } = useApp();
  const { currentUser, createAccountByAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'doctor' | 'receptionist' | 'customer' | 'admin'>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<StaffUser | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('doctor');
  const [formPhone, setFormPhone] = useState('');
  const [formSpecialization, setFormSpecialization] = useState('General Dentistry');
  const [formQualification, setFormQualification] = useState('BDS');
  const [formRoomNumber, setFormRoomNumber] = useState('Cabin 101');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formAvatar, setFormAvatar] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Invalid File', 'Please select a valid image file (PNG, JPG, WebP).', 'danger');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('File Too Large', 'Please choose an image under 10MB.', 'danger');
      return;
    }

    try {
      // Auto-compress and scale image down to max 256x256 (~20KB) to prevent QuotaExceededError
      const optimizedDataUrl = await compressImageFile(file, 256, 0.75);
      setFormAvatar(optimizedDataUrl);
      addToast('Photo Uploaded', 'Doctor profile photo optimized and loaded.', 'success');
    } catch {
      addToast('Upload Error', 'Could not process the selected image.', 'danger');
    }
  };

  // Customer / Patient specific form fields
  const [formPatientAge, setFormPatientAge] = useState<number>(32);
  const [formPatientGender, setFormPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formPatientAddress, setFormPatientAddress] = useState('');
  const [formPatientComplaint, setFormPatientComplaint] = useState('Routine Check-up & Cleaning');
  const [formPatientOpNumber, setFormPatientOpNumber] = useState('');

  // Password visibility map (staffId -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Role Counts
  const doctorCount = staffMembers.filter((s) => s.role === 'doctor').length;
  const receptionistCount = staffMembers.filter((s) => s.role === 'receptionist' || s.role === 'billing').length;
  const customerCount = staffMembers.filter((s) => s.role === 'customer').length;
  const adminCount = staffMembers.filter((s) => s.role === 'admin').length;

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        (staff.phone && staff.phone.includes(q)) ||
        (staff.specialization && staff.specialization.toLowerCase().includes(q)) ||
        (staff.roomNumber && staff.roomNumber.toLowerCase().includes(q));

      const matchesRole =
        roleFilter === 'ALL' ||
        staff.role === roleFilter ||
        (roleFilter === 'receptionist' && staff.role === 'billing');

      return matchesSearch && matchesRole;
    });
  }, [staffMembers, searchTerm, roleFilter]);

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCredentials = (staff: StaffUser) => {
    const roleTitle = 
      staff.role === 'doctor' 
        ? 'DOCTOR / DENTAL SURGEON' 
        : staff.role === 'receptionist' || staff.role === 'billing' 
          ? 'FRONT DESK & RECEPTION' 
          : staff.role === 'customer'
            ? 'PATIENT / CUSTOMER PORTAL'
            : 'CLINIC ADMINISTRATOR';

    const text = 
      `🏥 Shriya Multispeciality Dental Clinic - Official Login Credentials\n` +
      `==================================================\n` +
      `Account Role: ${roleTitle}\n` +
      `Full Name: ${staff.name}\n` +
      `Username / Email: ${staff.email}\n` +
      `Password: ${staff.password || 'Password@123'}\n` +
      (staff.role === 'doctor' ? `Cabin Number: ${staff.roomNumber || 'Cabin 101'}\n` : '') +
      (staff.role === 'customer' ? `Patient OP ID: ${staff.roomNumber || 'Assigned OP'}\n` : '') +
      `Portal Address: ${window.location.origin}\n` +
      `==================================================\n` +
      `Authorized & Provisioned by Clinic Administrator.`;

    navigator.clipboard.writeText(text);
    setCopiedId(staff.id);
    addToast('Credentials Copied', `Copied username and password for ${staff.name}`, 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenAddModal = (presetRole?: UserRole) => {
    const roleToSet = presetRole || 'doctor';
    setEditingStaff(null);
    setFormRole(roleToSet);
    setFormName('');
    setFormEmail('');
    setFormPassword(`Pass@${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPhone('');
    setFormStatus('Active');
    setFormAvatar('');

    if (roleToSet === 'doctor') {
      setFormSpecialization('Orthodontics & Aligners');
      setFormQualification('BDS, MDS');
      setFormRoomNumber(`Cabin ${101 + doctorCount}`);
    } else if (roleToSet === 'receptionist') {
      setFormRoomNumber(`Front Desk Station ${receptionistCount + 1}`);
    } else if (roleToSet === 'customer') {
      const patId = `PAT-2026-${String(100 + patients.length + 1).padStart(6, '0')}`;
      setFormPatientOpNumber(patId);
      setFormRoomNumber(patId);
      setFormPatientAge(32);
      setFormPatientGender('Male');
      setFormPatientAddress('City Center');
      setFormPatientComplaint('Dental Check-up & Consultation');
    } else {
      setFormRoomNumber('Admin Suite');
    }

    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPassword(staff.password || 'Password@123');
    setFormRole(staff.role);
    setFormPhone(staff.phone || '');
    setFormSpecialization(staff.specialization || 'General Dentistry');
    setFormQualification(staff.qualification || 'BDS');
    setFormRoomNumber(staff.roomNumber || 'Cabin 101');
    setFormStatus(staff.status || 'Active');
    setFormAvatar(staff.avatar && !staff.avatar.includes('photo-1559839734') ? staff.avatar : '');
    setIsAddModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(result);
    addToast('Password Generated', 'Auto-generated strong password', 'info');
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      addToast('Validation Error', 'Full Name, Username/Email, and Password are required.', 'danger');
      return;
    }

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPassword = formPassword.trim();
    const cleanName = formName.trim();

    if (editingStaff) {
      updateStaffMember(editingStaff.id, {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: formRole,
        phone: formPhone.trim(),
        specialization: formRole === 'doctor' ? formSpecialization : undefined,
        qualification: formRole === 'doctor' ? formQualification : undefined,
        roomNumber: formRole === 'customer' ? formPatientOpNumber || formRoomNumber : formRoomNumber.trim(),
        status: formStatus,
        avatar: formAvatar.trim() || undefined
      });
    } else {
      // 1. Add staff/account to roster & Supabase profiles
      const createdStaff = addStaffMember({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: formRole,
        phone: formPhone.trim(),
        specialization: formRole === 'doctor' ? formSpecialization : undefined,
        qualification: formRole === 'doctor' ? formQualification : undefined,
        roomNumber: formRole === 'customer' ? formPatientOpNumber || formRoomNumber : formRoomNumber.trim(),
        status: formStatus,
        avatar: formAvatar.trim() || undefined
      });

      // 2. If creating a Customer / Patient account, also create the patient clinical master record
      if (formRole === 'customer') {
        const patId = formPatientOpNumber || `PAT-2026-${String(100 + patients.length + 1).padStart(6, '0')}`;
        await addPatient({
          id: patId,
          opNumber: `OP-${patId.replace('PAT-', '')}`,
          name: cleanName,
          phone: formPhone.trim() || '+91 98765 00000',
          email: cleanEmail,
          age: Number(formPatientAge) || 30,
          gender: formPatientGender,
          address: formPatientAddress.trim() || 'Local Area',
          currentTreatment: formPatientComplaint.trim() || 'General Consultation',
          status: 'New Patient',
          firstVisitDate: new Date().toISOString().split('T')[0],
          lastVisit: new Date().toISOString().split('T')[0],
          totalVisits: 1,
          outstandingBalance: 0,
          medicalHistory: { allergies: [], conditions: [] },
          dentalHistory: { currentComplaint: formPatientComplaint.trim() || 'General Consultation' },
          dentalChart: {},
          clinicalNotes: [],
          treatmentPlans: [],
          allergies: [],
          visits: []
        });

        addToast('Patient Account Ready', `Patient Portal credentials issued for ${cleanName}`, 'success');
      }

      // 3. Sync to Supabase profiles
      await createAccountByAdmin({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: formRole,
        phone: formPhone.trim(),
        specialization: formRole === 'doctor' ? formSpecialization : undefined,
        qualification: formRole === 'doctor' ? formQualification : undefined,
        roomNumber: formRoomNumber.trim(),
        patientId: formRole === 'customer' ? formPatientOpNumber : undefined
      });
    }

    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingStaff) return;
    if (deletingStaff.email === currentUser.email) {
      addToast('Action Prohibited', 'You cannot delete your own logged-in administrator account.', 'danger');
      setDeletingStaff(null);
      return;
    }

    deleteStaffMember(deletingStaff.id);
    setDeletingStaff(null);
  };

  return (
    <div className="w-full max-w-[1650px] mx-auto px-4 lg:px-6 py-6 flex gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 space-y-6 animate-in fade-in">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-teal-800/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30 backdrop-blur-xs">
                  Admin Master Control
                </span>
                <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {staffMembers.length} Active Accounts
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                User Accounts & Credentials Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Admin-exclusive account provisioning. Public self-registration is disabled. Create and issue login credentials for <strong>Doctors</strong>, <strong>Front Desk Receptionists</strong>, and <strong>Patients (Customers)</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleOpenAddModal('doctor')}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Create Account</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Doctors */}
          <div 
            onClick={() => setRoleFilter('doctor')}
            className="clinic-glass rounded-2xl p-5 border border-sky-200/80 shadow-xs hover:shadow-md transition-all group bg-gradient-to-br from-white via-sky-50/30 to-sky-100/30 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                  Clinical Doctors
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                  <span>{doctorCount}</span>
                  <span className="text-xs font-bold text-sky-600">Surgeons</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1">Dentists & Specialists</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl shadow-xs border border-sky-200 group-hover:scale-105 transition-transform">
                🩺
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-sky-100 flex items-center justify-between text-[11px] text-sky-800 font-semibold">
              <span>Full EMR & OPD Queue</span>
              <span className="bg-sky-100 px-2 py-0.5 rounded-full text-[10px] font-black">Active</span>
            </div>
          </div>

          {/* 2. Reception */}
          <div 
            onClick={() => setRoleFilter('receptionist')}
            className="clinic-glass rounded-2xl p-5 border border-teal-200/80 shadow-xs hover:shadow-md transition-all group bg-gradient-to-br from-white via-teal-50/30 to-teal-100/30 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                  Front Desk & Reception
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                  <span>{receptionistCount}</span>
                  <span className="text-xs font-bold text-teal-600">Officers</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1">Tokens, Check-In & Billing</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-xl shadow-xs border border-teal-200 group-hover:scale-105 transition-transform">
                👩‍💼
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-teal-100 flex items-center justify-between text-[11px] text-teal-800 font-semibold">
              <span>Desk Check-In & Bills</span>
              <span className="bg-teal-100 px-2 py-0.5 rounded-full text-[10px] font-black">Active</span>
            </div>
          </div>

          {/* 3. Customers / Patients */}
          <div 
            onClick={() => setRoleFilter('customer')}
            className="clinic-glass rounded-2xl p-5 border border-emerald-200/80 shadow-xs hover:shadow-md transition-all group bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/30 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Patients / Customers
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                  <span>{customerCount}</span>
                  <span className="text-xs font-bold text-emerald-600">Portals</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1">EMR Linked User Accounts</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-xs border border-emerald-200 group-hover:scale-105 transition-transform">
                👤
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
              <span>Patient Portal Access</span>
              <span className="bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-black">Online</span>
            </div>
          </div>

          {/* 4. Administrators */}
          <div 
            onClick={() => setRoleFilter('admin')}
            className="clinic-glass rounded-2xl p-5 border border-purple-200/80 shadow-xs hover:shadow-md transition-all group bg-gradient-to-br from-white via-purple-50/30 to-purple-100/30 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-800">
                  Clinic Administrators
                </span>
                <div className="text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                  <span>{adminCount}</span>
                  <span className="text-xs font-bold text-purple-600">Admins</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1">Full Governance & Controls</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl shadow-xs border border-purple-200 group-hover:scale-105 transition-transform">
                🛡️
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px] text-purple-800 font-semibold">
              <span>Root Governance</span>
              <span className="bg-purple-100 px-2 py-0.5 rounded-full text-[10px] font-black">Super Admin</span>
            </div>
          </div>
        </div>

        {/* Search and Role Filter Chips */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search accounts by name, username, email, phone, cabin, or patient ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden text-slate-800 placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: `All Accounts (${staffMembers.length})` },
              { id: 'doctor', label: `Doctors (${doctorCount})` },
              { id: 'receptionist', label: `Front Desk (${receptionistCount})` },
              { id: 'customer', label: `Patients / Customers (${customerCount})` },
              { id: 'admin', label: `Admins (${adminCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  roleFilter === tab.id
                    ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Table Roster */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Issued Account Credentials Roster
              </span>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                {filteredStaff.length} shown
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-800 font-semibold bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Click "Copy" on any account to immediately copy login details.</span>
            </div>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No matching accounts found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try searching for a different name, role, or phone number.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer border border-teal-200"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-5">User / Member</th>
                    <th className="py-4 px-3">Role & Access</th>
                    <th className="py-4 px-3">Username / Email</th>
                    <th className="py-4 px-3">Password</th>
                    <th className="py-4 px-3">Cabin / Station / ID</th>
                    <th className="py-4 px-3">Contact</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStaff.map((staff) => {
                    const isDoctor = staff.role === 'doctor';
                    const isReception = staff.role === 'receptionist' || staff.role === 'billing';
                    const isCustomer = staff.role === 'customer';
                    const isPwVisible = !!visiblePasswords[staff.id];
                    const isCopied = copiedId === staff.id;
                    const isActive = staff.status !== 'Inactive';

                    return (
                      <tr key={staff.id} className="hover:bg-teal-50/30 transition-colors group">
                        {/* 1. Member Profile */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {staff.avatar && (staff.avatar.startsWith('data:') || staff.avatar.startsWith('http')) && !staff.avatar.includes('photo-1559839734') ? (
                              <img
                                src={staff.avatar}
                                alt={staff.name}
                                className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-xs border border-slate-200"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-2xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                                  isDoctor
                                    ? 'bg-gradient-to-tr from-sky-600 to-teal-500'
                                    : isReception
                                      ? 'bg-gradient-to-tr from-teal-700 to-emerald-500'
                                      : isCustomer
                                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                                        : 'bg-gradient-to-tr from-purple-700 to-indigo-600'
                                }`}
                              >
                                {staff.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-extrabold text-xs text-slate-900 block group-hover:text-teal-900 transition-colors">
                                {staff.name}
                              </span>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span>
                                  {staff.qualification || 
                                    (isDoctor ? 'Dental Specialist' : isCustomer ? 'Registered Patient' : 'Clinic Staff')}
                                </span>
                                {staff.specialization && (
                                  <>
                                    <span>•</span>
                                    <span className="text-teal-700 font-semibold">{staff.specialization}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role */}
                        <td className="py-4 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border ${
                              isDoctor
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : isReception
                                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                                  : isCustomer
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            {isDoctor ? '🩺' : isReception ? '👩‍💼' : isCustomer ? '👤' : '🛡️'}
                            {isDoctor
                              ? 'DOCTOR'
                              : isReception
                                ? 'FRONT DESK'
                                : isCustomer
                                  ? 'CUSTOMER (PATIENT)'
                                  : 'ADMIN'}
                          </span>
                        </td>

                        {/* 3. Username / Email */}
                        <td className="py-4 px-3 font-mono text-[11px] text-slate-800">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{staff.email}</span>
                          </div>
                        </td>

                        {/* 4. Password with Eye & Copy */}
                        <td className="py-4 px-3 font-mono text-xs">
                          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/90 w-fit">
                            <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-800">
                              {isPwVisible ? staff.password || 'Password@123' : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(staff.id)}
                              className="text-slate-400 hover:text-slate-700 ml-1 cursor-pointer transition-colors"
                              title={isPwVisible ? 'Hide password' : 'Show password'}
                            >
                              {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>

                        {/* 5. Cabin / Desk / Patient ID */}
                        <td className="py-4 px-3 font-semibold text-slate-700 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-800 font-mono text-[11px]">
                              {staff.roomNumber || (isDoctor ? 'Cabin 101' : isCustomer ? 'PAT-001' : 'Desk 1')}
                            </span>
                          </div>
                        </td>

                        {/* 6. Phone */}
                        <td className="py-4 px-3 text-slate-600 font-mono text-[11px]">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{staff.phone || '+91 98765 00000'}</span>
                          </div>
                        </td>

                        {/* 7. Status */}
                        <td className="py-4 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            ></span>
                            {isActive ? 'Active' : 'On Leave'}
                          </span>
                        </td>

                        {/* 8. Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyCredentials(staff)}
                              className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                                isCopied
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                              title="Copy full credentials slip"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-white" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(staff)}
                              className="p-1.5 rounded-xl border border-slate-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-colors cursor-pointer"
                              title="Edit user details"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setDeletingStaff(staff)}
                              className="p-1.5 rounded-xl border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                              title="Delete user account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ADD / EDIT USER ACCOUNT MODAL */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="clay-card w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {editingStaff ? 'Edit User Credentials' : 'Create New User Account'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Admin-only account provisioning for Doctors, Receptionists, and Patients
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select User Account Role *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { role: 'doctor', label: 'Doctor (Dentist)', icon: '🩺' },
                      { role: 'receptionist', label: 'Front Desk', icon: '👩‍💼' },
                      { role: 'customer', label: 'Customer (Patient)', icon: '👤' },
                      { role: 'admin', label: 'Clinic Admin', icon: '🛡️' }
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => {
                          setFormRole(item.role as UserRole);
                          if (item.role === 'customer' && !formPatientOpNumber) {
                            const patId = `PAT-2026-${String(100 + patients.length + 1).padStart(6, '0')}`;
                            setFormPatientOpNumber(patId);
                            setFormRoomNumber(patId);
                          }
                        }}
                        className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                          formRole === item.role
                            ? 'border-teal-600 bg-teal-50 text-teal-900 ring-1 ring-teal-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <ClayInput
                    placeholder={
                      formRole === 'doctor'
                        ? 'e.g. Dr. Sneha Roy'
                        : formRole === 'receptionist'
                          ? 'e.g. Pooja Nair'
                          : 'e.g. Rahul Kumar'
                    }
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                {/* Email / Username & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Login Username / Email *
                    </label>
                    <ClayInput
                      type="text"
                      placeholder={
                        formRole === 'doctor'
                          ? 'sneha.doc@clinic.com'
                          : formRole === 'receptionist'
                            ? 'reception@clinic.com'
                            : 'patient@clinic.com'
                      }
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">Password *</label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[10px] font-bold text-teal-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Auto-Generate</span>
                      </button>
                    </div>
                    <ClayInput
                      type="text"
                      placeholder="Enter login password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Phone & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <ClayInput
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Account Status</label>
                    <ClaySelect
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      options={[
                        { value: 'Active', label: 'Active Account' },
                        { value: 'Inactive', label: 'Inactive / Suspended' }
                      ]}
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {formRole === 'doctor' && (
                  <div className="space-y-3 p-3 bg-sky-50/60 rounded-2xl border border-sky-200">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 block">
                      Doctor Clinical Assignment
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Specialization</label>
                        <ClayInput
                          placeholder="e.g. Orthodontics, Implants"
                          value={formSpecialization}
                          onChange={(e) => setFormSpecialization(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Qualification</label>
                        <ClayInput
                          placeholder="e.g. BDS, MDS"
                          value={formQualification}
                          onChange={(e) => setFormQualification(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Cabin Room</label>
                        <ClayInput
                          placeholder="e.g. Cabin 104"
                          value={formRoomNumber}
                          onChange={(e) => setFormRoomNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Doctor Profile Picture Upload & Preview */}
                    <div className="pt-2 border-t border-sky-200">
                      <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                        <span>Doctor Profile Photo</span>
                        <span className="text-[10px] text-sky-700 font-semibold">Displayed on website & booking page</span>
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-sky-200">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-sky-300 flex items-center justify-center shrink-0 shadow-2xs relative">
                          {formAvatar ? (
                            <img src={formAvatar} alt="Doctor Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400">
                              <Camera className="w-5 h-5 text-sky-600 mb-0.5" />
                              <span className="text-[9px] font-bold text-sky-800">No Photo</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-2 w-full">
                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp,image/jpg"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                            {formAvatar && (
                              <button
                                type="button"
                                onClick={() => setFormAvatar('')}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer transition-colors"
                              >
                                Remove Photo
                              </button>
                            )}
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Or paste direct image URL (https://...)"
                              value={formAvatar.startsWith('data:') ? '' : formAvatar}
                              onChange={(e) => setFormAvatar(e.target.value)}
                              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {formRole === 'receptionist' && (
                  <div className="p-3 bg-teal-50/60 rounded-2xl border border-teal-200">
                    <label className="text-xs font-bold text-teal-950 block mb-1">Front Desk Station / Counter</label>
                    <ClayInput
                      placeholder="e.g. Front Desk Station 1"
                      value={formRoomNumber}
                      onChange={(e) => setFormRoomNumber(e.target.value)}
                    />
                  </div>
                )}

                {formRole === 'customer' && (
                  <div className="space-y-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                        Patient / Customer EMR Profile
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                        OP ID: {formPatientOpNumber || 'Auto-generated'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Patient Age</label>
                        <ClayInput
                          type="number"
                          placeholder="e.g. 32"
                          value={String(formPatientAge)}
                          onChange={(e) => setFormPatientAge(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Gender</label>
                        <ClaySelect
                          value={formPatientGender}
                          onChange={(e) => setFormPatientGender(e.target.value as any)}
                          options={[
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' }
                          ]}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Chief Dental Complaint / Reason</label>
                      <ClayInput
                        placeholder="e.g. Toothache, Scaling, Aligners Inquiry"
                        value={formPatientComplaint}
                        onChange={(e) => setFormPatientComplaint(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <ClayButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </ClayButton>
                  <ClayButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    icon={<Check className="w-4 h-4" />}
                  >
                    {editingStaff ? 'Save Changes' : 'Issue User Credentials'}
                  </ClayButton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="clay-card w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>

              <div className="text-center">
                <h3 className="text-base font-black text-slate-900">Delete User Account</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <strong>{deletingStaff.name}</strong> ({deletingStaff.role})? Their login credentials will be revoked immediately.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <ClayButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setDeletingStaff(null)}
                >
                  Cancel
                </ClayButton>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-colors cursor-pointer shadow-md"
                >
                  Yes, Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
