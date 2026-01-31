/**
 * Componente Card - Container estilizado reutilizável
 * Com efeito de glow dourado no hover
 */

import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glow';
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
}

// Classes de padding
const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = true,
  className = '',
  ...props
}: CardProps) {
  const baseClasses = `
    bg-dark-700 rounded-2xl
    border border-dark-600
    transition-all duration-300 ease-out
  `;

  const hoverClasses = hoverable
    ? variant === 'glow'
      ? 'hover:border-gold/50 hover:shadow-gold'
      : 'hover:border-gold/30 hover:shadow-card'
    : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${paddingClasses[padding]}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
