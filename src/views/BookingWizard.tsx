import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  CheckCircle2, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck,
  Send,
  Building,
  PhoneCall
} from 'lucide-react';

const COMMON_CONCERNS = [
  'Smile Transformation / Aesthetic Crowns & Bridges',
  'Toothache / Severe Pain',
  'Teeth Cleaning & Polishing (Scaling)',
  'Cavity & Composite Tooth Filling',
  'Root Canal Therapy (RCT)',
  'Braces & Invisible Aligners',
  'Wisdom Tooth Pain / Extraction',
  'Dental Implants & Replacement',
  'Routine Dental Checkup & Consultation',
  'Pediatric / Child Dental Care'
];

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning (09:30 AM – 01:00 PM)', icon: '🌅' },
  { id: 'afternoon', label: 'Afternoon (02:00 PM – 04:30 PM)', icon: '☀️' },
  { id: 'evening', label: 'Evening (04:30 PM – 06:30 PM)', icon: '🌙' }
];

export const BookingWizard: React.FC = () => {
  const { doctors, addEnquiry, setActiveView, addToast } = useApp();

  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTimeWindow, setPreferredTimeWindow] = useState('Morning (09:30 AM – 01:00 PM)');
  const [chiefComplaint, setChiefComplaint] = useState('Routine Dental Checkup & Consultation');
  const [preferredDoctorId, setPreferredDoctorId] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{ id: string; name: string; phone: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim() || !chiefComplaint.trim()) {
      addToast('Missing Details', 'Please provide your name, phone number, and primary dental concern.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedDoc = doctors.find((d) => d.id === preferredDoctorId);
      const result = await addEnquiry({
        patientName: patientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        preferredDate,
        preferredTimeWindow,
        chiefComplaint,
        preferredDoctorId: preferredDoctorId || undefined,
        preferredDoctorName: selectedDoc ? selectedDoc.name : undefined,
        notes: notes.trim() || undefined
      });

      setSubmittedData({
        id: result.id,
        name: result.patientName,
        phone: result.phone
      });
      addToast('Enquiry Received 📋', 'Our front desk reception will contact you shortly.', 'success');
    } catch (err: any) {
      console.error('Error submitting consultation enquiry:', err);
      addToast('Submission Failed', 'Could not record enquiry. Please call our reception at 9400320890.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDirectWhatsApp = () => {
    const clinicNumber = '919400320890';
    const message = encodeURIComponent(
      `Hello Shriya Multispeciality Dental Clinic! I submitted a consultation enquiry (ID: ${submittedData?.id || 'New'}) for ${patientName || submittedData?.name}. Could you please confirm my appointment slot?`
    );
    window.open(`https://wa.me/${clinicNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-28 animate-in fade-in">
      {/* Top Breadcrumb & Return to Site */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => setActiveView('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Website</span>
        </button>

        <span className="text-[10px] sm:text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-teal-200">
          Reception Coordinated Desk
        </span>
      </div>

      {submittedData ? (
        /* SUCCESS CONFIRMATION VIEW */
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200/90 text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-emerald-600 tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Enquiry ID: {submittedData.id}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Consultation Request Received!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
              Thank you, <strong>{submittedData.name}</strong>. Our front-desk receptionist at <strong>Shriya Multispeciality Dental Clinic</strong> is reviewing your preferred doctor and time slot.
            </p>
          </div>

          {/* Clinic Reception Contact Policy */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs">
            <div className="flex items-center gap-2 font-black text-slate-800">
              <Building className="w-4 h-4 text-teal-700" />
              <span>What Happens Next?</span>
            </div>
            <ul className="space-y-2 text-slate-600 font-medium pl-6 list-disc">
              <li>Our front desk will contact your WhatsApp / Phone number (<strong>{submittedData.phone}</strong>) shortly.</li>
              <li>We will confirm your doctor's availability, assign the exact consultation time, and send you the official appointment confirmation.</li>
              <li>When you arrive at the clinic, the receptionist will register your file and issue your consultation token immediately.</li>
            </ul>
          </div>

          {/* Direct WhatsApp Call to Action */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleOpenDirectWhatsApp}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 active:scale-98"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat with Receptionist on WhatsApp Now</span>
            </button>

            <button
              onClick={() => setActiveView('landing')}
              className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
            >
              Return to Clinic Homepage
            </button>
          </div>
        </div>
      ) : (
        /* CONSULTATION ENQUIRY FORM */
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/90 space-y-6">
          {/* Header */}
          <div className="space-y-2 pb-5 border-b border-slate-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-black">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Official Dental Appointment Request Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Request Your Dental Consultation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              Avoid waiting and direct token conflicts. Provide your visit preferences below — our front-desk reception will review the doctor schedule, confirm your slot, and send you the appointment details directly via WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Patient Demographics */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                1. Patient Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WhatsApp / Mobile Number *
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
                      className="w-full pl-3 pr-3 py-2.5 text-xs rounded-r-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-mono font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Our receptionist will send your confirmed date & time directly to this WhatsApp number.
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Dental Concern Selection */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                2. Primary Dental Concern *
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMMON_CONCERNS.map((concern) => (
                  <button
                    key={concern}
                    type="button"
                    onClick={() => setChiefComplaint(concern)}
                    className={`p-2.5 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer border ${
                      chiefComplaint === concern
                        ? 'bg-teal-500/10 border-teal-500 text-teal-900 shadow-xs ring-1 ring-teal-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    🦷 {concern}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Preferred Timing & Doctor */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                3. Preferred Date, Time Window & Doctor
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Preferred Visit Date
                  </label>
                  <div className="relative mb-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      value={preferredDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-semibold"
                    />
                  </div>
                  {/* Mobile Quick Date Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { label: 'Today', offset: 0 },
                      { label: 'Tomorrow', offset: 1 },
                      { label: '+2 Days', offset: 2 },
                      { label: '+3 Days', offset: 3 }
                    ].map((item) => {
                      const d = new Date();
                      d.setDate(d.getDate() + item.offset);
                      const iso = d.toISOString().split('T')[0];
                      const isSel = preferredDate === iso;
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setPreferredDate(iso)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0 ${
                            isSel 
                              ? 'bg-teal-700 text-white shadow-2xs' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Convenient Time Window *
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {TIME_WINDOWS.map((win) => {
                      const isSelected = preferredTimeWindow === win.label;
                      return (
                        <button
                          key={win.id}
                          type="button"
                          onClick={() => setPreferredTimeWindow(win.label)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-2xs ring-1 ring-teal-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-base shrink-0">{win.icon}</span>
                          <div className="min-w-0">
                            <span className="font-extrabold text-xs block text-slate-900 truncate">
                              {win.label.split('(')[0].trim()}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              ({win.label.split('(')[1]}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Preferred Consulting Doctor (Optional)
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={preferredDoctorId}
                    onChange={(e) => setPreferredDoctorId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-bold text-slate-800 bg-white"
                  >
                    <option value="">Any Available Specialist Doctor (Recommended)</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} — {doc.specialization} ({doc.cabin})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Additional Notes or Symptoms (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Pain in lower left tooth since 2 days, sensitivity to cold water..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>
            </div>

            {/* Submit Toolbar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Zero advance fees. Reception confirms slot before you visit.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-800 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-teal-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting to Reception...' : 'Submit Consultation Request'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
