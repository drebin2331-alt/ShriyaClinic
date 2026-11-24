import { PrioritySelector } from '../common/PrioritySelector';
import React, { useState, useEffect } from 'react';
import { ModalLayer } from '../common/ModalLayer';
import { useApp } from '../../context/AppContext';
import { PatientRecord, QueueToken } from '../../types';
import {
  Ticket,
  X,
  User,
  Stethoscope,
  Calendar,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export interface IssueTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientRecord | null;
  onSuccess?: (tokenNumber: string) => void;
}

export const IssueTokenModal: React.FC<IssueTokenModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess
}) => {
  const { doctors = [], appointments = [], checkInPatient, addToast, setActiveView } = useApp();

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Emergency'>('Normal');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [issuedToken, setIssuedToken] = useState<QueueToken | null>(null);

  // Sync state when patient or open state changes
  useEffect(() => {
    if (patient && isOpen) {
      setSelectedDoctorId(patient.assignedDoctorId || doctors[0]?.id || 'doc-1');
      setPriority('Normal');
      setReason(patient.currentTreatment || 'General Dental Consultation & Examination');
      setIssuedToken(null);
    }
  }, [patient, isOpen, doctors]);

  if (!isOpen || !patient) return null;

  // Check if patient already has an appointment booked for today
  const todayDate = new Date().toISOString().split('T')[0];
  const todayApt = appointments.find(
    (a) =>
      (a.patientId === patient.id ||
        (patient.phone && a.patientPhone && a.patientPhone.replace(/\D/g, '') === patient.phone.replace(/\D/g, ''))) &&
      a.date === todayDate &&
      a.status !== 'Cancelled' &&
      a.status !== 'Completed'
  );

  const quickReasons = [
    'General Dental Consultation',
    'Toothache / Emergency Pain',
    'Scaling & Deep Cleaning',
    'Root Canal Treatment',
    'Orthodontics / Braces Adjustment',
    'Crown / Bridge / Implant Review',
    'Dental Extraction',
    'Routine Follow-Up'
  ];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setIsSubmitting(true);
    try {
      const res = await checkInPatient({
        patientId: patient.id,
        doctorId: selectedDoctorId || patient.assignedDoctorId || doctors[0]?.id || 'doc-1',
        priority,
        reasonForVisit: reason.trim() || 'General Dental Consultation & Examination',
        appointmentId: todayApt?.id,
        isWalkIn: !todayApt
      });

      setIssuedToken(res.token);
      addToast(
        'Queue Token Issued 🎟️',
        `Token #${res.token.tokenNumber} issued for ${patient.name}.`,
        'success'
      );
      if (onSuccess) {
        onSuccess(res.token.tokenNumber);
      }
    } catch (err: any) {
      addToast('Failed to Issue Token', err.message || 'Could not check-in patient.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allergies = patient.medicalHistory?.allergies || [];

  return (
    <ModalLayer
      onDismiss={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {issuedToken ? 'Token Issued Successfully' : 'Issue OPD Queue Token'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {issuedToken ? 'Patient added to live doctor queue' : 'Check-in patient to active waiting lounge'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {issuedToken ? (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Live Queue Token
              </span>
              <div className="text-4xl font-black text-slate-900 mt-2 tracking-tight">
                #{issuedToken.tokenNumber}
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                Issued for <strong>{patient.name}</strong> ({patient.opNumber || patient.id})
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor Assigned:</span>
                <span className="font-bold text-slate-800">{issuedToken.doctorName || 'Consulting Doctor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Queue Priority:</span>
                <span className="font-bold text-slate-800">{issuedToken.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">{issuedToken.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Issued:</span>
                <span className="font-medium text-slate-600">{issuedToken.createdAt}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('token-control');
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold text-xs hover:bg-emerald-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span>View in Live Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Issue Token Form */
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Patient Snapshot Pill */}
            <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm truncate">{patient.name}</span>
                  <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-white text-teal-900 border border-teal-200">
                    {patient.opNumber || patient.id}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 font-medium">
                  {[patient.age ? `${patient.age}y` : '', patient.gender, patient.phone ? `Ph: ${patient.phone}` : ''].filter(Boolean).join(' • ')}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {patient.status || 'Registered'}
                </span>
              </div>
            </div>

            {/* Medical / Allergy Alert if present */}
            {allergies.length > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                <span>
                  <strong>Allergy Alert:</strong> {allergies.join(', ')}
                </span>
              </div>
            )}

            {/* Today's Booked Appointment Banner */}
            {todayApt && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-semibold">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Confirmed Appointment Today: <strong>{todayApt.timeSlot}</strong> with {todayApt.doctorName}
                </span>
              </div>
            )}

            {/* Doctor Selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                <span>Assigning Doctor *</span>
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer text-xs"
              >
                {doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.specialty || doc.specialization || 'Dental Specialist'})
                    </option>
                  ))
                ) : (
                  <option value={selectedDoctorId || 'doc-1'}>
                    {patient.assignedDoctorName || 'Duty Dental Surgeon (General Dentistry)'}
                  </option>
                )}
              </select>
            </div>

            {/* Priority Selector */}
            <PrioritySelector value={priority} onChange={setPriority} />

            {/* Chief Complaint / Reason */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700">
                  Chief Complaint / Reason for Visit *
                </label>
                <span className="text-[10px] text-slate-400">Click quick reason below</span>
              </div>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Severe toothache, Cleaning, Root canal"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-xs"
              />

              {/* Quick Reasons Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickReasons.map((qr) => (
                  <button
                    key={qr}
                    type="button"
                    onClick={() => setReason(qr)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[10px] transition-colors cursor-pointer border border-slate-200"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-900/15 hover:shadow-emerald-900/25 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Ticket className="w-4 h-4" />
                <span>{isSubmitting ? 'Issuing...' : 'Issue Token 🎟️'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalLayer>
  );
};
