import { useId } from 'react';
import './priority-selector.css';

type Priority = 'Normal' | 'Urgent' | 'Emergency';
const priorities: Priority[] = ['Normal', 'Urgent', 'Emergency'];

export function PrioritySelector({ value, onChange, label = 'Triage priority' }: {
  value: Priority;
  onChange: (priority: Priority) => void;
  label?: string;
}) {
  const id = useId();
  return (
    <fieldset className="priority-selector">
      <legend>{label}</legend>
      <div className="priority-options">
        {priorities.map(priority => (
          <label key={priority} data-priority={priority} data-selected={value === priority}>
            <input type="radio" name={id} value={priority} checked={value === priority}
              onChange={() => onChange(priority)} />
            <span>{priority}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
