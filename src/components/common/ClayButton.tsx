import React from 'react';
import { motion } from 'motion/react';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'mint' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  onClick,
  ...rest
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return 'clay-btn-secondary';
      case 'mint':
        return 'clay-btn-mint';
      case 'danger':
        return 'clay-btn-danger';
      case 'warning':
        return 'clay-btn-warning';
      case 'ghost':
        return 'bg-transparent text-slate-700 hover:bg-slate-100 rounded-md';
      default:
        return 'clay-btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs font-semibold rounded-md gap-1.5';
      case 'lg':
        return 'px-5 py-2.5 text-sm font-semibold rounded-lg gap-2';
      default:
        return 'px-4 py-2 text-xs font-semibold rounded-md gap-2';
    }
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${getVariantClass()} ${getSizeClass()} ${
        disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : ''
      } ${className}`}
      {...rest}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
