import './clinic-modules.css';
import { SectionPicker, WorkspaceHeading } from '../components/common/WorkspaceControls';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { Sidebar } from '../components/common/Sidebar';
import { WhatsAppReminder } from '../types';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Calendar, 
  Smartphone, 
  RefreshCw 
} from 'lucide-react';

export const WhatsAppReminderView: React.FC = () => {
  const { reminders, sendWhatsApp, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'Scheduled' | 'Sent' | 'Pending'>('ALL');
  const [previewReminder, setPreviewReminder] = useState<WhatsAppReminder | null>(reminders[0] || null);

  const totalCount = reminders.length;
  const sentCount = reminders.filter((r) => r.status === 'Sent').length;
  const scheduledCount = reminders.filter((r) => r.status === 'Scheduled').length;
  const pendingCount = reminders.filter((r) => r.status === 'Pending').length;

  const filteredReminders = reminders.filter((r) =>
    activeTab === 'ALL' ? true : r.status === activeTab
  );

  return (
    <div className="workspace w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-5 flex flex-col lg:flex-row gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 flex flex-col gap-4">
        <WorkspaceHeading title="WhatsApp reminders">
          <button className="work-action primary" onClick={() => addToast('Bulk Queue Sent 💬', '4 pending WhatsApp reminders dispatched.', 'success')}>
            <Send size={16} /> Dispatch pending alerts
          </button>
        </WorkspaceHeading>
        <dl className="module-summary">
          <div><dt>Total reminders</dt><dd>{totalCount}</dd></div><div><dt>Sent</dt><dd>{sentCount}</dd></div>
          <div><dt>Scheduled</dt><dd>{scheduledCount}</dd></div><div><dt>Pending</dt><dd>{pendingCount}</dd></div>
        </dl>

        {/* Main Grid: Reminders List + WhatsApp Phone Chat Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reminders List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <SectionPicker label="Reminder status" value={activeTab} onChange={setActiveTab} options={[
              { id: 'ALL', label: 'All' }, { id: 'Scheduled', label: 'Scheduled' }, { id: 'Sent', label: 'Sent' }, { id: 'Pending', label: 'Pending' }
            ]} />
            {/* Reminder Cards */}
            <div className="flex flex-col gap-3">
              {filteredReminders.map((rem) => (
                <ClayCard
                  key={rem.id}
                  onClick={() => setPreviewReminder(rem)}
                  hoverEffect
                  className={`p-4 cursor-pointer border-2 ${
                    previewReminder?.id === rem.id ? 'border-emerald-500 clay-card-mint' : 'border-transparent'
                  }`}
                >
                  <div className="module-section-heading pb-2 border-b border-slate-200/80">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        {rem.type}
                      </span>
                      <span className="text-xs font-extrabold text-slate-800">{rem.patientName}</span>
                    </div>

                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      rem.status === 'Sent' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rem.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-semibold text-slate-700 flex flex-col gap-1">
                    <div>Appointment: <strong className="text-slate-900">{rem.appointmentDate} at {rem.appointmentTime}</strong></div>
                    <div>Doctor: {rem.doctorName} • Phone: {rem.phone}</div>
                  </div>

                  {/* Actions */}
                  <div className="module-section-heading mt-3 pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 font-bold">Scheduled for: {rem.scheduledFor}</span>

                    <div className="flex items-center gap-2">
                      {rem.status !== 'Sent' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendWhatsApp(rem.id);
                          }}
                          className="px-3 py-1 rounded-xl clay-btn-mint text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Now
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToast('Rescheduled', 'Reminder timing updated.', 'info');
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </ClayCard>
              ))}
            </div>
          </div>

          {/* WhatsApp Chat Preview Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm clay-card p-4 border-4 border-slate-800 rounded-[32px] bg-emerald-950/90 text-white shadow-2xl">
              {/* Phone Header */}
              <div className="bg-emerald-900/90 p-3 rounded-2xl flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-lg">
                  🦷
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Shriya Multispeciality Dental Clinic</h4>
                  <span className="text-[10px] font-bold text-emerald-300">Official Business Account ✓</span>
                </div>
              </div>

              {/* Chat Bubble */}
              {previewReminder ? (
                <div className="bg-emerald-800/80 p-4 rounded-2xl border border-emerald-700/60 text-xs leading-relaxed text-emerald-50 shadow-inner my-4">
                  <div className="font-bold text-emerald-300 mb-1">
                    🟢 {previewReminder.type} Alert
                  </div>
                  <p className="whitespace-pre-line">{previewReminder.messageText}</p>

                  <div className="mt-3 pt-2 border-t border-emerald-700/60 text-[10px] text-emerald-300 flex justify-between">
                    <span>Target: {previewReminder.phone}</span>
                    <span>Status: {previewReminder.status}</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-emerald-300 font-bold">
                  Select a reminder to preview WhatsApp message bubble.
                </div>
              )}

              {/* Action */}
              {previewReminder && previewReminder.status !== 'Sent' && (
                <ClayButton
                  variant="mint"
                  size="md"
                  className="w-full mt-2"
                  onClick={() => sendWhatsApp(previewReminder.id)}
                  icon={<Send className="w-4 h-4" />}
                >
                  Simulate Send to {previewReminder.patientName}
                </ClayButton>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
