/**
 * Componente Container - Wrapper responsivo para conteúdo
 * Centraliza o conteúdo e aplica padding consistente
 */

import type { ReactNode, HTMLAttributes } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Classes de tamanho máximo
const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function Container({
  children,
  size = 'xl',
  className = '',
  ...props
}: ContainerProps) {
  return (
    <div
      className={`
        w-full mx-auto
        px-4 sm:px-6 lg:px-8
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export default Container;
