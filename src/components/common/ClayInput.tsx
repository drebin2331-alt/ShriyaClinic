import React from 'react';

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
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
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
        />
      </div>
      {error && <span className="text-[11px] font-medium text-rose-500 px-1">{error}</span>}
    </div>
  );
};
