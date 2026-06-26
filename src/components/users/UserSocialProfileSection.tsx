import type { ReactNode } from 'react';
import { SOCIAL_FIELD_CONFIG } from './UserSocialFields';
import type { UserSocialFields } from '../../types';

function IconMail() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function IconChat() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
      />
    </svg>
  );
}

const socialIcons: Record<string, ReactNode> = {
  whatsapp: <IconChat />,
  telegram: <IconChat />,
  bale: <IconChat />,
  eitaa: <IconChat />,
  email: <IconMail />,
};

interface UserSocialProfileSectionProps {
  user: Partial<UserSocialFields>;
}

export function UserSocialProfileSection({ user }: UserSocialProfileSectionProps) {
  const items = SOCIAL_FIELD_CONFIG.filter(({ key }) => user[key]?.trim());

  if (items.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eef6] text-[#4a6fa5]">
          <IconChat />
        </div>
        <h2 className="text-sm font-semibold text-slate-800">شبکه‌های اجتماعی</h2>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {items.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-start gap-3 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/90 to-white p-3.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
              {socialIcons[key] ?? <IconChat />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <p
                className={`mt-1 break-all text-sm font-semibold text-slate-800 ${
                  key === 'email' ? 'font-mono text-xs' : ''
                }`}
                dir={key === 'email' ? 'ltr' : undefined}
              >
                {user[key]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
