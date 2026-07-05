import { useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { NavIcon, type NavIconName } from '../ui/NavIcons';
import { guestTheme } from '../../lib/guest-theme';
import {
  PIN_PASSWORD_LENGTH,
  sanitizePinPasswordInput,
} from '../../lib/pin-password';

export function MapPinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

export function PasswordInput({
  value,
  onChange,
  required,
  placeholder,
  hint,
  minLength = 4,
  pinMode = false,
  inputRef,
  onKeyDown,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  minLength?: number;
  pinMode?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [visible, setVisible] = useState(false);

  const handleChange = (raw: string) => {
    onChange(pinMode ? sanitizePinPasswordInput(raw) : raw);
  };

  return (
    <label className="block">
      <FieldLabel label="رمز عبور" required={required} hint={hint} />
      <div className="relative">
        <input
          ref={inputRef}
          type={visible ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={onKeyDown}
          className={`${guestTheme.input} pl-11`}
          placeholder={placeholder ?? (pinMode ? 'مثلاً 1234' : undefined)}
          minLength={required ? minLength : undefined}
          maxLength={pinMode ? PIN_PASSWORD_LENGTH : undefined}
          inputMode={pinMode ? 'numeric' : undefined}
          pattern={pinMode ? '\\d{4}' : undefined}
          autoComplete={pinMode ? 'new-password' : undefined}
          dir={pinMode ? 'ltr' : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition hover:text-slate-600"
          tabIndex={-1}
        >
          {visible ? 'پنهان' : 'نمایش'}
        </button>
      </div>
    </label>
  );
}

export function FormSection({
  title,
  icon,
  children,
  className = '',
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden rounded-t-xl border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-3.5 py-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="space-y-3 overflow-visible p-3.5">{children}</div>
    </section>
  );
}

export function FieldLabel({
  label,
  required,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <span className="mb-1.5 block text-sm text-slate-600">
      {label}
      {required && <span className="text-red-500"> *</span>}
      {hint && (
        <span className="mt-0.5 block text-xs font-normal text-slate-400">{hint}</span>
      )}
    </span>
  );
}

export function RoleBadge({
  selected,
  onToggle,
  icon,
  label,
}: {
  selected: boolean;
  onToggle: () => void;
  icon: NavIconName;
  label: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
        selected
          ? 'border-[#4a6fa5] bg-[#f0f4fa] text-[#3d5d8a] shadow-sm'
          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        onChange={onToggle}
      />
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          selected ? 'bg-[#e8eef6] text-[#4a6fa5]' : 'bg-slate-100 text-slate-500'
        }`}
      >
        <NavIcon name={icon} className="h-4 w-4" />
      </span>
      <span className="font-medium">{label}</span>
    </label>
  );
}

const roleIconMap: Record<string, NavIconName> = {
  Admin: 'dashboard',
  Pilgrim: 'pilgrims',
  MawkibOwner: 'mawkibOwners',
  HonoraryServant: 'honorary',
};

export function roleNavIcon(role: string): NavIconName {
  return roleIconMap[role] ?? 'profile';
}

export function RoleHero({
  role,
  title,
  subtitle,
}: {
  role: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-1 flex items-center gap-3 rounded-xl border border-[#c5d4e8]/60 bg-gradient-to-l from-[#f0f4fa] to-white px-4 py-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
        <NavIcon name={roleNavIcon(role)} className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
