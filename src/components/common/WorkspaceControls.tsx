import { useId, type ReactNode } from 'react';

export function WorkspaceHeading({ title, detail, children }: { title: string; detail?: string; children?: ReactNode }) {
  return (
    <header className="work-heading">
      <div><h1>{title}</h1>{detail && <p>{detail}</p>}</div>
      {children && <div className="work-heading-actions">{children}</div>}
    </header>
  );
}

interface SectionOption<T> {
  id: T;
  label: string;
  description?: string;
  count?: number;
}

/** Short lists are direct touch targets. Long lists use the device's picker in a narrow pane. */
export function SectionPicker<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: readonly SectionOption<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const id = useId();
  const long = options.length > 4;
  return (
    <div className={long ? 'work-picker many' : 'work-picker'}>
      {long && <div className="work-picker-field">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={value} onChange={event => onChange(event.currentTarget.value as T)}>
          {options.map(option => <option key={option.id} value={option.id}>
            {option.label}{option.count !== undefined ? ' (' + option.count + ')' : ''}
          </option>)}
        </select>
      </div>}
      <div className="work-segments" data-count={options.length} role="group" aria-label={label}>
        {options.map(option => <button key={option.id} type="button" aria-pressed={option.id === value}
          title={option.description} onClick={() => onChange(option.id)}>
          {option.label}{option.count !== undefined && <span className="section-count">{option.count}</span>}
        </button>)}
      </div>
    </div>
  );
}
