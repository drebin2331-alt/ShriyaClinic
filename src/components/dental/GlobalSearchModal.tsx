import { ModalLayer } from '../common/ModalLayer';
import React, { useState } from 'react';
import { PatientRecord, Appointment, Invoice } from '../../types';
import { Search, X, User, Calendar, FileText, Hash, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PatientRecord[];
  appointments: Appointment[];
  onSelectPatient: (patient: PatientRecord) => void;
  onSelectAppointment?: (apt: Appointment) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  patients,
  appointments,
  onSelectPatient,
  onSelectAppointment
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();

  // Search Patients
  const matchedPatients = trimmed ? patients.filter((p) =>
    p.name.toLowerCase().includes(trimmed) ||
    p.id.toLowerCase().includes(trimmed) ||
    p.phone.includes(trimmed) ||
    p.dentalChart?.some((t) => t.toothNumber.toString() === trimmed || (trimmed.startsWith('tooth') && t.toothNumber.toString() === trimmed.replace('tooth', '').trim())) ||
    p.treatmentPlans?.some((tp) => tp.procedure.toLowerCase().includes(trimmed) || tp.diagnosis.toLowerCase().includes(trimmed))
  ) : [];

  // Search Appointments
  const matchedAppointments = trimmed ? appointments.filter((a) =>
    (a.patientName || '').toLowerCase().includes(trimmed) ||
    (a.tokenId || '').toLowerCase().includes(trimmed) ||
    (a.patientPhone || '').includes(trimmed) ||
    (a.reasonForVisit || '').toLowerCase().includes(trimmed)
  ) : [];

  return (
    <ModalLayer onDismiss={onClose} className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="clay-card w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl border border-white space-y-4">
        {/* Search input header */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
          <Search className="w-5 h-5 text-sky-600 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Patient Name, ID (PAT-2026-...), Phone, Token (A-023), Tooth #36, Procedure..."
            className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
          <button aria-label="Close dialog"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {!trimmed && (
            <div className="py-8 text-center text-slate-400 space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">
                Type anything to search across patients, tokens, teeth, appointments, and procedures.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <span onClick={() => setQuery('Rahul')} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer hover:bg-slate-200">
                  "Rahul"
                </span>
                <span onClick={() => setQuery('PAT-2026-000124')} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer hover:bg-slate-200">
                  "PAT-2026-000124"
                </span>
                <span onClick={() => setQuery('36')} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer hover:bg-slate-200">
                  "Tooth #36"
                </span>
                <span onClick={() => setQuery('Root Canal')} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer hover:bg-slate-200">
                  "Root Canal"
                </span>
                <span onClick={() => setQuery('A-028')} className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600 cursor-pointer hover:bg-slate-200">
                  "A-028"
                </span>
              </div>
            </div>
          )}

          {/* Matched Patients */}
          {matchedPatients.length > 0 && (
            <div>
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                Patients Found ({matchedPatients.length})
              </div>
              <div className="space-y-1.5">
                {matchedPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => {
                      onSelectPatient(patient);
                      onClose();
                    }}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-black text-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{patient.name}</span>
                          <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                            {patient.id}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {patient.phone} • {patient.age} yrs ({patient.gender}) • Treatment: {patient.currentTreatment || 'General Consultation'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Appointments */}
          {matchedAppointments.length > 0 && (
            <div>
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2 px-1">
                Appointments & Tokens ({matchedAppointments.length})
              </div>
              <div className="space-y-1.5">
                {matchedAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => {
                      const p = patients.find((pat) => (pat.name && apt.patientName && pat.name.toLowerCase() === apt.patientName.toLowerCase()) || (pat.phone && pat.phone === apt.patientPhone));
                      if (p) onSelectPatient(p);
                      if (onSelectAppointment) onSelectAppointment(apt);
                      onClose();
                    }}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs font-mono">
                        {apt.tokenId}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">{apt.patientName}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {apt.date} at {apt.timeSlot} • {apt.doctorName} ({apt.reasonForVisit})
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {trimmed && matchedPatients.length === 0 && matchedAppointments.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-bold">No records found matching "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </ModalLayer>
  );
};
