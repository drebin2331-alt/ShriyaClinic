import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { ClayInput } from '../components/common/ClayInput';
import { ClaySelect } from '../components/common/ClaySelect';
import { StatusBadge } from '../components/common/StatusBadge';
import { Sidebar } from '../components/common/Sidebar';
import { Appointment, PatientRecord, PatientEnquiry } from '../types';
import { createFullDefaultDentalChart } from '../utils/dentalChartHelper';
import { 
  NewPatientRegistrationModal, 
  InitialPatientData 
} from '../components/dental/NewPatientRegistrationModal';
import { ReceptionBookingModal } from '../components/dental/ReceptionBookingModal';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  PhoneCall, 
  User, 
  Plus,
  Filter,
  UserCheck,
  UserPlus,
  FileText,
  Stethoscope,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Volume2,
  Inbox,
  Check,
  Archive,
  RefreshCw,
  Trash2
} from 'lucide-react';

export const AppointmentManagement: React.FC = () => {
  const { 
    appointments, 
    doctors, 
    patients = [],
    enquiries = [],
    updateEnquiryStatus,
    deleteEnquiry,
    clearAllEnquiries,
    sendAppointmentWhatsApp,
    updateAppointmentStatus, 
    setActiveView, 
    setSelectedPatientForDetail,
    addPatient,
    checkInPatient,
    callToken,
    addToast 
  } = useApp();

  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'calendar' | 'enquiries'>('daily');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [doctorFilter, setDoctorFilter] = useState('ALL');
  const [enquiryFilter, setEnquiryFilter] = useState<'ALL' | 'New' | 'Contacted' | 'Appointment Booked' | 'Registered'>('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Booking & Registration modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingInitialData, setBookingInitialData] = useState<{
    patientName?: string;
    phone?: string;
    email?: string;
    doctorId?: string;
    reason?: string;
    date?: string;
    timeSlot?: string;
    enquiryId?: string;
  } | null>(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerInitialData, setRegisterInitialData] = useState<InitialPatientData | null>(null);

  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;

  // Helper to normalize phone numbers for matching (last 10 digits)
  const handleCallPatient = async (apt: Appointment) => {
    try {
      if (apt.tokenId) {
        await callToken(apt.tokenId);
      } else {
        const res = await checkInPatient({
          appointmentId: apt.id,
          patientId: apt.patientId || (patients.find(p => p.phone === apt.patientPhone)?.id || apt.id),
          doctorId: apt.doctorId,
          priority: 'Normal',
          reasonForVisit: apt.reasonForVisit
        });
        if (res?.token?.tokenNumber) {
          await callToken(res.token.tokenNumber);
        }
      }
      addToast(
        `Calling Patient 🔔`,
        `Calling ${apt.patientName}${apt.tokenId ? ` (Token ${apt.tokenId})` : ''} to Dr. ${apt.doctorName || 'Doctor'}'s cabin.`,
        'info'
      );
    } catch (err: any) {
      addToast('Calling Patient 🔔', `Announcing ${apt.patientName} to proceed to consultation room.`, 'info');
    }
  };
  const normalizePhone = (phoneStr?: string): string => {
    if (!phoneStr) return '';
    return phoneStr.replace(/\D/g, '').slice(-10);
  };

  // Find existing patient record matching the appointment
  const getExistingPatientForAppointment = (apt: Appointment): PatientRecord | undefined => {
    const aptPhone = normalizePhone(apt.patientPhone);
    const aptName = apt.patientName.trim().toLowerCase();

    return patients.find((p) => {
      const pPhone = normalizePhone(p.phone);
      const pName = p.name.trim().toLowerCase();

      // Check phone match first if phone exists
      if (aptPhone && pPhone && aptPhone === pPhone) return true;
      // Fallback to name match
      if (aptName && pName && aptName === pName) return true;

      return false;
    });
  };

  // Quick 1-click add patient to EMR from appointment details
  const handleQuickAddToEMR = (apt: Appointment) => {
    const nextNum = patients.length + 105;
    const generatedId = `PAT-2026-${String(nextNum).padStart(6, '0')}`;

    const newPatient: PatientRecord = {
      id: generatedId,
      name: apt.patientName,
      dateOfBirth: '1992-05-15',
      age: apt.patientAge || 30,
      gender: apt.patientGender || 'Other',
      phone: apt.patientPhone,
      email: apt.patientEmail || `${apt.patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      address: 'Bengaluru, Karnataka',
      emergencyContact: {
        name: 'Family Contact',
        phone: apt.patientPhone,
        relation: 'Contact'
      },
      assignedDoctorId: apt.doctorId,
      assignedDoctorName: apt.doctorName,
      firstVisitDate: apt.date,
      lastVisit: apt.date,
      totalVisits: 1,
      upcomingAppointmentDate: apt.date,
      currentTreatment: apt.reasonForVisit || 'Initial Dental Consultation',
      status: 'New Patient',
      outstandingBalance: 0,
      medicalHistory: {
        allergies: [],
        conditions: [],
        hasDiabetes: false,
        hasBloodPressure: false,
        hasHeartConditions: false,
        currentMedications: [],
        previousSurgeries: [],
        otherNotes: ''
      },
      dentalHistory: {
        currentComplaint: apt.reasonForVisit
      },
      allergies: [],
      recentTreatments: [],
      visits: [
        {
          id: `visit-${Date.now()}`,
          patientId: generatedId,
          date: apt.date,
          doctorName: apt.doctorName,
          chiefComplaint: apt.reasonForVisit,
          clinicalFindings: 'Patient registered through appointment queue intake.',
          diagnosis: 'General dental checkup required',
          treatment: 'Initial clinical examination & charting opened.',
          doctorNotes: 'Initial intake completed.',
          timelineType: 'Consultation'
        }
      ],
      dentalChart: createFullDefaultDentalChart(),
      treatmentPlans: [],
      clinicalNotes: [],
      diagnoses: [],
      treatmentSessions: [],
      labOrders: [],
      documents: [],
      invoices: [],
      followUps: []
    };

    addPatient(newPatient);
    setSelectedPatientForDetail(newPatient);
    setSelectedAppointment(null);
    setActiveView('patient-profile');
    addToast(
      'Patient Registered to EMR 🦷',
      `Created EMR file for ${newPatient.name} (${newPatient.id}). Opening Odontogram...`,
      'success'
    );
  };

  // Open full multi-step registration modal with prefilled data
  const handleOpenFullRegistration = (apt: Appointment) => {
    setRegisterInitialData({
      name: apt.patientName,
      phone: apt.patientPhone,
      email: apt.patientEmail,
      age: apt.patientAge,
      gender: apt.patientGender,
      currentComplaint: apt.reasonForVisit,
      assignedDoctorId: apt.doctorId,
      assignedDoctorName: apt.doctorName
    });
    setSelectedAppointment(null);
    setShowRegisterModal(true);
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'ALL' || apt.doctorId === doctorFilter;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  const filteredEnquiries = enquiries.filter((e) => {
    const matchesFilter = enquiryFilter === 'ALL' || e.status === enquiryFilter;
    const matchesSearch =
      !searchTerm.trim() ||
      e.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone.includes(searchTerm) ||
      e.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full max-w-full overflow-x-hidden mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 flex flex-col gap-6 animate-in fade-in">
        {/* Top Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 md:p-8 text-white shadow-lg border border-teal-800/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-300 bg-teal-500/20 px-3 py-1 rounded-full border border-teal-400/30 backdrop-blur-xs">
                  Clinical Scheduling & Queue
                </span>
                <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                  {appointments.length} Total Bookings
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Appointment Schedule & Queue Desk
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                Track waiting patients, call tokens to doctor cabins, reschedule visits, and seamlessly open clinical EMR records.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
              {/* View Mode Toggle (Mobile Touch Scrollable) */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-1 flex items-center shadow-xs backdrop-blur-xs overflow-x-auto max-w-full shrink-0">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'daily'
                      ? 'bg-teal-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Daily List
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'weekly'
                      ? 'bg-teal-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Weekly View
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    viewMode === 'calendar'
                      ? 'bg-teal-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Calendar View
                </button>
                <button
                  onClick={() => setViewMode('enquiries')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    viewMode === 'enquiries'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Online Enquiries</span>
                  {newEnquiriesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      {newEnquiriesCount}
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={() => {
                  setBookingInitialData(null);
                  setShowBookingModal(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-teal-950/40 hover:shadow-teal-500/20 transition-all cursor-pointer transform hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Booking</span>
              </button>
            </div>
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* High-Priority Consultation Requests Alert Banner */}
        {newEnquiriesCount > 0 && viewMode !== 'enquiries' && (
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-2xl p-4 sm:p-5 shadow-lg border-2 border-emerald-400/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-xs">
                <Inbox className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-black text-sm uppercase tracking-wide">
                    {newEnquiriesCount} New Patient Consultation Request{newEnquiriesCount > 1 ? 's' : ''} Received!
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                  Patients submitted consultation enquiries on the clinic website. Contact on WhatsApp & confirm appointment slots.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('enquiries')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Inbox className="w-4 h-4 text-emerald-700" />
                <span>Review {newEnquiriesCount} New Enquir{newEnquiriesCount > 1 ? 'ies' : 'y'} →</span>
              </button>
            </div>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, phone or token ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="w-40">
              <ClaySelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Statuses' },
                  { value: 'Waiting', label: 'Waiting Room' },
                  { value: 'In Consultation', label: 'In Consultation' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
              />
            </div>

            <div className="w-48">
              <ClaySelect
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Consulting Doctors' },
                  ...doctors.map((d) => ({ value: d.id, label: d.name }))
                ]}
              />
            </div>
          </div>
        </div>

        {/* DAILY / LIST VIEW */}
        {viewMode === 'daily' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((apt) => {
                const existingPat = getExistingPatientForAppointment(apt);

                return (
                  <ClayCard key={apt.id} hoverEffect className="p-5 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-lg text-sky-800">{apt.tokenId}</span>
                          <StatusBadge status={apt.status} size="sm" />
                        </div>
                        <span className="text-xs font-bold text-slate-500">{apt.timeSlot}</span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">{apt.patientName}</h4>
                          
                          {/* EMR Status Indicator Pill */}
                          {existingPat ? (
                            <span 
                              onClick={() => {
                                setSelectedPatientForDetail(existingPat);
                                setActiveView('patient-profile');
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer transition-colors shrink-0"
                              title="Click to view EMR Record"
                            >
                              <UserCheck className="w-3 h-3 text-emerald-600" />
                              <span>EMR: {existingPat.id}</span>
                            </span>
                          ) : (
                            <span 
                              onClick={() => handleQuickAddToEMR(apt)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer transition-colors shrink-0"
                              title="Click to quickly register in EMR"
                            >
                              <UserPlus className="w-3 h-3 text-amber-600" />
                              <span>Not in EMR</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-sky-600 mt-0.5">Doctor: {apt.doctorName}</p>
                        <p className="text-xs text-slate-500 mt-1">Reason: {apt.reasonForVisit}</p>
                      </div>

                      <div className="mt-3 text-xs font-semibold text-slate-600 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {apt.patientPhone}
                        </span>
                        <span>•</span>
                        <span>{apt.patientAge} yrs / {apt.patientGender}</span>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* View Details Button */}
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="px-2.5 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 text-xs font-bold cursor-pointer transition-all shadow-xs"
                        >
                          View Details
                        </button>

                        {/* Direct EMR Quick Button on Card */}
                        {existingPat ? (
                          <button
                            onClick={() => {
                              setSelectedPatientForDetail(existingPat);
                              setActiveView('patient-profile');
                              addToast('Opened Patient EMR', `Viewing ${existingPat.name}'s dental chart & clinical records.`, 'info');
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold cursor-pointer inline-flex items-center gap-1 border border-teal-200 transition-all shadow-xs"
                            title="Open Patient EMR Record"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span>EMR Chart</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickAddToEMR(apt)}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold cursor-pointer inline-flex items-center gap-1 border border-amber-200 transition-all shadow-xs"
                            title="Quick Add to Clinical EMR"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                            <span>+ Add to EMR</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            addToast('Calling Patient 📞', `Connecting call to ${apt.patientPhone}`, 'info');
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          title="Call Patient"
                        >
                          <PhoneCall className="w-4 h-4 text-sky-600" />
                        </button>

                        <button
                          onClick={() => sendAppointmentWhatsApp(apt)}
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer transition-all shadow-xs"
                          title="Send Official Appointment Details via WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleCallPatient(apt)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer shadow-xs flex items-center gap-1.5 transition-all hover:scale-105"
                            title="Call patient into consultation cabin"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </button>
                        )}

                        {apt.status !== 'Completed' && apt.tokenId && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                            className="px-2.5 py-1.5 rounded-xl clay-btn-mint text-xs font-bold cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        {apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                            className="px-2 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </ClayCard>
                );
              })
            ) : (
              <div className="col-span-2 clay-card p-8 text-center text-slate-500 font-bold space-y-3">
                <p>No appointments found for current selection.</p>
                {enquiries.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2">
                    <p className="text-xs text-slate-600 font-semibold">
                      You have {enquiries.length} online consultation request{enquiries.length !== 1 ? 's' : ''} submitted by website visitors{newEnquiriesCount > 0 ? ` (${newEnquiriesCount} new)` : ''}.
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewMode('enquiries')}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Inbox className="w-4 h-4" />
                      <span>Review Online Consultation Requests ({enquiries.length})</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* CALENDAR VIEW */}
        {viewMode === 'calendar' && (
          <ClayCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800">August 2026 Doctor Schedule Calendar</h3>
              <div className="text-xs font-bold text-sky-600">Today: Aug 10, 2026</div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 mb-2">
              <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = dayNum === 10;
                const count = dayNum === 10 ? appointments.length : (dayNum * 3) % 8 + 2;

                return (
                  <div
                    key={dayNum}
                    className={`clay-card-flat p-2 min-h-[70px] flex flex-col justify-between cursor-pointer transition-all ${
                      isToday ? 'clay-card-accent border-2 border-sky-500' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-xs font-black ${isToday ? 'text-sky-900' : 'text-slate-800'}`}>
                      {dayNum}
                    </span>
                    <span className={`text-[10px] font-extrabold rounded-full px-1.5 py-0.5 ${
                      isToday ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count} Visits
                    </span>
                  </div>
                );
              })}
            </div>
          </ClayCard>
        )}

        {/* WEEKLY VIEW */}
        {viewMode === 'weekly' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {['Mon (Aug 10)', 'Tue (Aug 11)', 'Wed (Aug 12)', 'Thu (Aug 13)', 'Fri (Aug 14)'].map((dayStr, idx) => (
              <ClayCard key={dayStr} className="p-4 flex flex-col gap-2">
                <span className="text-xs font-black text-slate-800 pb-2 border-b border-slate-200">{dayStr}</span>
                {idx === 0 ? (
                  appointments.slice(0, 4).map((a) => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedAppointment(a)}
                      className="clay-card-flat p-2 text-[11px] font-bold text-slate-700 cursor-pointer hover:bg-sky-50 transition-colors"
                    >
                      <span className="text-sky-600 font-mono">{a.tokenId}</span> • {a.patientName} ({a.timeSlot})
                    </div>
                  ))
                ) : (
                  <div className="text-[11px] text-slate-400 font-semibold py-4 text-center">
                    {3 + idx} slots booked
                  </div>
                )}
              </ClayCard>
            ))}
          </div>
        )}

        {/* ONLINE CONSULTATION ENQUIRIES VIEW */}
        {viewMode === 'enquiries' && (
          <div className="flex flex-col gap-5 animate-in fade-in">
            {/* Top Stat Cards for Enquiries */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Inquiries</span>
                <span className="text-2xl font-black text-slate-900">{enquiries.length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">Action Needed (New)</span>
                <span className="text-2xl font-black text-rose-700">{newEnquiriesCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Contacted</span>
                <span className="text-2xl font-black text-sky-700">{enquiries.filter((e) => e.status === 'Contacted').length}</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Booked Confirmed</span>
                <span className="text-2xl font-black text-emerald-700">{enquiries.filter((e) => e.status === 'Appointment Booked').length}</span>
              </div>
            </div>

            {/* Filter pills & Count bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'New', 'Contacted', 'Appointment Booked', 'Registered'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setEnquiryFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      enquiryFilter === st
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st === 'ALL' ? 'All Inquiries' : st}
                    {st === 'New' && newEnquiriesCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black">
                        {newEnquiriesCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredEnquiries.length} enquiry record{filteredEnquiries.length !== 1 ? 's' : ''}
                </span>
                {enquiries.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all consultation inquiries?')) {
                        clearAllEnquiries();
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Clear all consultation inquiries"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {/* Enquiries Grid */}
            {filteredEnquiries.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredEnquiries.map((enq) => {
                  const cleanPhone = enq.phone.replace(/\D/g, '').slice(-10);

                  const getStatusBadgeStyle = (status: PatientEnquiry['status']) => {
                    switch (status) {
                      case 'New':
                        return 'bg-rose-100 text-rose-800 border-rose-200';
                      case 'Contacted':
                        return 'bg-sky-100 text-sky-800 border-sky-200';
                      case 'Appointment Booked':
                        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      case 'Registered':
                        return 'bg-teal-100 text-teal-800 border-teal-200';
                      default:
                        return 'bg-slate-100 text-slate-700 border-slate-200';
                    }
                  };

                  return (
                    <div
                      key={enq.id}
                      className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4 hover:border-teal-400 transition-colors"
                    >
                      <div className="space-y-3">
                        {/* Header ID & Status */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                              {enq.id}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(enq.status)}`}>
                              {enq.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-slate-400">
                              {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteEnquiry(enq.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete consultation request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Patient Name & Contact */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-black text-slate-900">{enq.patientName}</h4>
                            <a
                              href={`tel:${enq.phone}`}
                              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-teal-600" />
                              <span>{enq.phone}</span>
                            </a>
                          </div>
                          {enq.email && (
                            <span className="text-[11px] text-slate-400 block">{enq.email}</span>
                          )}
                        </div>

                        {/* Chief Complaint Highlight */}
                        <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80">
                          <span className="text-[10px] uppercase font-black tracking-wider text-teal-800 block mb-0.5">
                            Dental Concern / Chief Complaint
                          </span>
                          <span className="text-xs font-bold text-slate-800 block">
                            🦷 {enq.chiefComplaint}
                          </span>
                        </div>

                        {/* Preferred Date, Time Window, & Doctor */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Preferred Timing</span>
                            <span className="font-bold text-slate-800 block mt-0.5">
                              {enq.preferredDate || 'Earliest Slot'}
                            </span>
                            <span className="text-[11px] text-slate-600 font-medium">
                              {enq.preferredTimeWindow || 'Flexible'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Preferred Doctor</span>
                            <span className="font-bold text-teal-800 block mt-0.5 truncate">
                              {enq.preferredDoctorName || 'Any Specialist'}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        {enq.notes && (
                          <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs">
                            <span className="text-[10px] uppercase font-bold text-amber-800 block">Patient Remarks</span>
                            <p className="text-[11px] text-slate-700 mt-0.5">{enq.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {/* WhatsApp & Call */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const greeting = encodeURIComponent(
                                `Hello ${enq.patientName}, Greetings from Shriya Multispeciality Dental Clinic (Pollachi Road, Kozhinjapara, Palakkad - 9400320890).\n\nWe received your consultation enquiry regarding "${enq.chiefComplaint}". What time would be convenient for you to visit Dr. ${enq.preferredDoctorName || 'our dental specialist'}?`
                              );
                              window.open(`https://wa.me/91${cleanPhone}?text=${greeting}`, '_blank');
                              if (enq.status === 'New') {
                                updateEnquiryStatus(enq.id, 'Contacted');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                            title="Chat with Patient on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Chat WhatsApp</span>
                          </button>

                          <a
                            href={`tel:${enq.phone}`}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Call Patient"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                          </a>
                        </div>

                        {/* Booking & Token Conversion */}
                        <div className="flex items-center gap-1.5">
                          {/* Book Slot Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setBookingInitialData({
                                patientName: enq.patientName,
                                phone: enq.phone,
                                email: enq.email,
                                doctorId: enq.preferredDoctorId,
                                reason: enq.chiefComplaint,
                                date: enq.preferredDate,
                                enquiryId: enq.id
                              });
                              setShowBookingModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Confirm and schedule appointment"
                          >
                            <CalendarIcon className="w-3.5 h-3.5 text-teal-700" />
                            <span>+ Book Slot</span>
                          </button>

                          {/* Walk-in Register & Token Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setRegisterInitialData({
                                name: enq.patientName,
                                phone: enq.phone,
                                email: enq.email,
                                currentComplaint: enq.chiefComplaint,
                                assignedDoctorId: enq.preferredDoctorId,
                                assignedDoctorName: enq.preferredDoctorName
                              });
                              setShowRegisterModal(true);
                              updateEnquiryStatus(enq.id, 'Registered');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Register patient and issue walk-in queue token"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-sky-600" />
                            <span>+ Register & Token</span>
                          </button>

                          {/* Quick Status Toggle */}
                          <select
                            value={enq.status}
                            onChange={(e) => updateEnquiryStatus(enq.id, e.target.value as any)}
                            className="text-[11px] font-bold py-1 px-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer focus:outline-none"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Appointment Booked">Booked</option>
                            <option value="Registered">Registered</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="text-base font-bold text-slate-700">No Inquiries Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  New consultation requests submitted from the clinic website enquiry form will appear here for front-desk follow-up.
                </p>
              </div>
            )}
          </div>
        )}

        {/* DETAILED APPOINTMENT & EMR MODAL */}
        {selectedAppointment && (() => {
          const existingPat = getExistingPatientForAppointment(selectedAppointment);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
              <ClayCard className="max-w-lg w-full p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-sky-100 text-sky-800 border border-sky-200">
                      {selectedAppointment.tokenId}
                    </span>
                    <h3 className="text-lg font-black text-slate-900">Appointment Details</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedAppointment(null)} 
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Appointment Overview */}
                <div className="clay-card-flat p-4 bg-white/70 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">{selectedAppointment.patientName}</h4>
                      <p className="text-xs font-semibold text-slate-500">
                        {selectedAppointment.patientAge} yrs • {selectedAppointment.patientGender}
                      </p>
                    </div>
                    <StatusBadge status={selectedAppointment.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span>
                      <span className="font-semibold text-slate-800">{selectedAppointment.patientPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                      <span className="font-semibold text-slate-800 truncate block">{selectedAppointment.patientEmail || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Doctor</span>
                      <span className="font-bold text-sky-700">{selectedAppointment.doctorName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Schedule Slot</span>
                      <span className="font-semibold text-slate-800">{selectedAppointment.date} at {selectedAppointment.timeSlot}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Reason for Visit</span>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">{selectedAppointment.reasonForVisit}</p>
                  </div>
                </div>

                {/* CLINICAL EMR PATIENT RECORD STATUS */}
                {existingPat ? (
                  <div className="clay-card p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 border border-teal-200 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-teal-800 uppercase tracking-wider block">
                            EMR Record Linked
                          </span>
                          <span className="text-xs font-black text-slate-900 font-mono">
                            {existingPat.id}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-200/80 text-teal-900">
                        {existingPat.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-white/70 rounded-xl text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Total Visits</span>
                        <span className="font-black text-slate-800">{existingPat.totalVisits}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Balance</span>
                        <span className="font-black text-amber-700">₹{existingPat.outstandingBalance}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">Doctor</span>
                        <span className="font-bold text-sky-800 truncate block">{existingPat.assignedDoctorName}</span>
                      </div>
                    </div>

                    {existingPat.medicalHistory?.allergies && existingPat.medicalHistory.allergies.length > 0 && (
                      <div className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                        ⚠️ Medical Alert: {existingPat.medicalHistory.allergies.join(', ')}
                      </div>
                    )}

                    {/* MAIN CTA: GO TO PATIENT PROFILE / EMR */}
                    <button
                      onClick={() => {
                        setSelectedPatientForDetail(existingPat);
                        setActiveView('patient-profile');
                        setSelectedAppointment(null);
                        addToast(
                          'Opening EMR Profile 🦷',
                          `Navigating to ${existingPat.name}'s clinical records & Odontogram.`,
                          'success'
                        );
                      }}
                      className="w-full py-2.5 px-4 rounded-xl clay-btn-primary flex items-center justify-center gap-2 text-xs font-black cursor-pointer shadow-md"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Open Patient EMR Record & Odontogram</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ) : (
                  <div className="clay-card p-4 bg-gradient-to-br from-amber-50/90 to-sky-50/90 border border-amber-200 flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          Not Yet Registered in Clinical EMR
                        </h5>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          This patient has an appointment token, but no medical history, dental chart, or EMR profile exists yet.
                        </p>
                      </div>
                    </div>

                    {/* Registration Options */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        onClick={() => handleQuickAddToEMR(selectedAppointment)}
                        className="flex-1 py-2 px-3 rounded-xl clay-btn-mint text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Quick Add & Open EMR</span>
                      </button>

                      <button
                        onClick={() => handleOpenFullRegistration(selectedAppointment)}
                        className="py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-sky-600" />
                        <span>Full Intake Form</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => sendAppointmentWhatsApp(selectedAppointment)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    title="Send Official Appointment Details via WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send WhatsApp Details</span>
                  </button>

                  <ClayButton 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Close
                  </ClayButton>
                </div>
              </ClayCard>
            </div>
          );
        })()}

        {/* RECEPTIONIST NEW APPOINTMENT BOOKING MODAL */}
        <ReceptionBookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setBookingInitialData(null);
          }}
          initialData={bookingInitialData}
        />

        {/* FULL NEW PATIENT REGISTRATION MODAL */}
        <NewPatientRegistrationModal
          isOpen={showRegisterModal}
          onClose={() => {
            setShowRegisterModal(false);
            setRegisterInitialData(null);
          }}
          onRegisterPatient={(newPat) => {
            setSelectedPatientForDetail(newPat);
            setShowRegisterModal(false);
            setRegisterInitialData(null);
            setActiveView('patient-profile');
            addToast(
              'Patient Registered 🦷',
              `EMR record created for ${newPat.name} (${newPat.id}). Opening Odontogram...`,
              'success'
            );
          }}
          existingPatientCount={patients.length}
          initialData={registerInitialData}
        />
      </main>
    </div>
  );
};
