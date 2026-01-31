/**
 * Componente Button - Botão reutilizável com variantes
 * Variantes: primary (dourado sólido) e secondary (outline dourado)
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';

// Tipos de variantes disponíveis
type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  isLoading?: boolean;
}

// Classes base compartilhadas
const baseClasses = `
  inline-flex items-center justify-center gap-2
  font-heading font-semibold
  rounded-xl
  transition-all duration-300 ease-out
  active:scale-95
  focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 focus:ring-offset-dark-800
  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
`;

// Classes específicas por variante
const variantClasses: Record<ButtonVariant, string> = {
  primary: `
    bg-gold text-dark-900
    hover:bg-gold-light hover:shadow-gold-lg hover:scale-105
  `,
  secondary: `
    bg-transparent text-gold
    border-2 border-gold
    hover:bg-gold hover:text-dark-900 hover:shadow-gold
  `,
};

// Classes de tamanho
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 md:px-8 md:py-4 text-base',
  lg: 'px-8 py-4 md:px-10 md:py-5 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        // Spinner de loading
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}

export default Button;
