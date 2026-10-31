import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Activity, 
  ArrowRight, 
  Tv2, 
  Sparkles,
  Volume2
} from 'lucide-react';

export const LiveQueueView: React.FC = () => {
  const { appointments, userToken, setUserToken, setActiveView, addToast } = useApp();

  const [searchTokenInput, setSearchTokenInput] = useState<string>(userToken);

  // Active consultation token
  const currentConsultation = appointments.find((a) => a.status === 'In Consultation') || appointments.find((a) => a.status === 'Waiting');

  // Next tokens in line
  const nextWaitingList = appointments.filter((a) => a.status === 'Waiting');

  // Queue statistics
  const waitingCount = appointments.filter((a) => a.status === 'Waiting').length;
  const inConsultCount = appointments.filter((a) => a.status === 'In Consultation').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  // Patient's own token lookup calculation
  const lookupToken = searchTokenInput.toUpperCase().trim() || userToken;
  const userApt = appointments.find((a) => a.tokenId === lookupToken);

  let patientsAhead = 0;
  let estWaitMinutes = 0;

  if (userApt && currentConsultation) {
    const userNum = parseInt(userApt.tokenId.replace('A-', ''), 10) || 0;
    const currentNum = parseInt(currentConsultation.tokenId.replace('A-', ''), 10) || 0;
    patientsAhead = Math.max(0, userNum - currentNum - 1);
    estWaitMinutes = patientsAhead * 8 + 5;
  }

  // Helper to mask patient names on public queue display for patient privacy
  const maskPatientName = (name: string): string => {
    if (!name) return 'Patient';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].length > 2 ? `${parts[0].slice(0, 2)}***` : `${parts[0]}*`;
    }
    return `${parts[0]} ${parts[parts.length - 1].slice(0, 1)}.***`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-8">
      {/* Top Title & Quick Action */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full clay-card-accent text-sky-700 text-xs font-black mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Clinic Live Queue Server Online</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Today's Patient Queue & Live Tokens
          </h1>
          <p className="text-xs text-slate-500">
            Real-time queue tracking for Shriya Multispeciality Dental Clinic reception and patient display.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ClayButton
            variant="secondary"
            size="sm"
            onClick={() => {
              addToast('Queue Screen Refreshed', 'Connected to reception live stream.', 'info');
            }}
            icon={<Activity className="w-4 h-4 text-sky-600" />}
          >
            Live Sync
          </ClayButton>

          <ClayButton
            variant="primary"
            size="sm"
            onClick={() => setActiveView('reception-tv')}
            icon={<Tv2 className="w-4 h-4" />}
          >
            Open Reception TV Mode
          </ClayButton>
        </div>
      </div>

      {/* Queue Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ClayCard variant="flat" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{waitingCount}</div>
            <div className="text-[11px] font-bold text-slate-500">Waiting Patients</div>
          </div>
        </ClayCard>

        <ClayCard variant="accent" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-sky-900">{inConsultCount}</div>
            <div className="text-[11px] font-bold text-sky-700">In Consultation</div>
          </div>
        </ClayCard>

        <ClayCard variant="mint" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-teal-900">{completedCount}</div>
            <div className="text-[11px] font-bold text-teal-700">Completed Today</div>
          </div>
        </ClayCard>

        <ClayCard variant="flat" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{cancelledCount}</div>
            <div className="text-[11px] font-bold text-slate-500">Cancelled</div>
          </div>
        </ClayCard>
      </div>

      {/* Main Grid: Current Token Highlight + Next Queue + Your Token Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Current Token & Next Tokens */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* CURRENT TOKEN DISPLAY CARD */}
          <ClayCard variant="accent" className="p-6 relative overflow-hidden border-2 border-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-sky-200">
              <span className="text-xs font-black uppercase tracking-widest text-sky-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Current Token Now Serving
              </span>
              {currentConsultation && <StatusBadge status={currentConsultation.status} size="lg" />}
            </div>

            {currentConsultation ? (
              <div className="py-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                  <div className="text-7xl md:text-8xl font-black text-sky-950 tracking-tight my-1 drop-shadow-sm font-mono">
                    {currentConsultation.tokenId}
                  </div>
                  <div className="text-lg font-black text-slate-800 mt-2">
                    Patient: {maskPatientName(currentConsultation.patientName)}
                  </div>
                  <div className="text-xs font-bold text-sky-800 mt-1">
                    Doctor: {currentConsultation.doctorName} ({currentConsultation.doctorSpecialty})
                  </div>
                  <div className="text-xs text-slate-600 font-semibold mt-0.5">
                    Time Slot: {currentConsultation.timeSlot} • Cabin 101
                  </div>
                </div>

                <div className="clay-card-flat p-4 rounded-3xl flex flex-col items-center gap-2 border border-white shrink-0 min-w-[160px]">
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-black shadow-md">
                    👨‍⚕️
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-500">Active Room</span>
                  <span className="text-xs font-black text-sky-800">In Consultation</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm font-bold">
                No active token currently in consultation.
              </div>
            )}
          </ClayCard>

          {/* NEXT TOKENS LIST */}
          <ClayCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                <span>Next Patients in Line</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">{nextWaitingList.length} Waiting</span>
            </div>

            {nextWaitingList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {nextWaitingList.slice(0, 6).map((apt, idx) => (
                  <div
                    key={apt.id}
                    className="clay-card-flat p-3 flex flex-col gap-1 border border-white hover:scale-102 transition-transform"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-sky-700">{apt.tokenId}</span>
                      <span className="text-[10px] font-bold text-slate-400">#{idx + 1} next</span>
                    </div>
                    <div className="text-xs font-bold text-slate-800 truncate">{maskPatientName(apt.patientName)}</div>
                    <div className="text-[10px] font-semibold text-slate-500 truncate">{apt.doctorName}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-bold text-slate-400">
                Queue is clear. No waiting patients.
              </div>
            )}
          </ClayCard>
        </div>

        {/* Right Column: "YOUR TOKEN" Patient Status Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <ClayCard variant="mint" className="p-6 relative border-2 border-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-teal-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-700" />
                <span>Your Live Token Tracker</span>
              </h3>
              <span className="text-xs font-bold bg-white/80 px-2.5 py-1 rounded-full text-teal-800">
                Patient View
              </span>
            </div>

            {/* Token Input Search */}
            <div className="mb-5">
              <label className="text-[11px] font-black text-teal-800 uppercase tracking-wider block mb-1">
                Enter Your Token Number
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchTokenInput}
                  onChange={(e) => setSearchTokenInput(e.target.value)}
                  placeholder="e.g. A-028"
                  className="clay-input w-full p-3 font-mono text-base font-black tracking-wider uppercase text-slate-800 pr-10"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>
            </div>

            {/* Selected User Token Card Display */}
            {userApt ? (
              <div className="clay-card p-5 flex flex-col gap-4 border border-white/80">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Token</span>
                    <span className="text-3xl font-black text-sky-800 font-mono">{userApt.tokenId}</span>
                  </div>
                  <StatusBadge status={userApt.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-200/80 text-xs font-semibold text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Token</span>
                    <span className="font-extrabold text-slate-800">{currentConsultation?.tokenId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Patients Ahead</span>
                    <span className="font-extrabold text-amber-600">{patientsAhead} Patients</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Waiting Time</span>
                    <span className="font-extrabold text-sky-700">~{estWaitMinutes} mins</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Doctor</span>
                    <span className="font-extrabold text-slate-800 truncate">{userApt.doctorName}</span>
                  </div>
                </div>

                {/* Live Progress Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Queue Progress</span>
                    <span>{patientsAhead === 0 ? 'Your Turn Next!' : `${patientsAhead} ahead`}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(15, 100 - patientsAhead * 18))}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="clay-card p-6 text-center text-xs font-bold text-slate-500">
                Token <span className="font-mono font-extrabold text-slate-800">{lookupToken}</span> not found in today's active list. Try searching another token like A-028 or A-024.
              </div>
            )}
          </ClayCard>
        </div>
      </div>
    </div>
  );
};
