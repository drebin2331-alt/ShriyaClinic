import './clinic-modules.css';
import { SectionPicker, WorkspaceHeading } from '../components/common/WorkspaceControls';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClayCard } from '../components/common/ClayCard';
import { ClayButton } from '../components/common/ClayButton';
import { Sidebar } from '../components/common/Sidebar';
import { WhatsAppReminder } from '../types';
import { 
  Send, 
  User, 
  Users, 
  Megaphone, 
  Copy, 
  Check, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  Clock,
  Sparkles
} from 'lucide-react';
import { ComposeWhatsAppModal } from '../components/dental/ComposeWhatsAppModal';
import { openWhatsAppChat } from '../utils/whatsapp';

export const WhatsAppReminderView: React.FC = () => {
  const { 
    reminders, 
    sendWhatsApp, 
    deleteWhatsAppReminder, 
    dispatchAllPendingWhatsApp, 
    addToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ALL' | 'Scheduled' | 'Sent' | 'Pending'>('ALL');
  const [previewReminder, setPreviewReminder] = useState<WhatsAppReminder | null>(reminders[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<'individual' | 'broadcast'>('individual');

  const totalCount = reminders.length;
  const sentCount = reminders.filter((r) => r.status === 'Sent').length;
  const scheduledCount = reminders.filter((r) => r.status === 'Scheduled').length;
  const pendingCount = reminders.filter((r) => r.status === 'Pending').length;

  const filteredReminders = reminders.filter((r) =>
    activeTab === 'ALL' ? true : r.status === activeTab
  );

  const handleOpenCompose = (mode: 'individual' | 'broadcast') => {
    setComposeMode(mode);
    setIsComposeOpen(true);
  };

  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Copied to Clipboard 📋', 'Message text ready to paste.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="workspace w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-5 flex flex-col lg:flex-row gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Workspace Heading with Real Action Buttons */}
        <WorkspaceHeading title="WhatsApp Reminders & Clinic Notices">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenCompose('individual')}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <User size={14} /> Individual Message
            </button>
            <button
              onClick={() => handleOpenCompose('broadcast')}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Megaphone size={14} /> Broadcast News / Notice
            </button>
            <button
              onClick={dispatchAllPendingWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Dispatch all pending alerts"
            >
              <Send size={14} /> Dispatch Pending ({pendingCount})
            </button>
          </div>
        </WorkspaceHeading>

        {/* Statistics Bar */}
        <dl className="module-summary">
          <div><dt>Total reminders</dt><dd>{totalCount}</dd></div>
          <div><dt>Sent</dt><dd className="text-emerald-700">{sentCount}</dd></div>
          <div><dt>Scheduled</dt><dd className="text-blue-700">{scheduledCount}</dd></div>
          <div><dt>Pending</dt><dd className="text-amber-700">{pendingCount}</dd></div>
        </dl>

        {/* Main Grid: Reminders List + WhatsApp Phone Chat Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Reminders List Column */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <SectionPicker 
              label="Reminder status" 
              value={activeTab} 
              onChange={setActiveTab} 
              options={[
                { id: 'ALL', label: 'All' }, 
                { id: 'Scheduled', label: 'Scheduled' }, 
                { id: 'Sent', label: 'Sent' }, 
                { id: 'Pending', label: 'Pending' }
              ]} 
            />

            {/* Reminder Cards */}
            <div className="flex flex-col gap-3">
              {filteredReminders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">No {activeTab.toLowerCase()} WhatsApp messages found</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Compose an individual patient message or broadcast clinic news to populate the queue.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleOpenCompose('individual')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      + Send Individual Message
                    </button>
                    <button
                      onClick={() => handleOpenCompose('broadcast')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold"
                    >
                      📢 Broadcast News
                    </button>
                  </div>
                </div>
              ) : (
                filteredReminders.map((rem) => (
                  <ClayCard
                    key={rem.id}
                    onClick={() => setPreviewReminder(rem)}
                    hoverEffect
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      previewReminder?.id === rem.id ? 'border-emerald-500 bg-emerald-50/20 shadow-sm' : 'border-transparent'
                    }`}
                  >
                    <div className="module-section-heading pb-2 border-b border-slate-200/80">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                          {rem.type}
                        </span>
                        {rem.category === 'Broadcast' && (
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[9px] flex items-center gap-1">
                            <Megaphone size={10} /> Broadcast
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-slate-800">{rem.patientName}</span>
                      </div>

                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        rem.status === 'Sent' 
                          ? 'bg-emerald-500 text-white' 
                          : rem.status === 'Scheduled' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rem.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-slate-700 flex flex-col gap-1">
                      {rem.appointmentDate && (
                        <div>
                          Appointment: <strong className="text-slate-900">{rem.appointmentDate} {rem.appointmentTime ? `at ${rem.appointmentTime}` : ''}</strong>
                        </div>
                      )}
                      <div className="text-slate-500 text-[11px]">
                        Doctor: {rem.doctorName || 'Dental Specialist'} • Phone: <span className="font-mono font-bold text-slate-700">{rem.phone}</span>
                      </div>
                      <p className="mt-1 text-slate-600 line-clamp-2 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200/50">
                        {rem.messageText}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="module-section-heading mt-3 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        <Clock size={11} /> {rem.scheduledFor}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {rem.status !== 'Sent' && rem.phone && rem.phone !== 'Multiple (Broadcast)' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sendWhatsApp(rem.id, true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" /> Send Now
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyMessage(rem.messageText, rem.id);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Copy message"
                        >
                          {copiedId === rem.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWhatsAppReminder(rem.id);
                          }}
                          className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </ClayCard>
                ))
              )}
            </div>
          </div>

          {/* WhatsApp Chat Preview Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center sticky top-4">
            <div className="w-full max-w-sm clay-card p-4 border border-slate-200 rounded-2xl bg-white text-slate-800 self-start shadow-md">
              {/* WhatsApp Phone Header */}
              <div className="bg-[#075e54] p-3 rounded-xl flex items-center gap-3 mb-3 text-white">
                <div className="w-9 h-9 rounded-full bg-emerald-400/30 text-white flex items-center justify-center font-black text-base border border-emerald-300/40">
                  🦷
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-extrabold text-white truncate">Shriya Multispeciality Dental</h4>
                  <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block"></span>
                    Official Business Account ✓ • +91 94003 20890
                  </span>
                </div>
              </div>

              {/* Chat Bubble Simulation */}
              {previewReminder ? (
                <div className="bg-[#efeae2] p-3.5 rounded-xl border border-slate-300 text-xs leading-relaxed text-slate-800 shadow-inner my-2 flex flex-col gap-2 min-h-[220px]">
                  <div className="self-center bg-[#ffeecd] text-[#54656f] text-[9px] px-2 py-0.5 rounded shadow-xs text-center font-sans">
                    🔒 Official verified communication
                  </div>

                  <div className="self-start max-w-[95%] bg-white rounded-lg rounded-tl-none p-3 shadow-sm border border-slate-200">
                    <div className="font-bold text-emerald-800 text-[11px] mb-1 flex items-center gap-1">
                      <span>🟢 {previewReminder.type}</span>
                    </div>
                    <p className="whitespace-pre-line text-slate-800 text-[11px] font-sans leading-relaxed">
                      {previewReminder.messageText}
                    </p>

                    <div className="mt-2 pt-1 border-t border-slate-100 text-[9px] text-slate-400 flex justify-between">
                      <span>{previewReminder.patientName}</span>
                      <span>{previewReminder.status} ✓✓</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 text-[10px] text-slate-500 flex justify-between bg-white/70 p-2 rounded border border-slate-200">
                    <span className="truncate">Target: <strong>{previewReminder.phone}</strong></span>
                    <span className="font-bold text-emerald-800">{previewReminder.status}</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200 my-2">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                  Select a reminder from the list to preview its formatted WhatsApp message.
                </div>
              )}

              {/* Actions below preview */}
              {previewReminder && (
                <div className="flex flex-col gap-2 mt-3">
                  {previewReminder.phone && previewReminder.phone !== 'Multiple (Broadcast)' && (
                    <ClayButton
                      variant="mint"
                      size="md"
                      className="w-full justify-center text-xs font-bold"
                      onClick={() => {
                        sendWhatsApp(previewReminder.id, true);
                      }}
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      Open in WhatsApp Web / App
                    </ClayButton>
                  )}

                  <button
                    onClick={() => handleCopyMessage(previewReminder.messageText, previewReminder.id)}
                    className="w-full py-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {copiedId === previewReminder.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === previewReminder.id ? 'Copied to Clipboard!' : 'Copy Formatted Text'}
                  </button>
                </div>
              )}

              {/* Quick Actions Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => handleOpenCompose('individual')}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                >
                  + New Message
                </button>
                <button
                  onClick={() => handleOpenCompose('broadcast')}
                  className="text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
                >
                  📢 Broadcast News
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Compose WhatsApp Message Modal */}
      <ComposeWhatsAppModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        initialMode={composeMode}
      />
    </div>
  );
};
