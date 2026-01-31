/**
 * Componente Badge - Tag/etiqueta estilizada
 * Usado para destacar informações como preços ou categorias
 */

import type { ReactNode, HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'gold' | 'dark' | 'success';
  size?: 'sm' | 'md';
}

// Classes por variante
const variantClasses = {
  gold: 'bg-gold/10 text-gold border-gold/20',
  dark: 'bg-dark-600 text-cream-muted border-dark-500',
  success: 'bg-green-500/10 text-green-400 border-green-500/20',
};

// Classes de tamanho
const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        font-medium rounded-full
        border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
