import React from 'react';
import { motion } from 'motion/react';

interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'accent' | 'mint' | 'dark' | 'inset';
  hoverEffect?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const ClayCard: React.FC<ClayCardProps> = ({
  variant = 'default',
  hoverEffect = false,
  className = '',
  children,
  onClick,
  ...rest
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'flat':
        return 'clay-card-flat';
      case 'accent':
        return 'clay-card-accent';
      case 'mint':
        return 'clay-card-mint';
      case 'dark':
        return 'clay-card-dark text-white';
      case 'inset':
        return 'clay-inset';
      default:
        return 'clay-card';
    }
  };

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -1 } : undefined}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`clinic-panel min-w-0 max-w-full ${getVariantClass()} transition-colors duration-150 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
