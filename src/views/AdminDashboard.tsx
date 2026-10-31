import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ClaySelect } from '../components/common/ClaySelect';
import { StatusBadge } from '../components/common/StatusBadge';
import { Sidebar } from '../components/common/Sidebar';
import { PatientRecord } from '../types';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Volume2, 
  MessageSquare, 
  Plus,
  FileText,
  UserPlus,
  ArrowRight,
  Stethoscope,
  CreditCard,
  Briefcase,
  AlertTriangle
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    appointments, 
    doctors, 
    patients = [],
    invoices = [],
    payments = [],
    updateAppointmentStatus, 
    callNextPatient, 
    setActiveView, 
    setSelectedPatientForDetail,
    addToast 
  } = useApp();

  const normalizePhone = (phoneStr?: string): string => {
    if (!phoneStr) return '';
    return phoneStr.replace(/\D/g, '').slice(-10);
  };

  const getExistingPatient = (phone?: string, name?: string): PatientRecord | undefined => {
    const pPhone = normalizePhone(phone);
    const pName = (name || '').trim().toLowerCase();
    return patients.find((p) => {
      const matchPhone = pPhone && normalizePhone(p.phone) === pPhone;
      const matchName = pName && p.name.trim().toLowerCase() === pName;
      return matchPhone || matchName;
    });
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'pipeline' | 'queue' | 'financial'>('pipeline');

  // Stats strictly calculated from live records
  const totalAppointments = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === 'Waiting').length;
  const inConsultationCount = appointments.filter((a) => a.status === 'In Consultation').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const cancelledCount = appointments.filter((a) => a.status === 'Cancelled').length;

  const totalCollectedFromPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCompletedAppointmentsRevenue = appointments
    .filter((a) => a.status === 'Completed')
    .reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalRevenue = totalCollectedFromPayments > 0 ? totalCollectedFromPayments : totalCompletedAppointmentsRevenue;

  const outstandingBalance = invoices
    .filter((i) => i.status !== 'Paid')
    .reduce((sum, i) => sum + (i.balance || 0), 0);
  const pendingInvoicesCount = invoices.filter((i) => i.status !== 'Paid').length;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.tokenId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const matchesDoctor = doctorFilter === 'ALL' || apt.doctorId === doctorFilter;

    return matchesSearch && matchesStatus && matchesDoctor;
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-6 py-5 flex gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Top Header Row matching screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">Operational and commercial activity overview</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setStatusFilter(statusFilter === 'ALL' ? 'Waiting' : 'ALL')}
              className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>

            <button 
              onClick={() => setActiveView('token-control')}
              className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span>View Active Jobs</span>
            </button>
          </div>
        </div>

        {/* Attention Alert Banner matching screenshot */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="w-4 h-4 rounded-full border border-amber-500 text-amber-700 flex items-center justify-center font-bold text-[10px]">
              !
            </span>
            <span>
              <strong className="font-semibold text-amber-950">Attention needed:</strong> {waitingCount} patient(s) in waiting queue · {inConsultationCount} in active consultation
            </span>
          </div>

          <button 
            onClick={() => setActiveView('token-control')}
            className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 hover:underline cursor-pointer shrink-0"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Stat KPI Cards matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Enquiries / Queue */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-medium text-slate-600">Enquiries & Queue</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-slate-900">{waitingCount + inConsultationCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {waitingCount} new · {inConsultationCount} in progress
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setActiveView('token-control')} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="View Queue"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Quotations / Appointments */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-medium text-slate-600">Quotations & Visits</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-slate-900">{totalAppointments}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                <span className="text-emerald-700 font-medium">{completedCount} accepted</span> · {cancelledCount} rejected
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setActiveView('appointment-mgmt')} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="View Appointments"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Active Consultations */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-medium text-slate-600">Active Consultations</span>
              <Stethoscope className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-slate-900">{inConsultationCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {waitingCount} waiting · {completedCount} completed
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setActiveView('token-control')} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="View Queue Console"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 4: Outstanding Balance */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-xs font-medium text-slate-600">Outstanding Balance</span>
              <CreditCard className="w-4 h-4 text-slate-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-bold text-slate-900">₹{outstandingBalance.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Outstanding clinic balance
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setActiveView('admin-billing')} 
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                title="View Invoices & Billing"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation matching screenshot */}
        <div className="border-b border-slate-200 flex items-center gap-6 mt-1">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`pb-2.5 text-xs font-semibold cursor-pointer transition-colors relative ${
              activeTab === 'pipeline'
                ? 'text-emerald-800 border-b-2 border-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pipeline Flow
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-2.5 text-xs font-semibold cursor-pointer transition-colors relative ${
              activeTab === 'queue'
                ? 'text-emerald-800 border-b-2 border-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Work Queue
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`pb-2.5 text-xs font-semibold cursor-pointer transition-colors relative ${
              activeTab === 'financial'
                ? 'text-emerald-800 border-b-2 border-emerald-800'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Financial Summary
          </button>
        </div>

        {/* Pipeline Strip matching screenshot */}
        {activeTab === 'pipeline' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Step 1 */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Enquiries</div>
                <div className="text-xl font-bold text-slate-800 my-1">{waitingCount}</div>
                <div className="text-[10px] text-slate-400">0 unassigned</div>
              </div>

              {/* Step 2 */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">2. Quotations</div>
                <div className="text-xl font-bold text-slate-800 my-1">{totalAppointments}</div>
                <div className="text-[10px] text-slate-400">Proposals</div>
              </div>

              {/* Step 3 */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">3. Accepted</div>
                <div className="text-xl font-bold text-emerald-700 my-1">{waitingCount}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Ready for Job</div>
              </div>

              {/* Step 4 */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">4. Consultations</div>
                <div className="text-xl font-bold text-slate-800 my-1">{inConsultationCount}</div>
                <div className="text-[10px] text-slate-400">Clinical examination</div>
              </div>

              {/* Step 5 */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">5. Invoices</div>
                <div className="text-xl font-bold text-slate-800 my-1">{pendingInvoicesCount}</div>
                <div className="text-[10px] text-slate-400">{pendingInvoicesCount} pending</div>
              </div>

              {/* Step 6 */}
              <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50/50">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">6. Settlements</div>
                <div className="text-xl font-bold text-emerald-700 my-1">{completedCount}</div>
                <div className="text-[10px] text-emerald-600 font-medium">Cleared payments</div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button 
                onClick={() => setActiveView('token-control')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Interactive Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Financial Summary Tab Panel */}
        {activeTab === 'financial' && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Commercial & Financial Summary</h3>
                <p className="text-xs text-slate-500">Overview of collections, unpaid dues, and patient settlements</p>
              </div>

              <button
                onClick={() => setActiveView('admin-billing')}
                className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Open Full Billing & Payment Center</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg bg-emerald-50/80 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">Total Revenue Collected</span>
                <div className="text-xl font-bold text-emerald-800 mt-1">₹{totalRevenue.toLocaleString()}</div>
                <span className="text-[10px] text-emerald-700 mt-0.5 block">{completedCount} consultations settled</span>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Outstanding Receivables</span>
                <div className="text-xl font-bold text-amber-800 mt-1">₹{outstandingBalance.toLocaleString()}</div>
                <span className="text-[10px] text-amber-700 mt-0.5 block">Pending patient dues & lab items</span>
              </div>

              <div className="p-3.5 rounded-lg bg-sky-50/80 border border-sky-200">
                <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">Today's Settlements</span>
                <div className="text-xl font-bold text-sky-800 mt-1">{completedCount} Transactions</div>
                <span className="text-[10px] text-sky-700 mt-0.5 block">UPI & Card POS verified</span>
              </div>
            </div>
          </div>
        )}

        {/* Table / Queue Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <div className="relative flex items-center w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search token, patient name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-1.5 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-36">
                <ClaySelect
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Statuses' },
                    { value: 'Waiting', label: 'Waiting' },
                    { value: 'In Consultation', label: 'In Consultation' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'Cancelled', label: 'Cancelled' },
                    { value: 'On Hold', label: 'On Hold' }
                  ]}
                />
              </div>

              <div className="w-40">
                <ClaySelect
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Doctors' },
                    ...doctors.map((d) => ({ value: d.id, label: d.name }))
                  ]}
                />
              </div>

              <button
                onClick={callNextPatient}
                className="px-3 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Call Next Patient in queue"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Call Next</span>
              </button>
            </div>
          </div>

          {/* Queue Data Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Token</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((apt) => {
                    const existingPat = getExistingPatient(apt.patientPhone, apt.patientName);

                    return (
                      <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {apt.tokenId}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900">{apt.patientName}</span>
                            {existingPat && (
                              <span 
                                onClick={() => {
                                  setSelectedPatientForDetail(existingPat);
                                  setActiveView('patient-profile');
                                }}
                                className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer hover:bg-emerald-100"
                                title="Click to open EMR"
                              >
                                EMR
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{apt.patientPhone}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{apt.doctorName}</div>
                          <div className="text-[10px] text-slate-400">{apt.doctorSpecialty}</div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{apt.timeSlot}</div>
                          <div className="text-[10px] text-slate-400">{apt.date}</div>
                        </td>

                        <td className="py-3 px-3">
                          <StatusBadge status={apt.status} />
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {existingPat && (
                              <button
                                onClick={() => {
                                  setSelectedPatientForDetail(existingPat);
                                  setActiveView('patient-profile');
                                  addToast('Opened EMR Profile 🦷', `Viewing ${existingPat.name}'s chart.`, 'success');
                                }}
                                className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                                title="Open EMR Chart"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {apt.status === 'Waiting' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'In Consultation')}
                                className="px-2 py-1 rounded bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-semibold cursor-pointer"
                                title="Call into consultation room"
                              >
                                Call In
                              </button>
                            )}

                            {apt.status === 'In Consultation' && (
                              <button
                                onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                                className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold cursor-pointer"
                                title="Mark consultation completed"
                              >
                                Complete ✓
                              </button>
                            )}

                            <button
                              onClick={() => {
                                addToast('WhatsApp Alert', `Message sent to ${apt.patientName}`, 'info');
                              }}
                              className="p-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer"
                              title="Send WhatsApp update"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                              className="p-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer"
                              title="Cancel appointment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      No records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
