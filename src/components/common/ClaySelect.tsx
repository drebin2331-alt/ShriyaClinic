import React, { useId } from 'react';

interface ClaySelectOption {
  value: string;
  label: string;
}

interface ClaySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: ClaySelectOption[];
  icon?: React.ReactNode;
  error?: string;
  className?: string;
}

export const ClaySelect: React.FC<ClaySelectProps> = ({
  label,
  options,
  icon,
  error,
  className = '',
  ...rest
}) => {
  const generatedId = useId();
  const id = rest.id || generatedId;
  return (
    <div className="clinic-field">
      {label && (
        <label htmlFor={id} className="clinic-field-label">
          {label}
        </label>
      )}
      <div className="clinic-field-control">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <select
          className={`clay-input text-slate-800 outline-none transition-colors appearance-none focus:ring-2 focus:ring-sky-400/60 ${
            icon ? 'with-icon' : ''
          } ${className}`}
          {...rest}
          id={id}
          aria-invalid={error ? true : rest['aria-invalid']}
          aria-describedby={[rest['aria-describedby'], error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>
      {error && <span id={`${id}-error`} className="clinic-field-error">{error}</span>}
    </div>
  );
};
