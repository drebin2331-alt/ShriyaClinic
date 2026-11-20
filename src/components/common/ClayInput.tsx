import React, { useId } from 'react';

interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ClayInput: React.FC<ClayInputProps> = ({
  label,
  error,
  icon,
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
        <input
          className={`clay-input text-slate-800 placeholder-slate-400 outline-none transition-colors focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 ${
            icon ? 'with-icon' : ''
          } ${className}`}
          {...rest}
          id={id}
          aria-invalid={error ? true : rest['aria-invalid']}
          aria-describedby={[rest['aria-describedby'], error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined}
        />
      </div>
      {error && <span id={`${id}-error`} className="clinic-field-error">{error}</span>}
    </div>
  );
};
