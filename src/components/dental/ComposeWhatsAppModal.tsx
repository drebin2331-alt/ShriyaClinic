import React, { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  Users, 
  User, 
  Copy, 
  Check, 
  Calendar, 
  Megaphone, 
  Sparkles, 
  Phone, 
  ShieldCheck,
  Clock,
  Info,
  Share2,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  CLINIC_WHATSAPP_TEMPLATES, 
  WhatsAppTemplate, 
  openWhatsAppChat,
  createWhatsAppUrl,
  formatWhatsAppNumber,
  CLINIC_OFFICIAL_PHONE,
  CLINIC_OFFICIAL_PHONE_DISPLAY
} from '../../utils/whatsapp';
import { WhatsAppMessageType } from '../../types';

interface ComposeWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'individual' | 'broadcast';
  initialPatientId?: string;
}

export const ComposeWhatsAppModal: React.FC<ComposeWhatsAppModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'individual',
  initialPatientId
}) => {
  const { patients, doctors, addWhatsAppReminder, addToast } = useApp();

  const [mode, setMode] = useState<'individual' | 'broadcast'>(initialMode);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatientId || (patients.length > 0 ? patients[0].id : 'custom')
  );
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [doctorName, setDoctorName] = useState(doctors[0]?.name || 'Dr. DOCTOR TEST');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [appointmentTime, setAppointmentTime] = useState('10:30 AM');
  const [holidayReason, setHolidayReason] = useState('Public Holiday');
  const [resumeDate, setResumeDate] = useState(
    new Date(Date.now() + 172800000).toISOString().split('T')[0]
  );

  // Broadcast settings
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'active' | 'selected'>('all');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(
    patients.map((p) => p.id)
  );

  // Template & message text
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(CLINIC_WHATSAPP_TEMPLATES[0].id);
  const [messageText, setMessageText] = useState<string>(() => {
    return CLINIC_WHATSAPP_TEMPLATES[0].defaultText
      .replace('{patientName}', patients[0]?.name || 'Valued Patient')
      .replace('{doctorName}', doctors[0]?.name || 'Dr. DOCTOR TEST')
      .replace('{date}', new Date(Date.now() + 86400000).toISOString().split('T')[0])
      .replace('{time}', '10:30 AM')
      .replace('{clinicName}', 'Shriya Multispeciality Dental Clinic');
  });

  const [copied, setCopied] = useState(false);

  // Derived current patient
  const currentPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  const targetRecipientName = useMemo(() => {
    if (mode === 'broadcast') {
      return 'All Registered Patients';
    }
    if (selectedPatientId === 'custom') {
      return customName || 'Patient';
    }
    return currentPatient ? currentPatient.name : 'Patient';
  }, [mode, selectedPatientId, customName, currentPatient]);

  const targetPhone = useMemo(() => {
    if (mode === 'broadcast') {
      return 'Multiple Recipients';
    }
    if (selectedPatientId === 'custom') {
      return customPhone;
    }
    return currentPatient ? currentPatient.phone : '';
  }, [mode, selectedPatientId, customPhone, currentPatient]);

  // Recipient list for broadcast
  const broadcastRecipients = useMemo(() => {
    if (broadcastTarget === 'all') return patients;
    if (broadcastTarget === 'active') return patients.filter((p) => p.status === 'Active Treatment');
    return patients.filter((p) => selectedRecipientIds.includes(p.id));
  }, [patients, broadcastTarget, selectedRecipientIds]);

  // Handle template selection
  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplateId(template.id);
    const pName = selectedPatientId === 'custom' ? (customName || 'Valued Patient') : (currentPatient?.name || 'Valued Patient');
    const docName = doctorName || 'Our Dental Specialist';

    let formatted = template.defaultText
      .replace(/\{patientName\}/g, pName)
      .replace(/\{doctorName\}/g, docName)
      .replace(/\{date\}/g, appointmentDate)
      .replace(/\{time\}/g, appointmentTime)
      .replace(/\{reason\}/g, holidayReason)
      .replace(/\{resumeDate\}/g, resumeDate)
      .replace(/\{clinicName\}/g, 'Shriya Multispeciality Dental Clinic');

    setMessageText(formatted);
  };

  // Insert token chip into textarea
  const insertVariable = (variable: string) => {
    setMessageText((prev) => prev + ' ' + variable);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    addToast('Copied to Clipboard 📋', 'WhatsApp message text copied.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  // Share using Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Shriya Dental - ${getMessageType()}`,
          text: messageText
        });
        addToast('Shared Successfully 📢', 'Notice shared via device share dialog.', 'success');
        return;
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          handleCopy();
        }
        return;
      }
    }
    handleCopy();
  };

  // Map template category to WhatsAppMessageType
  const getMessageType = (): WhatsAppMessageType => {
    const tpl = CLINIC_WHATSAPP_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!tpl) return 'Custom Notice';
    switch (tpl.category) {
      case 'Important Date':
        return 'Important Date';
      case 'Clinic News':
        return 'Clinic News';
      case 'Holiday Notice':
        return 'Holiday Notice';
      case 'Post-Treatment Care':
        return 'Post Visit Care';
      default:
        return 'Custom Notice';
    }
  };

  // Send Immediately via WhatsApp
  const handleSendNow = () => {
    if (!messageText.trim()) {
      addToast('Cannot Send', 'Please enter a message text.', 'warning');
      return;
    }

    if (mode === 'individual') {
      const phone = selectedPatientId === 'custom' ? customPhone : (currentPatient?.phone || '');
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        addToast('Invalid Phone', 'Please provide a valid 10-digit mobile number.', 'danger');
        return;
      }

      // Add to reminders state
      addWhatsAppReminder({
        patientName: targetRecipientName,
        phone,
        appointmentDate,
        appointmentTime,
        doctorName,
        type: getMessageType(),
        status: 'Sent',
        scheduledFor: 'Immediate',
        messageText,
        category: 'Individual'
      });

      // Launch WhatsApp Web or Native App directly!
      openWhatsAppChat(phone, messageText);
      addToast('WhatsApp Opened 💬', `Dispatched message to ${targetRecipientName} (${phone}).`, 'success');
      onClose();
    } else {
      // Broadcast mode
      if (broadcastRecipients.length === 0) {
        addToast('No Recipients', 'Please select at least one recipient patient.', 'warning');
        return;
      }

      // Record broadcast parent entry
      addWhatsAppReminder({
        patientName: `Broadcast (${broadcastRecipients.length} Patients)`,
        phone: 'Multiple (Broadcast)',
        appointmentDate,
        appointmentTime,
        doctorName: 'Clinic Administration',
        type: getMessageType(),
        status: 'Sent',
        scheduledFor: 'Immediate',
        messageText,
        category: 'Broadcast',
        recipientCount: broadcastRecipients.length
      });

      // If 1 recipient, open chat directly. If multiple, open the first recipient's chat and queue the rest
      if (broadcastRecipients.length > 0) {
        openWhatsAppChat(broadcastRecipients[0].phone, messageText);
      }

      addToast('Broadcast Dispatched 📢', `Sent broadcast to ${broadcastRecipients.length} patients.`, 'success');
      onClose();
    }
  };

  // Schedule as Pending
  const handleSchedulePending = () => {
    if (!messageText.trim()) {
      addToast('Cannot Schedule', 'Please enter a message text.', 'warning');
      return;
    }

    const phone = mode === 'individual' 
      ? (selectedPatientId === 'custom' ? customPhone : (currentPatient?.phone || ''))
      : 'Multiple (Broadcast)';

    addWhatsAppReminder({
      patientName: targetRecipientName,
      phone: phone || 'Pending phone',
      appointmentDate,
      appointmentTime,
      doctorName,
      type: getMessageType(),
      status: 'Scheduled',
      scheduledFor: `${appointmentDate}, ${appointmentTime}`,
      messageText,
      category: mode === 'individual' ? 'Individual' : 'Broadcast',
      recipientCount: mode === 'broadcast' ? broadcastRecipients.length : undefined
    });

    addToast('Scheduled ⏰', `WhatsApp message queued for ${targetRecipientName}.`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-white">
              <Megaphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Compose WhatsApp Message</h3>
              <p className="text-xs text-emerald-200">
                Send appointment dates, clinic news, holiday notices & treatment updates directly via WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2">
          <button
            onClick={() => setMode('individual')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'individual'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Individual Patient
          </button>
          <button
            onClick={() => setMode('broadcast')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'broadcast'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Broadcast Notice / News
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Controls Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Recipient Selection */}
            {mode === 'individual' ? (
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Select Target Patient
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatientId('custom');
                      setCustomName('Clinic Desk (Test)');
                      setCustomPhone('9400320890');
                    }}
                    className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-2 py-0.5 rounded border border-emerald-300 transition-colors"
                  >
                    📱 Test Send to Clinic (94003 20890)
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {patients.map((pat) => (
                      <option key={pat.id} value={pat.id}>
                        {pat.name} ({pat.opNumber}) - {pat.phone}
                      </option>
                    ))}
                    <option value="custom">+ Other / Custom Recipient</option>
                  </select>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600 px-2.5 py-1.5 bg-white rounded-lg border border-slate-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-bold truncate">
                      {selectedPatientId === 'custom' ? (customPhone || 'Enter phone below') : (currentPatient?.phone || 'No phone')}
                    </span>
                  </div>
                </div>

                {selectedPatientId === 'custom' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Patient Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramesh Kumar"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">WhatsApp Phone (10-digits)</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9633746591"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Broadcast Audience
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastTarget('all')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      broadcastTarget === 'all'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All Patients ({patients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastTarget('active')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      broadcastTarget === 'active'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Active Treatment ({patients.filter((p) => p.status === 'Active Treatment').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastTarget('selected')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                      broadcastTarget === 'selected'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Specific Patients ({selectedRecipientIds.length})
                  </button>
                </div>

                {broadcastTarget === 'selected' && (
                  <div className="max-h-28 overflow-y-auto bg-white p-2 rounded-lg border border-slate-200 flex flex-col gap-1 text-xs">
                    {patients.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedRecipientIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRecipientIds((prev) => [...prev, p.id]);
                            } else {
                              setSelectedRecipientIds((prev) => prev.filter((id) => id !== p.id));
                            }
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({p.phone})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Templates Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Select Message Template & Topic
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  Auto-fills message
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {CLINIC_WHATSAPP_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`text-left p-2 rounded-lg border transition-all flex flex-col gap-0.5 ${
                      selectedTemplateId === tpl.id
                        ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-800 truncate">{tpl.title}</span>
                    <span className="text-[10px] text-slate-500 truncate">{tpl.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Variables Helper */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Insert Variables (Click to Add):
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { tag: '{patientName}', label: 'Patient Name' },
                  { tag: '{date}', label: 'Date' },
                  { tag: '{time}', label: 'Time' },
                  { tag: '{doctorName}', label: 'Doctor' },
                  { tag: '{clinicName}', label: 'Clinic Name' }
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => insertVariable(item.tag)}
                    className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded text-[10px] font-semibold text-slate-700 transition-colors"
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Message Content (WhatsApp Formatted)
                </label>
                <span className="text-[10px] font-semibold text-slate-400">
                  {messageText.length} characters
                </span>
              </div>
              <textarea
                rows={6}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your WhatsApp notification, date reminder or clinic news..."
                className="w-full text-xs font-normal p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent leading-relaxed"
              />
            </div>
          </div>

          {/* WhatsApp Preview Column (Phone Simulator) */}
          <div className="lg:col-span-5 flex flex-col justify-start">
            <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Live WhatsApp Recipient Preview
            </label>

            <div className="w-full rounded-2xl border border-slate-300 shadow-md overflow-hidden bg-[#efeae2] flex flex-col">
              {/* WhatsApp Mock Header */}
              <div className="bg-[#075e54] text-white px-3.5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-300/30 flex items-center justify-center text-base border border-emerald-400/40 font-bold">
                    🦷
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      Shriya Multispeciality Dental
                    </h4>
                    <span className="text-[10px] text-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      Official Verified Account • +91 94003 20890
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Bubble Area */}
              <div className="p-3 flex-1 flex flex-col gap-2 min-h-[220px] max-h-[340px] overflow-y-auto">
                {/* Security encryption pill */}
                <div className="self-center bg-[#ffeecd] text-[#54656f] text-[9px] px-2.5 py-1 rounded-md text-center max-w-[90%] shadow-sm leading-tight">
                  🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
                </div>

                {/* Message Bubble */}
                <div className="self-start max-w-[92%] bg-white rounded-lg rounded-tl-none p-3 shadow-sm border border-slate-200/60 text-slate-800 text-xs leading-relaxed">
                  <div className="whitespace-pre-line text-[11px] font-sans">
                    {messageText || (
                      <span className="text-slate-400 italic">Message preview will appear here...</span>
                    )}
                  </div>
                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                    <span>To: {targetRecipientName}</span>
                    <span>Just now ✓✓</span>
                  </div>
                </div>
              </div>

              {/* Chat Footer info */}
              <div className="bg-slate-100/90 border-t border-slate-200 px-3 py-2 text-[10px] text-slate-600 flex items-center justify-between">
                <span className="truncate">Recipient: <strong className="text-slate-800">{targetPhone}</strong></span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9px]">
                  {mode === 'individual' ? '1-on-1' : `Broadcast (${broadcastRecipients.length})`}
                </span>
              </div>
            </div>

            {/* Quick Helper Note */}
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-[11px] text-emerald-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Clicking <strong>Send via WhatsApp</strong> immediately opens WhatsApp Web (desktop) or WhatsApp app (mobile) with pre-filled message text.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share via device menu"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              Share Notice
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSchedulePending}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Queue as Pending
            </button>

            <button
              type="button"
              onClick={handleSendNow}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Send via WhatsApp Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
