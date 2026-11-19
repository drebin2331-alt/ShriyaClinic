import React from 'react';
import { AlertCircle, ArrowUpRight, MessageCircle, Phone, Ticket } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { PatientRecord } from '../../types';

const visitDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function displayVisit(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value + 'T12:00:00');
  return Number.isNaN(date.valueOf()) ? value : visitDate.format(date);
}

export function PatientRosterCard({
  patient,
  onOpen,
  onIssueToken
}: {
  patient: PatientRecord;
  onOpen: () => void;
  onIssueToken?: (patient: PatientRecord) => void;
}) {
  const { tokens = [], setActiveView, addToast } = useApp();

  const number = (patient.phone || '').replace(/\D/g, '');
  const chatNumber = number.length === 10 ? '91' + number : number;
  const greeting = encodeURIComponent('Hello ' + patient.name + ', this is Shriya Multispeciality Dental Clinic.');
  const allergies = patient.medicalHistory?.allergies || [];
  const balance = patient.outstandingBalance || 0;

  // Check if patient already has an active queue token today
  const activeToken = tokens.find(
    (t) =>
      (t.patientId === patient.id ||
        (t.patientName && t.patientName.toLowerCase() === patient.name.toLowerCase()) ||
        (number && t.patientPhone && t.patientPhone.replace(/\D/g, '') === number)) &&
      t.status !== 'Completed' &&
      t.status !== 'Cancelled'
  );

  return (
    <article className="patient-roster-card">
      <div className="patient-record-heading">
        <span className="patient-monogram" aria-hidden="true">{patient.name.trim().charAt(0).toUpperCase()}</span>
        <div>
          <h3>{patient.name}</h3>
          <p className="patient-identifiers">
            <span className="patient-record-id">{patient.opNumber || patient.id}</span>
            <span>{[patient.age != null && patient.age + 'y', patient.gender].filter(Boolean).join(' · ')}</span>
          </p>
        </div>
      </div>

      <div className="record-statuses">
        {patient.status && <span className="record-status">{patient.status}</span>}
        <span className={balance > 0 ? 'balance-due' : 'balance-clear'}>
          {balance > 0 ? '₹' + balance.toLocaleString('en-IN') + ' due' : 'Balance settled'}
        </span>
        {activeToken && (
          <span
            className="record-status record-status-token"
            style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a' }}
          >
            🎟️ #{activeToken.tokenNumber} ({activeToken.status})
          </span>
        )}
      </div>

      <dl className="record-facts">
        <div><dt>Phone</dt><dd>{patient.phone || '—'}</dd></div>
        <div><dt>Doctor</dt><dd>{patient.assignedDoctorName || 'Unassigned'}</dd></div>
        <div><dt>First visit</dt><dd>{displayVisit(patient.firstVisitDate, '—')}</dd></div>
        <div><dt>Next visit</dt><dd>{displayVisit(patient.upcomingAppointmentDate, 'None scheduled')}</dd></div>
      </dl>
      {allergies.length > 0 && (
        <p className="record-alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span><strong>Allergy alert</strong> · {allergies.join(', ')}</span>
        </p>
      )}

      <div className="patient-record-actions">
        <button
          type="button"
          className="work-action primary record-open"
          onClick={onOpen}
          aria-label={'Open EMR for ' + patient.name}
        >
          Open EMR <ArrowUpRight size={16} />
        </button>

        {activeToken ? (
          <button
            type="button"
            className="work-action record-token-action active-token"
            onClick={(e) => {
              e.stopPropagation();
              setActiveView('token-control');
              addToast(
                'Live Queue',
                `Viewing Token #${activeToken.tokenNumber} (${activeToken.status}) for ${patient.name}.`,
                'info'
              );
            }}
            title="View in Live Queue"
            aria-label={`View Token #${activeToken.tokenNumber} for ${patient.name}`}
          >
            <Ticket size={16} className="text-amber-600" /> Token #{activeToken.tokenNumber}
          </button>
        ) : (
          <button
            type="button"
            className="work-action record-token-action"
            onClick={(e) => {
              e.stopPropagation();
              if (onIssueToken) {
                onIssueToken(patient);
              }
            }}
            title="Issue OPD Queue Token for Today"
            aria-label={'Issue Token for ' + patient.name}
          >
            <Ticket size={16} className="text-emerald-700" /> Issue Token
          </button>
        )}

        {patient.phone && (
          <>
            <a
              className="work-action"
              href={'tel:' + patient.phone}
              aria-label={'Call ' + patient.name}
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={16} /> Call
            </a>
            <a
              className="work-action"
              href={'https://wa.me/' + chatNumber + '?text=' + greeting}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={'Chat with ' + patient.name + ' on WhatsApp'}
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle size={16} /> Chat
            </a>
          </>
        )}
      </div>
    </article>
  );
}

