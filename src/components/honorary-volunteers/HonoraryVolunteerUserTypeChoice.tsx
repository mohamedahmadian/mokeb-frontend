import type { ReactNode } from 'react';
import { guestTheme } from '../../lib/guest-theme';

function SvgIcon({ children, className = 'h-6 w-6' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons = {
  existing: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </SvgIcon>
  ),
  new: (
    <SvgIcon>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
      />
    </SvgIcon>
  ),
};

interface HonoraryVolunteerUserTypeChoiceProps {
  onSelect: (kind: 'existing' | 'new') => void;
}

function ChoiceCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${guestTheme.cardLg} group w-full text-right transition hover:border-[#c5d4e8] hover:shadow-md`}
    >
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f0f4fa] text-[#4a6fa5] transition group-hover:bg-[#e8eef6]">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="mt-1.5 text-sm leading-7 text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

export function HonoraryVolunteerUserTypeChoice({ onSelect }: HonoraryVolunteerUserTypeChoiceProps) {
  return (
    <div className="space-y-3">
      <ChoiceCard
        icon={icons.existing}
        title="قبلاً در سامانه ثبت‌نام کرده‌ام"
        description="با شماره موبایل و رمز عبور وارد می‌شوم و اعلام آمادگی خود را ثبت می‌کنم."
        onClick={() => onSelect('existing')}
      />
      <ChoiceCard
        icon={icons.new}
        title="خادم‌یار جدید هستم"
        description="برای اولین‌بار در سامانه ثبت‌نام می‌کنم و حساب کاربری خادم‌یاری دریافت می‌کنم."
        onClick={() => onSelect('new')}
      />
    </div>
  );
}
