import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Volume2, Sparkles, Tv2, Clock, CheckCircle2 } from 'lucide-react';

export const ReceptionTVView: React.FC = () => {
  const { tokens, setActiveView } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Public TV: Priority to CALLED tokens, then IN CONSULTATION tokens
  const calledToken = tokens.find((t) => t.status === 'Called');
  const inConsultationToken = tokens.find((t) => t.status === 'In Consultation');
  const nowServingToken = calledToken || inConsultationToken;

  // Next tokens in waiting line
  const nextWaiting = tokens
    .filter((t) => t.status === 'Waiting')
    .slice(0, 5);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      // AudioContext fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex flex-col justify-between select-none">
      {/* Top TV Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-sky-500 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-sky-500/30">
            🦷
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">SHRIYA MULTISPECIALITY DENTAL CLINIC</h1>
            <p className="text-xs font-bold text-sky-400 tracking-widest uppercase">
              Clinic Queue & Token Display System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xl font-black font-mono text-slate-300">
            <Clock className="w-5 h-5 text-sky-400" />
            <span>{currentTime}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>LIVE QUEUE FEED</span>
          </div>

          <button
            onClick={() => setActiveView('staff-token-control')}
            className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Exit TV Mode
          </button>
        </div>
      </div>

      {/* Main Grid for Distant Viewing */}
      <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
        {/* NOW SERVING - GIANT PRIVACY-SAFE DISPLAY */}
        <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 p-8 md:p-12 rounded-[36px] border-4 border-sky-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="px-5 py-2 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 font-black text-sm tracking-widest uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              NOW SERVING
            </span>

            {nowServingToken && (
              <span className="text-slate-300 font-bold text-sm bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
                {nowServingToken.doctorName}
              </span>
            )}
          </div>

          {nowServingToken ? (
            <div className="my-8 text-center lg:text-left">
              <div className="text-xs font-black tracking-widest text-sky-400 uppercase mb-2">
                ACTIVE QUEUE TICKET
              </div>
              <div className="text-9xl md:text-[160px] font-black text-sky-400 font-mono tracking-tight leading-none drop-shadow-2xl">
                {nowServingToken.tokenNumber}
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-sky-950/60 border border-sky-400/30 inline-block">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  PLEASE PROCEED TO:
                </span>
                <span className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {nowServingToken.doctorName ? `${nowServingToken.doctorName}'s Cabin` : "Doctor's Consulting Room"}
                </span>
              </div>
            </div>
          ) : (
            <div className="my-16 text-center text-slate-500 font-bold text-3xl">
              Consultation Suites Ready • Next Patient Announcement Pending...
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs font-bold text-slate-400">
            <span>Please watch for your token number on this screen</span>
            <button
              onClick={playChime}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Volume2 className="w-4 h-4" /> Audio Announcement
            </button>
          </div>
        </div>

        {/* NEXT PATIENTS DISPLAY - TOKENS ONLY (NO SENSITIVE DATA) */}
        <div className="lg:col-span-4 bg-slate-900/90 p-8 rounded-[36px] border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-xs font-black tracking-widest text-slate-400 uppercase mb-6 flex items-center justify-between">
              <span>NEXT IN LINE</span>
              <span className="text-sky-400 font-mono text-sm">{nextWaiting.length} In Queue</span>
            </div>

            <div className="flex flex-col gap-3">
              {nextWaiting.map((tok, i) => (
                <div
                  key={tok.id}
                  className={`p-4 rounded-2xl flex items-center justify-between border ${
                    i === 0
                      ? 'bg-sky-950/80 border-sky-500/60 text-sky-200'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-500 font-mono">#{i + 1}</span>
                    <span className="text-3xl font-black font-mono text-white">
                      {tok.tokenNumber}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    {tok.doctorName}
                  </span>
                </div>
              ))}

              {nextWaiting.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 font-bold">
                  No other waiting tickets.
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 font-medium">
            Shriya Multispeciality Dental Clinic • Digital Reception Display
          </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span>Emergency & Triage assistance available at the reception desk</span>
        <span>Wifi: <strong>ShriyaDental_Guest</strong> • Password: <strong>healthyteeth</strong></span>
      </div>
    </div>
  );
};
