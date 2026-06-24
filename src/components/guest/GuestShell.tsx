import type { ReactNode } from 'react';
import { guestTheme } from '../../lib/guest-theme';

interface GuestPageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  align?: 'right' | 'center';
}

export function GuestPageHeader({
  icon,
  title,
  subtitle,
  align = 'right',
}: GuestPageHeaderProps) {
  if (align === 'center') {
    return (
      <header className="mb-8 text-center">
        <div className={`mx-auto mb-3 ${guestTheme.headerIcon}`}>{icon}</div>
        <h1 className={guestTheme.headerTitle}>{title}</h1>
        {subtitle && <p className={guestTheme.headerSubtitle}>{subtitle}</p>}
      </header>
    );
  }

  return (
    <header className={guestTheme.headerRow}>
      <div className={guestTheme.headerIcon}>{icon}</div>
      <div className="min-w-0 flex-1">
        <h1 className={guestTheme.headerTitle}>{title}</h1>
        {subtitle && <p className={guestTheme.headerSubtitle}>{subtitle}</p>}
      </div>
    </header>
  );
}

interface GuestShellProps {
  children: ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
  className?: string;
}

const maxWidthClass = {
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
} as const;

export function GuestShell({
  children,
  maxWidth = 'lg',
  className = '',
}: GuestShellProps) {
  return (
    <div className={`${guestTheme.page} ${className}`}>
      <div className={`relative mx-auto ${maxWidthClass[maxWidth]} px-4 py-8 sm:py-10`}>
        {children}
      </div>
    </div>
  );
}
