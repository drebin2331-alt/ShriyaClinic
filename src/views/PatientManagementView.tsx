import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PatientRecord, PatientStatus, ViewMode } from '../types';
import { NewPatientRegistrationModal } from '../components/dental/NewPatientRegistrationModal';
import { IssueTokenModal } from '../components/dental/IssueTokenModal';
import { PatientRosterCard } from '../components/dental/PatientRosterCard';
import { WorkspaceHeading } from '../components/common/WorkspaceControls';
import { Sidebar } from '../components/common/Sidebar';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Mail,
  Ticket
} from 'lucide-react';

export const PatientManagementView: React.FC = () => {
  const { 
    patients = [], 
    tokens = [],
    setSelectedPatientForDetail, 
    setActiveView, 
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientStatus | 'With Balance'>('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [tokenModalPatient, setTokenModalPatient] = useState<PatientRecord | null>(null);

  // Filter patients by query and selected filter chip
  const filteredPatients = patients.filter((patient) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      patient.name.toLowerCase().includes(q) ||
      patient.id.toLowerCase().includes(q) ||
      patient.opNumber?.toLowerCase().includes(q) ||
      patient.phone.includes(q) ||
      patient.email?.toLowerCase().includes(q) ||
      patient.assignedDoctorName?.toLowerCase().includes(q) ||
      patient.currentTreatment?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === 'All') return true;
    if (statusFilter === 'With Balance') return (patient.outstandingBalance || 0) > 0;
    return patient.status === statusFilter;
  });

  const handleOpenPatientEMR = (patient: PatientRecord, targetView: ViewMode = 'patient-detail') => {
    setSelectedPatientForDetail(patient);
    setActiveView(targetView);
    addToast('Patient Record Opened', `Loaded clinical EMR for ${patient.name}.`, 'info');
  };

  const statusOptions: Array<'All' | PatientStatus | 'With Balance'> = [
    'All',
    'Active Treatment',
    'New Patient',
    'Follow-up',
    'Treatment Completed',
    'With Balance'
  ];

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'Active Treatment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse"></span>
            Active Care
          </span>
        );
      case 'New Patient':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            New Patient
          </span>
        );
      case 'Follow-up':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Routine Checkup
          </span>
        );
      case 'Treatment Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">
            <CheckCircle2 className="w-3 h-3 text-slate-500" />
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const totalOutstandingBalance = patients.reduce((acc, p) => acc + (p.outstandingBalance || 0), 0);

  return (
    <div className="workspace w-full max-w-full mx-auto px-2.5 sm:px-4 lg:px-6 py-3 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
      <Sidebar type="admin" />

      <main className="flex-1 min-w-0 w-full max-w-full space-y-4 sm:space-y-6 animate-in fade-in">
        <WorkspaceHeading title="Patient directory" detail={patients.length + ' registered patients'}>
          <button className="work-action primary" onClick={() => setShowRegisterModal(true)}><Plus size={18} /> Register patient</button>
        </WorkspaceHeading>

        <div className="directory-tools">
          <div className="work-search">
            <Search aria-hidden="true" size={18} />
            <input type="search" aria-label="Search patients by name, OP number, phone, doctor or treatment"
              placeholder="Search patients or OP number" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} />
          </div>
          <label className="work-select">Patient status
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as typeof statusFilter)}>
              {statusOptions.map(status => <option value={status} key={status}>{status === 'All' ? 'All patients' : status}</option>)}
            </select>
          </label>
        </div>

        <section className="roster">
          <div className="roster-heading">
            <h2>{filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}</h2>
            <details className="roster-totals">
              <summary>Directory totals</summary>
              <dl>
                <div><dt>Registered</dt><dd>{patients.length}</dd></div>
                <div><dt>Active treatment</dt><dd>{patients.filter(p => p.status === 'Active Treatment').length}</dd></div>
                <div><dt>Follow-ups</dt><dd>{patients.filter(p => p.status === 'Follow-up').length}</dd></div>
                <div><dt>Outstanding</dt><dd>₹{totalOutstandingBalance.toLocaleString('en-IN')}</dd></div>
              </dl>
            </details>
          </div>
          {filteredPatients.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">No patients found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No patients match the current search query or filter selection.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer border border-teal-200"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <>
              <ul className="patient-roster-list">
                {filteredPatients.map(patient => (
                  <li key={patient.id}>
                    <PatientRosterCard
                      patient={patient}
                      onOpen={() => handleOpenPatientEMR(patient)}
                      onIssueToken={(pat) => setTokenModalPatient(pat)}
                    />
                  </li>
                ))}
              </ul>
              {/* Desktop Full Master Table (>=768px) */}
              <div className="patient-roster-table overflow-x-auto">
                <table className="w-full text-left text-xs responsive-records">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">Patient Profile</th>
                      <th className="py-4 px-3">Patient & OP ID</th>
                      <th className="py-4 px-3">Contact</th>
                      <th className="py-4 px-3">Clinical Status</th>
                      <th className="py-4 px-3">Assigned Doctor</th>
                      <th className="py-4 px-3">Account Balance</th>
                      <th className="py-4 px-3">Visit History</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredPatients.map((patient) => {
                      const hasAllergy = patient.medicalHistory?.allergies && patient.medicalHistory.allergies.length > 0;
                      const balance = patient.outstandingBalance || 0;

                      return (
                        <tr
                          key={patient.id}
                          onClick={() => handleOpenPatientEMR(patient, 'patient-detail')}
                          className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                        >
                          {/* 1. Patient Profile */}
                          <td data-label="Patient Profile" className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                                {patient.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-extrabold text-xs text-slate-900 group-hover:text-teal-900 transition-colors block">
                                  {patient.name}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                  <span>{patient.age}y • {patient.gender}</span>
                                  {hasAllergy && (
                                    <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-0.5">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      {patient.medicalHistory.allergies[0]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Patient ID */}
                          <td data-label="Patient & OP ID" className="py-4 px-3">
                            <div className="font-mono font-bold text-teal-800 text-[11px]">
                              {patient.id}
                            </div>
                            {patient.opNumber && (
                              <div className="font-mono text-[10px] text-slate-400">
                                {patient.opNumber}
                              </div>
                            )}
                          </td>

                          {/* 3. Contact */}
                          <td data-label="Contact" className="py-4 px-3 text-slate-600 text-[11px]">
                            <div className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{patient.phone}</span>
                            </div>
                            {patient.email && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                                <Mail className="w-2.5 h-2.5" />
                                <span>{patient.email}</span>
                              </div>
                            )}
                          </td>

                          {/* 4. Clinical Status */}
                          <td data-label="Clinical Status" className="py-4 px-3">
                            {getStatusBadge(patient.status)}
                          </td>

                          {/* 5. Assigned Doctor */}
                          <td data-label="Assigned Doctor" className="py-4 px-3 font-semibold text-slate-700 text-[11px]">
                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 text-slate-800 inline-block">
                              {patient.assignedDoctorName || 'Unassigned'}
                            </span>
                          </td>

                          {/* 6. Balance */}
                          <td data-label="Account Balance" className="py-4 px-3">
                            {balance > 0 ? (
                              <span className="font-mono font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 text-[11px]">
                                ₹{balance.toLocaleString()}
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-[10px]">
                                Settled ✓
                              </span>
                            )}
                          </td>

                          {/* 7. Visit History / First Visit */}
                          <td data-label="Visit History" className="py-4 px-3 text-slate-600 font-medium text-[11px]">
                            {(!patient.visits || patient.visits.length === 0 || patient.totalVisits === 0) ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                                  ✨ 1st Visit Pending
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Reg: {patient.firstVisitDate || 'Today'}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-slate-800">{patient.lastVisit || patient.firstVisitDate}</span>
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {patient.totalVisits} visit{patient.totalVisits > 1 ? 's' : ''} • 1st: {patient.firstVisitDate || 'N/A'}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 8. Action */}
                          <td data-label="Actions" className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              {(() => {
                                const num = (patient.phone || '').replace(/\D/g, '');
                                const activeToken = tokens.find(
                                  (t) =>
                                    (t.patientId === patient.id ||
                                      (t.patientName && patient.name && t.patientName.toLowerCase() === patient.name.toLowerCase()) ||
                                      (num && t.patientPhone && t.patientPhone.replace(/\D/g, '') === num)) &&
                                    t.status !== 'Completed' &&
                                    t.status !== 'Cancelled' &&
                                    t.status !== 'Reception Follow-up'
                                );
                                if (activeToken) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveView('token-control');
                                        addToast(
                                          'Live Queue',
                                          `Viewing Token #${activeToken.tokenNumber} (${activeToken.status}) for ${patient.name}.`,
                                          'info'
                                        );
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-[11px] hover:bg-amber-100 transition-all cursor-pointer shadow-2xs"
                                      title={`Active Token #${activeToken.tokenNumber} (${activeToken.status})`}
                                    >
                                      <Ticket className="w-3.5 h-3.5 text-amber-700" />
                                      <span>#{activeToken.tokenNumber}</span>
                                    </button>
                                  );
                                }
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setTokenModalPatient(patient)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-[11px] hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs hover:shadow"
                                    title="Issue OPD Token for Today"
                                  >
                                    <Ticket className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Issue Token</span>
                                  </button>
                                );
                              })()}
                              <button
                                type="button"
                                onClick={() => handleOpenPatientEMR(patient, 'patient-detail')}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 text-white font-extrabold text-xs hover:bg-teal-800 transition-all cursor-pointer shadow-xs hover:shadow"
                              >
                                <span>Open EMR</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* New Patient Registration Modal */}
        <NewPatientRegistrationModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegisterPatient={(newPat) => {
            handleOpenPatientEMR(newPat, 'patient-detail');
          }}
          existingPatientCount={patients.length}
        />

        {/* Quick Issue OPD Token Modal */}
        <IssueTokenModal
          isOpen={!!tokenModalPatient}
          onClose={() => setTokenModalPatient(null)}
          patient={tokenModalPatient}
        />
      </main>
    </div>
  );
};

