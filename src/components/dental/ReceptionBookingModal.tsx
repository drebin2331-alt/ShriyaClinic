import { ModalLayer } from '../common/ModalLayer';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, PatientRecord } from '../../types';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  CheckCircle2, 
  MessageSquare, 
  Plus, 
  Search,
  Sparkles,
  Building,
  ShieldCheck,
  Check,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  AlertCircle,
  Share2,
  Copy,
  Printer
} from 'lucide-react';

interface ReceptionBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    patientName?: string;
    phone?: string;
    email?: string;
    doctorId?: string;
    reason?: string;
    date?: string;
    timeSlot?: string;
    enquiryId?: string;
  } | null;
  onSuccess?: (apt: Appointment) => void;
}

interface TimeCategory {
  title: string;
  icon: React.ReactNode;
  slots: string[];
}

const TIME_CATEGORIES: TimeCategory[] = [
  {
    title: 'Morning Session',
    icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
    slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM']
  },
  {
    title: 'Afternoon Session',
    icon: <Sunset className="w-3.5 h-3.5 text-orange-500" />,
    slots: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM']
  },
  {
    title: 'Evening Session',
    icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />,
    slots: ['05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM']
  }
];

const CLINICAL_PROCEDURES = [
  { label: 'General Consultation', icon: '🩺' },
  { label: 'Severe Toothache / Pain', icon: '🦷' },
  { label: 'Teeth Cleaning & Scaling', icon: '✨' },
  { label: 'Root Canal Treatment (RCT)', icon: '⚡' },
  { label: 'Braces & Clear Aligners', icon: '🪥' },
  { label: 'Crown / Bridge Work', icon: '👑' },
  { label: 'Wisdom Tooth Extraction', icon: '🩹' },
  { label: 'Dental Implant Consult', icon: '🔩' }
];

export const ReceptionBookingModal: React.FC<ReceptionBookingModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSuccess
}) => {
  const { 
    doctors, 
    patients = [], 
    addAppointment, 
    updateEnquiryStatus, 
    sendAppointmentWhatsApp, 
    addToast 
  } = useApp();

  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [reason, setReason] = useState('General Consultation');
  const [autoOpenWhatsApp, setAutoOpenWhatsApp] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen) {
      setCreatedAppointment(null);
      if (initialData) {
        setPatientName(initialData.patientName || '');
        setPhone(initialData.phone || '');
        setEmail(initialData.email || '');
        if (initialData.doctorId) setDoctorId(initialData.doctorId);
        else if (doctors.length > 0) setDoctorId(doctors[0].id);
        if (initialData.reason) setReason(initialData.reason);
        if (initialData.date) setDate(initialData.date);
        if (initialData.timeSlot) setTimeSlot(initialData.timeSlot);
        setMode('new');
      } else {
        if (doctors.length > 0 && !doctorId) {
          setDoctorId(doctors[0].id);
        }
      }
    }
  }, [isOpen, initialData, doctors]);

  if (!isOpen) return null;

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch.trim()) return false;
    const term = patientSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.phone.includes(term) ||
      (p.opNumber && p.opNumber.toLowerCase().includes(term)) ||
      p.id.toLowerCase().includes(term)
    );
  }).slice(0, 5);

  const handleSelectExistingPatient = (pat: PatientRecord) => {
    setSelectedPatient(pat);
    setPatientName(pat.name);
    setPhone(pat.phone);
    setEmail(pat.email || '');
    setAge(pat.age || 28);
    setGender(pat.gender || 'Other');
    if (pat.assignedDoctorId) setDoctorId(pat.assignedDoctorId);
    setPatientSearch('');
  };

  const handleQuickDateSelect = (daysFromNow: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    setDate(targetDate.toISOString().split('T')[0]);
  };

  const selectedDoctorObj = doctors.find((d) => d.id === doctorId) || doctors[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim() || !doctorId || !date || !timeSlot) {
      addToast('Missing Details', 'Please provide patient name, phone number, doctor, date, and slot.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDoc = doctors.find((d) => d.id === doctorId) || doctors[0];
      const newApt = await addAppointment({
        patientName: patientName.trim(),
        patientPhone: phone.trim(),
        patientEmail: email.trim() || undefined,
        patientAge: age || 28,
        patientGender: gender,
        doctorId: selectedDoc.id,
        date,
        timeSlot,
        reasonForVisit: reason.trim()
      });

      // Update enquiry status if booked from an enquiry
      if (initialData?.enquiryId) {
        updateEnquiryStatus(initialData.enquiryId, 'Appointment Booked');
      }

      setCreatedAppointment(newApt);
      addToast('Appointment Scheduled! 📅', `Booked for ${newApt.patientName} on ${newApt.date} at ${newApt.timeSlot}`, 'success');

      if (autoOpenWhatsApp) {
        setTimeout(() => {
          sendAppointmentWhatsApp(newApt);
        }, 300);
      }

      if (onSuccess) {
        onSuccess(newApt);
      }
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      addToast('Booking Failed', 'Could not save appointment record. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white max-sm:rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] overflow-hidden transform transition-all">
        
        {/* Mobile Drag Indicator */}
        <div className="pt-2 pb-1 sm:hidden flex justify-center shrink-0 bg-slate-900">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* ================================================================= */}
        {/* MODAL HEADER                                                      */}
        {/* ================================================================= */}
        <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-teal-800/40 shrink-0">
          <h3 className="text-lg font-bold">{createdAppointment ? 'Appointment confirmed' : 'Book an appointment'}</h3>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================================= */}
        {/* MODAL BODY (Scrollable with pinned footer)                        */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-5 space-y-4">
          {createdAppointment ? (
            /* ============================================================= */
            /* SUCCESS CONFIRMATION & WHATSAPP CARD                          */
            /* ============================================================= */
            <div className="space-y-5 animate-in fade-in py-2">
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/25 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    Appointment Successfully Confirmed
                  </span>
                  <h4 className="text-xl font-black text-slate-900 mt-2">
                    {createdAppointment.patientName}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Scheduled with <strong>{createdAppointment.doctorName}</strong> on <strong>{createdAppointment.date}</strong> at <strong>{createdAppointment.timeSlot}</strong>
                  </p>
                </div>
              </div>

              {/* Verified Clinical Details Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Reference / Token</span>
                  <span className="font-mono font-black text-teal-800 text-sm bg-teal-100/80 px-2.5 py-0.5 rounded-lg">
                    {createdAppointment.tokenId || createdAppointment.id}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient Mobile</span>
                    <span className="font-black text-slate-800 text-xs mt-0.5 block">{createdAppointment.patientPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Doctor</span>
                    <span className="font-black text-teal-800 text-xs mt-0.5 block wrap-anywhere">{createdAppointment.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Date & Time</span>
                    <span className="font-black text-slate-800 text-xs mt-0.5 block">{createdAppointment.date} ({createdAppointment.timeSlot})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Clinic Cabin</span>
                    <span className="font-black text-slate-800 text-xs mt-0.5 block">
                      {selectedDoctorObj?.roomNumber || 'Consulting Cabin 1'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Reason For Visit</span>
                  <span className="font-bold text-slate-700 text-xs mt-0.5 block">{createdAppointment.reasonForVisit}</span>
                </div>
              </div>

              {/* Big WhatsApp Action Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                    <span>WhatsApp Confirmation Dispatch</span>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Instant Delivery
                  </span>
                </div>
                <p className="text-xs text-emerald-900/80 font-medium leading-relaxed">
                  The official Shriya Dental appointment message contains the appointment time, doctor details, clinic location (Pollachi Road, Kozhinjapara), and contact numbers.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => sendAppointmentWhatsApp(createdAppointment)}
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Launch WhatsApp Message to Patient</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Appointment scheduled for ${createdAppointment.patientName} with ${createdAppointment.doctorName} on ${createdAppointment.date} at ${createdAppointment.timeSlot}. Clinic: Shriya Dental, Pollachi Road, Kozhinjapara (9400320890).`;
                      navigator.clipboard.writeText(text);
                      addToast('Copied to Clipboard 📋', 'Appointment summary copied.', 'info');
                    }}
                    className="py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>Copy Text</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================= */
            /* BOOKING FORM INTERFACE                                        */
            /* ============================================================= */
            <form id="reception-booking-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* =========================================================== */}
              {/* SECTION 1: PATIENT IDENTITY & SELECTION                     */}
              {/* =========================================================== */}
              <div className="space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>1. Patient Identification</span>
                  </span>

                  {/* Mode Toggle Switch */}
                  <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setMode('new')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mode === 'new' 
                          ? 'bg-white text-teal-800 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      New patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('existing')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        mode === 'existing' 
                          ? 'bg-white text-teal-800 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Existing ({patients.length})
                    </button>
                  </div>
                </div>

                {/* Existing Patient Search View */}
                {mode === 'existing' && (
                  <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search by Patient Name, Phone (+91), or OP Number..."
                        className="w-full pl-10 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                      />
                    </div>

                    {filteredPatients.length > 0 && (
                      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-lg max-h-40 overflow-y-auto">
                        {filteredPatients.map((pat) => (
                          <div
                            key={pat.id}
                            onClick={() => handleSelectExistingPatient(pat)}
                            className="p-2.5 hover:bg-teal-50 cursor-pointer flex flex-wrap items-center justify-between gap-1 transition-colors"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{pat.name}</span>
                              <span className="text-[11px] text-slate-500">
                                {pat.phone} • OP: {pat.opNumber || pat.id} • {pat.age}y/{pat.gender}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
                              Select Patient →
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedPatient && (
                      <div className="p-3 rounded-xl bg-white border border-teal-300 flex items-center justify-between text-xs shadow-2xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                            {selectedPatient.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-xs">{selectedPatient.name}</span>
                              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                                {selectedPatient.opNumber || selectedPatient.id}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {selectedPatient.phone} • {selectedPatient.gender}, {selectedPatient.age} yrs
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedPatient(null)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Patient Demographics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      WhatsApp / Mobile <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-[11px] font-bold text-slate-600">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone.replace(/^\+91/, '')}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                        placeholder="10-digit mobile"
                        className="w-full pl-3 pr-3 py-2 text-xs rounded-r-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-mono font-medium"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 28)}
                      min={1}
                      max={120}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* =========================================================== */}
              {/* SECTION 2: SPECIALIST DOCTOR ALLOCATION                    */}
              {/* =========================================================== */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>2. Consulting Dental Specialist</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {doctors.map((doc) => {
                    const isSelected = doctorId === doc.id;
                    const cabinInfo = doc.roomNumber || (doc as any).cabin || 'Cabin 101';
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setDoctorId(doc.id)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-50/70 border-teal-600 shadow-xs ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                            isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {doc.name.replace(/^Dr\.\s*/, '').charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-slate-900 block wrap-anywhere">
                              {doc.name}
                            </span>
                            <span className="text-xs text-teal-700 block wrap-anywhere">
                              {doc.specialization}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {cabinInfo}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* =========================================================== */}
              {/* SECTION 3: DATE & INTERACTIVE TIME SLOTS                   */}
              {/* =========================================================== */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>3. Appointment Date & Consultation Time</span>
                  </span>

                  {/* Quick Date Shortcuts */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => handleQuickDateSelect(0)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDateSelect(1)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 transition-colors cursor-pointer"
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDateSelect(2)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 transition-colors cursor-pointer"
                    >
                      +2 Days
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-5">
                    <div className="relative">
                      <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-7 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 shrink-0">Selected Slot:</span>
                    <span className="px-3 py-1 rounded-xl bg-teal-100 text-teal-900 font-mono font-black text-xs border border-teal-300">
                      ⏰ {timeSlot}
                    </span>
                  </div>
                </div>

                {/* Interactive Time Slot Pills Grouped by Session */}
                <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  {TIME_CATEGORIES.map((cat) => (
                    <div key={cat.title} className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500">
                        {cat.icon}
                        <span>{cat.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.slots.map((s) => {
                          const isSlotSelected = timeSlot === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setTimeSlot(s)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isSlotSelected
                                  ? 'bg-teal-600 text-white shadow-xs font-black scale-105'
                                  : 'bg-white hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* =========================================================== */}
              {/* SECTION 4: CLINICAL REASON & PROCEDURE CHIPS               */}
              {/* =========================================================== */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>4. Reason For Visit / Clinical Concern</span>
                </span>

                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Lower tooth pain, routine dental examination, scaling..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                />

                {/* Categorical procedure chip pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CLINICAL_PROCEDURES.map((proc) => {
                    const isProcSelected = reason === proc.label;
                    return (
                      <button
                        key={proc.label}
                        type="button"
                        onClick={() => setReason(proc.label)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1 border ${
                          isProcSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                            : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-600 border-slate-200'
                        }`}
                      >
                        <span>{proc.icon}</span>
                        <span>{proc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp Auto-Dispatch Option */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-emerald-950 select-none">
                  <input
                    type="checkbox"
                    checked={autoOpenWhatsApp}
                    onChange={(e) => setAutoOpenWhatsApp(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span>Dispatch official WhatsApp confirmation message to patient automatically</span>
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>

            </form>
          )}
        </div>

        {/* ================================================================= */}
        {/* PINNED MODAL FOOTER (Always visible, never scrolled out)         */}
        {/* ================================================================= */}
        <div className="px-4 py-2 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {createdAppointment ? (
            <div className="flex items-center justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs cursor-pointer transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Live Summary Strip */}
              <div className="w-full sm:w-auto min-w-0 text-xs text-slate-600 font-medium whitespace-normal break-words sm:max-w-sm">
                <span className="font-bold text-slate-800">{patientName || 'New Patient'}</span>
                {' • '}
                <span className="text-teal-700 font-bold">{date}</span> at <span className="text-teal-700 font-bold">{timeSlot}</span>
                {' • '}
                <span className="text-slate-500">{selectedDoctorObj?.name}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-white hover:border-slate-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="reception-booking-form"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:from-teal-500 hover:to-emerald-500 text-white font-black text-xs shadow-md shadow-teal-900/15 flex items-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:scale-98 disabled:opacity-50"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-200" />
                  <span>{isSubmitting ? 'Scheduling...' : 'Confirm booking'}</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </ModalLayer>
  );
};
