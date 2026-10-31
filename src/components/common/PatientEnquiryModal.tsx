import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Phone, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MessageSquare, 
  Sparkles, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight,
  Sun,
  Sunset,
  Moon,
  ChevronRight
} from 'lucide-react';

interface PatientEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultConcern?: string;
}

const COMMON_CONCERNS = [
  { label: 'Toothache / Severe Pain', icon: '🦷' },
  { label: 'Teeth Cleaning (Scaling)', icon: '✨' },
  { label: 'Cavity / Tooth Filling', icon: '🩹' },
  { label: 'Root Canal Therapy (RCT)', icon: '⚡' },
  { label: 'Braces & Clear Aligners', icon: '🪥' },
  { label: 'Wisdom Tooth / Extraction', icon: '🦷' },
  { label: 'Dental Implants', icon: '🔩' },
  { label: 'Routine Checkup & Consult', icon: '🩺' }
];

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', sub: '9:30 AM – 1 PM', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon', sub: '2 PM – 4:30 PM', icon: '☀️' },
  { id: 'evening', label: 'Evening', sub: '5 PM – 7 PM', icon: '🌙' }
];

export const PatientEnquiryModal: React.FC<PatientEnquiryModalProps> = ({
  isOpen,
  onClose,
  defaultConcern
}) => {
  const { addEnquiry, doctors } = useApp();

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTimeWindow, setPreferredTimeWindow] = useState('Morning (09:30 AM – 01:00 PM)');
  const [chiefComplaint, setChiefComplaint] = useState(defaultConcern || 'Routine Checkup & Consult');
  const [preferredDoctorId, setPreferredDoctorId] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ id: string; name: string; phone: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim() || !chiefComplaint.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedDoc = doctors.find((d) => d.id === preferredDoctorId);
      const result = await addEnquiry({
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        preferredDate,
        preferredTimeWindow,
        chiefComplaint: chiefComplaint.trim(),
        preferredDoctorId: preferredDoctorId || undefined,
        preferredDoctorName: selectedDoc ? selectedDoc.name : undefined,
        notes: notes.trim() || undefined
      });

      setSubmittedData({
        id: result.id,
        name: result.patientName,
        phone: result.phone
      });
    } catch (err) {
      console.error('Error submitting enquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDirectWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello Shriya Dental Clinic, I would like to enquire about an appointment for ${patientName || 'a patient'}. Concern: ${chiefComplaint}. Preferred date: ${preferredDate} (${preferredTimeWindow}).`
    );
    window.open(`https://wa.me/919400320890?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      
      {/* Mobile Backdrop Click to Close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />

      {/* Main Bottom-Sheet / Modal Container */}
      <div className="bg-white w-full sm:max-w-xl max-sm:rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden text-slate-900 transition-all">
        
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="pt-2 pb-1 sm:hidden flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200/90 text-teal-700 flex items-center justify-center text-xl shadow-xs shrink-0">
              🦷
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                  Request Consultation
                </h2>
                <span className="text-[9px] font-black uppercase text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.2 rounded-full hidden xs:inline-block">
                  Reception Desk
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Shriya Multispeciality Dental Clinic • Instant WhatsApp Confirmation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {submittedData ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="py-4 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-in zoom-in-75">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  Enquiry ID: {submittedData.id}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  Request Received!
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                  Thank you, <strong>{submittedData.name}</strong>. Our front-desk receptionist is reviewing the doctor schedule.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 text-left space-y-2 max-w-md mx-auto">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Next Step: Reception WhatsApp Alert</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Our receptionist will message you at <strong>{submittedData.phone}</strong> via WhatsApp with your confirmed consultation time and doctor cabin details.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleOpenDirectWhatsApp}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-900/10 active:scale-98 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with Receptionist on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ENQUIRY INPUT FORM */
            <form id="patient-enquiry-form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Quick Helper Banner */}
              <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50/70 border border-teal-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-teal-950">
                <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
                <p className="text-[11px] sm:text-xs leading-relaxed font-medium">
                  Zero advance fees. Our receptionist will verify the doctor slot and send confirmation to your WhatsApp.
                </p>
              </div>

              {/* Patient Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-[11px] font-bold text-slate-700">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      required
                      value={phone.replace(/^\+91/, '')}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                      placeholder="10-digit mobile"
                      className="w-full pl-3 pr-3 py-2.5 rounded-r-xl text-xs font-mono font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 transition-all outline-hidden text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Dental Concern Selection (2-column compact touch chips) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Dental Concern / Reason for Visit <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {COMMON_CONCERNS.map((c) => {
                    const isSelected = chiefComplaint === c.label;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setChiefComplaint(c.label)}
                        className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="text-xs shrink-0">{c.icon}</span>
                        <span className="truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  required
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Or describe specific tooth problem..."
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 transition-all outline-hidden text-slate-900"
                />
              </div>

              {/* Preferred Date & Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Visit Date
                  </label>
                  <div className="relative">
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 outline-hidden text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Doctor (Optional)
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={preferredDoctorId}
                      onChange={(e) => setPreferredDoctorId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 outline-hidden text-slate-900 truncate"
                    >
                      <option value="">Any Available Specialist</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.specialization})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Convenient Time Window (Touch Friendly 3-Button Segment) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Convenient Time Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_WINDOWS.map((tw) => {
                    const isSelected = preferredTimeWindow.includes(tw.label);
                    return (
                      <button
                        key={tw.id}
                        type="button"
                        onClick={() => setPreferredTimeWindow(`${tw.label} (${tw.sub})`)}
                        className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-900 ring-2 ring-teal-500/20 font-bold'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-base block">{tw.icon}</span>
                        <span className="text-xs font-black block mt-0.5">{tw.label}</span>
                        <span className="text-[10px] text-slate-500 block">{tw.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Remarks (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Remarks or Pain Symptoms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitivity to cold water, pain when chewing..."
                  className="w-full p-2.5 rounded-xl text-xs font-medium bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-600 outline-hidden text-slate-900 resize-none"
                />
              </div>

            </form>
          )}
        </div>

        {/* ================================================================= */}
        {/* PINNED MOBILE BOTTOM BAR (Always visible at thumb reach!)         */}
        {/* ================================================================= */}
        {!submittedData && (
          <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200/90 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenDirectWhatsApp}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Reception</span>
            </button>

            <button
              type="submit"
              form="patient-enquiry-form"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-teal-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting to Reception...</span>
              ) : (
                <>
                  <span>Submit Consultation Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
