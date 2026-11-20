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

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.99 }}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      data-size={size}
      onClick={onClick}
      className={`clinic-action transition-colors duration-150 cursor-pointer select-none ${getVariantClass()} ${
        disabled ? 'opacity-50 cursor-not-allowed filter grayscale' : ''
      } ${className}`}
      {...rest}
    >
      {icon && <span className="clinic-action-icon">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
