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
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <select
          className={`clay-input w-full py-2.5 text-sm font-medium text-slate-800 outline-none transition-all appearance-none focus:ring-2 focus:ring-sky-400/60 ${
            icon ? 'pl-10 pr-9' : 'px-4 pr-9'
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
      {error && <span id={`${id}-error`} className="text-xs font-medium text-red-500 px-1">{error}</span>}
    </div>
  );
};
