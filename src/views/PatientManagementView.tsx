import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PatientRecord, PatientStatus, ViewMode } from '../types';
import { NewPatientRegistrationModal } from '../components/dental/NewPatientRegistrationModal';
import { ClayButton } from '../components/common/ClayButton';
import { Sidebar } from '../components/common/Sidebar';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  AlertCircle, 
  CreditCard, 
  Mail, 
  UserCheck 
} from 'lucide-react';

export const PatientManagementView: React.FC = () => {
  const { 
    patients = [], 
    setSelectedPatientForDetail, 
    setActiveView, 
    addPatient,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientStatus | 'With Balance'>('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Filter patients by query and selected filter chip
  const filteredPatients = patients.filter((patient) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      patient.name.toLowerCase().includes(q) ||
      patient.id.toLowerCase().includes(q) ||
      patient.phone.includes(q) ||
      patient.email?.toLowerCase().includes(q) ||
      patient.assignedDoctorName?.toLowerCase().includes(q) ||
      patient.currentTreatment?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'All') return true;
    if (statusFilter === 'With Balance') return (patient.outstandingBalance || 0) > 0;
    return patient.status === statusFilter;
  });

  const handleOpenPatientEMR = (patient: PatientRecord, targetView: ViewMode = 'patient-detail') => {
    setSelectedPatientForDetail(patient);
    setActiveView(targetView);
    addToast('Patient Record Opened', `Loaded clinical EMR for ${patient.name}.`, 'info');
  };

  const statusOptions: Array<'All' | PatientStatus | 'With Balance'> = [
    'All',
    'Active Treatment',
    'New Patient',
    'Follow-up',
    'Treatment Completed',
    'With Balance'
  ];

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'Active Treatment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
            Active Care
          </span>
        );
      case 'New Patient':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            New Patient
          </span>
        );
      case 'Follow-up':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Routine Checkup
          </span>
        );
      case 'Treatment Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const totalOutstandingBalance = patients.reduce((acc, p) => acc + (p.outstandingBalance || 0), 0);

  return (
    <div className="w-full max-w-full overflow-x-hidden mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 w-full max-w-full space-y-4 sm:space-y-6 animate-in fade-in">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-4 sm:p-6 md:p-8 text-white shadow-lg border border-teal-800/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full border border-teal-400/30 backdrop-blur-xs">
                  Clinical EMR Master Directory
                </span>
                <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5 bg-slate-800/60 px-2.5 py-0.5 rounded-full border border-slate-700/50">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  {patients.length} Registered Patients
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                Patients Directory & Medical Records
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Centralized patient roster. Click any patient row to instantly inspect their clinical odontogram, treatment plan, diagnosis history, and account balances.
              </p>
            </div>

            <button
              onClick={() => setShowRegisterModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-teal-950/40 hover:shadow-teal-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register New Patient</span>
            </button>
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Top Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="clinic-glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all group bg-white">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
              Total Roster
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-1.5 sm:gap-2">
              <Users className="w-5 h-5 text-teal-600 shrink-0" />
              <span>{patients.length}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 block mt-0.5">Active patient database</span>
          </div>

          <div className="clinic-glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-teal-200/80 shadow-xs hover:shadow-md transition-all group bg-teal-50/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 block mb-0.5">
              Active Care
            </span>
            <div className="text-xl sm:text-2xl font-black text-teal-800 flex items-center gap-1.5 sm:gap-2">
              <Activity className="w-5 h-5 text-teal-600 shrink-0" />
              <span>{patients.filter((p) => p.status === 'Active Treatment').length}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-teal-700 block mt-0.5">Ongoing procedures</span>
          </div>

          <div className="clinic-glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-sky-200/80 shadow-xs hover:shadow-md transition-all group bg-sky-50/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 block mb-0.5">
              Checkups
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-800 flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-5 h-5 text-sky-600 shrink-0" />
              <span>{patients.filter((p) => p.status === 'Follow-up').length}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-sky-700 block mt-0.5">Routine follow-ups</span>
          </div>

          <div className="clinic-glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-rose-200/80 shadow-xs hover:shadow-md transition-all group bg-rose-50/20">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block mb-0.5">
              Ledger Due
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-700 flex items-center gap-1.5 sm:gap-2 font-mono truncate">
              <CreditCard className="w-5 h-5 text-rose-600 shrink-0" />
              <span>₹{totalOutstandingBalance.toLocaleString()}</span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-rose-600 block mt-0.5 truncate">Across open invoices</span>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name, ID, Phone, Doctor, Condition..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {statusOptions.map((st) => {
              const label =
                st === 'All'
                  ? 'All Patients'
                  : st === 'With Balance'
                  ? '💳 Unpaid Balance'
                  : st === 'Follow-up'
                  ? 'Routine Checkup'
                  : st;

              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    statusFilter === st
                      ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Master Table Model */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Patients Roster ({filteredPatients.length} of {patients.length})
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-teal-800 font-semibold bg-teal-50 px-2.5 py-1 rounded-xl sm:rounded-full border border-teal-200/60 leading-tight">
              💡 Select any patient row to inspect their full clinical chart and medical records.
            </span>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No patients found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No patients match the current search query or filter selection.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer border border-teal-200"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Native App Cards (<768px) - User-Friendly Touch Design */}
              <div className="md:hidden p-3 space-y-3 bg-slate-50/50">
                {filteredPatients.map((patient) => {
                  const hasAllergy = patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0;
                  const balance = patient.outstandingBalance || 0;
                  const rawPhone = (patient.phone || '').replace(/\D/g, '');
                  const intlPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

                  return (
                    <div
                      key={`mob-${patient.id}`}
                      onClick={() => handleOpenPatientEMR(patient, 'patient-detail')}
                      className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-md active:scale-99 transition-all cursor-pointer space-y-3"
                    >
                      {/* Top Row: Avatar, Name, OP Badge, Status */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-base text-slate-900 leading-tight truncate">
                              {patient.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="font-mono font-extrabold text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200/60">
                                {patient.opNumber || patient.id}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {patient.age}y • {patient.gender}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {getStatusBadge(patient.status)}
                        </div>
                      </div>

                      {/* Medical History & Allergies Flag */}
                      {hasAllergy && (
                        <div className="inline-flex items-center gap-1.5 text-[11px] text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Allergy Alert: {patient.medicalHistory.allergies.join(', ')}</span>
                        </div>
                      )}

                      {/* Info Strip: Assigned Doctor & Outstanding Balance */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Doctor</span>
                          <span className="font-bold text-slate-800 truncate block text-[11.5px] mt-0.5">
                            {patient.assignedDoctorName || 'Dr. DOCTOR TEST'}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Ledger Balance</span>
                          {balance > 0 ? (
                            <span className="font-mono font-black text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-lg text-xs inline-block mt-0.5">
                              ₹{balance.toLocaleString()} Due
                            </span>
                          ) : (
                            <span className="font-extrabold text-emerald-700 text-xs inline-flex items-center gap-1 mt-0.5">
                              <span>✓</span> Settled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Bar: Direct 1-Tap Call, WhatsApp, and Open EMR */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {patient.phone && (
                          <>
                            <a
                              href={`tel:${patient.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 py-2 px-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-teal-200 active:scale-95 transition-all shadow-2xs"
                              title="Direct Phone Call"
                            >
                              <Phone className="w-3.5 h-3.5 text-teal-700" />
                              <span>Call</span>
                            </a>

                            <a
                              href={`https://wa.me/${intlPhone}?text=Hello%20${encodeURIComponent(patient.name)},%20this%20is%20Shriya%20Multispeciality%20Dental%20Clinic.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-emerald-200 active:scale-95 transition-all shadow-2xs"
                              title="WhatsApp Patient"
                            >
                              <span>💬</span>
                              <span>Chat</span>
                            </a>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenPatientEMR(patient, 'patient-detail')}
                          className="flex-[1.5] py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm"
                        >
                          <span>Open EMR</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Full Master Table (>=768px) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">Patient Profile</th>
                      <th className="py-4 px-3">Patient & OP ID</th>
                      <th className="py-4 px-3">Contact</th>
                      <th className="py-4 px-3">Clinical Status</th>
                      <th className="py-4 px-3">Assigned Doctor</th>
                      <th className="py-4 px-3">Account Balance</th>
                      <th className="py-4 px-3">Visit History</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredPatients.map((patient) => {
                      const hasAllergy = patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0;
                      const balance = patient.outstandingBalance || 0;

                      return (
                        <tr
                          key={patient.id}
                          onClick={() => handleOpenPatientEMR(patient, 'patient-detail')}
                          className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                        >
                          {/* 1. Patient Profile */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {patient.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-extrabold text-xs text-slate-900 group-hover:text-teal-900 transition-colors block">
                                  {patient.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                  <span>{patient.age}y • {patient.gender}</span>
                                  {hasAllergy && (
                                    <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      {patient.medicalHistory.allergies[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Patient ID */}
                          <td className="py-4 px-3">
                            <div className="font-mono font-bold text-teal-800 text-[11px]">
                              {patient.id}
                            </div>
                            {patient.opNumber && (
                              <div className="font-mono text-[10px] text-slate-400">
                                {patient.opNumber}
                              </div>
                            )}
                          </td>

                          {/* 3. Contact */}
                          <td className="py-4 px-3 text-slate-600 text-[11px]">
                            <div className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{patient.phone}</span>
                            </div>
                            {patient.email && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                                <Mail className="w-2.5 h-2.5" />
                                <span>{patient.email}</span>
                              </div>
                            )}
                          </td>

                          {/* 4. Clinical Status */}
                          <td className="py-4 px-3">
                            {getStatusBadge(patient.status)}
                          </td>

                          {/* 5. Assigned Doctor */}
                          <td className="py-4 px-3 font-semibold text-slate-700 text-[11px]">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 text-slate-800 inline-block">
                              {patient.assignedDoctorName || 'Dr. DOCTOR TEST'}
                            </span>
                          </td>

                          {/* 6. Balance */}
                          <td className="py-4 px-3">
                            {balance > 0 ? (
                              <span className="font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-[11px]">
                                ₹{balance.toLocaleString()}
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[10px]">
                                Settled ✓
                              </span>
                            )}
                          </td>

                          {/* 7. Visit History / First Visit */}
                          <td className="py-4 px-3 text-slate-600 font-medium text-[11px]">
                            {(!patient.visits || patient.visits.length === 0 || patient.totalVisits === 0) ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                                  ✨ 1st Visit Pending
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Reg: {patient.firstVisitDate || 'Today'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-800">{patient.lastVisit || patient.firstVisitDate}</span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {patient.totalVisits} visit{patient.totalVisits > 1 ? 's' : ''} • 1st: {patient.firstVisitDate || 'N/A'}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 8. Action */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleOpenPatientEMR(patient, 'patient-detail')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 text-white font-extrabold text-xs hover:bg-teal-800 transition-all cursor-pointer shadow-xs hover:shadow"
                              >
                                <span>Open EMR</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* New Patient Registration Modal */}
        <NewPatientRegistrationModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegisterPatient={(newPat) => {
            handleOpenPatientEMR(newPat, 'patient-detail');
          }}
          existingPatientCount={patients.length}
        />
      </main>
    </div>
  );
};

