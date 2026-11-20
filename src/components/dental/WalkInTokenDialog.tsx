import { UserPlus, X } from 'lucide-react';
import { ModalLayer } from '../common/ModalLayer';
import { ClayInput } from '../common/ClayInput';
import { ClaySelect } from '../common/ClaySelect';
import { ClayButton } from '../common/ClayButton';
import { PrioritySelector } from '../common/PrioritySelector';
import './walk-in-token.css';

type Gender = 'Male' | 'Female' | 'Other';
type Priority = 'Normal' | 'Urgent' | 'Emergency';

export function WalkInTokenDialog({ name, phone, age, gender, doctorId, reason, priority, doctors,
  onNameChange, onPhoneChange, onAgeChange, onGenderChange, onDoctorChange, onReasonChange,
  onPriorityChange, onClose, onConfirm }: {
  name: string;
  phone: string;
  age: string;
  gender: Gender;
  doctorId: string;
  reason: string;
  priority: Priority;
  doctors: { value: string; label: string }[];
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onAgeChange: (value: string) => void;
  onGenderChange: (value: Gender) => void;
  onDoctorChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onPriorityChange: (value: Priority) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalLayer onDismiss={onClose} aria-labelledby="walkin-title"
      className="walkin-layer fixed inset-0 z-50">
      <section className="walkin-dialog">
        <header className="walkin-heading">
          <div><h2 id="walkin-title">Register walk-in patient</h2><p>Patient details and queue priority</p></div>
          <button type="button" className="walkin-close" aria-label="Close walk-in form" onClick={onClose}><X size={20} /></button>
        </header>
        <form className="walkin-form" onSubmit={event => { event.preventDefault(); onConfirm(); }}>
          <div className="walkin-fields">
            <ClayInput label="Full name *" value={name} onChange={event => onNameChange(event.target.value)}
              autoComplete="name" placeholder="Patient name" />
            <ClayInput label="Phone number *" type="tel" inputMode="tel" autoComplete="tel"
              value={phone} onChange={event => onPhoneChange(event.target.value)} placeholder="Mobile number" />
            <div className="walkin-demographics">
              <ClayInput label="Age" type="number" value={age} onChange={event => onAgeChange(event.target.value)} />
              <ClaySelect label="Gender" value={gender} onChange={event => onGenderChange(event.target.value as Gender)}
                options={['Male','Female','Other'].map(value => ({ value,label:value }))} />
            </div>
            <ClaySelect label="Consulting doctor" value={doctorId}
              onChange={event => onDoctorChange(event.target.value)} options={doctors} />
            <ClayInput label="Reason for walk-in" value={reason}
              onChange={event => onReasonChange(event.target.value)} placeholder="Complaint or reason for visit" />
            <PrioritySelector value={priority} onChange={onPriorityChange} />
          </div>
          <footer className="walkin-actions">
            <ClayButton type="button" variant="secondary" onClick={onClose}>Cancel</ClayButton>
            <ClayButton type="submit" variant="primary" size="lg" icon={<UserPlus size={18} />}>Issue walk-in token</ClayButton>
          </footer>
        </form>
      </section>
    </ModalLayer>
  );
}
