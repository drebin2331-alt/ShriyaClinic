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
        <input
          className={`clay-input w-full py-2 px-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 ${
            icon ? 'pl-9 pr-3' : 'px-3'
          } ${className}`}
          {...rest}
          id={id}
          aria-invalid={error ? true : rest['aria-invalid']}
          aria-describedby={[rest['aria-describedby'], error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined}
        />
      </div>
      {error && <span id={`${id}-error`} className="text-xs font-medium text-rose-500 px-1">{error}</span>}
    </div>
  );
};
