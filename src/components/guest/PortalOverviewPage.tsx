import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { NavIcon } from '../ui/NavIcons';
import type { PortalOverview, PortalQuickLink } from '../../lib/portal-overviews';
import { guestTheme } from '../../lib/guest-theme';

const iconBgClass = {
  primary: guestTheme.iconPrimary,
  accent: guestTheme.iconAccent,
  muted: guestTheme.iconMuted,
} as const;

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-7 text-slate-600">
      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8eef6] text-[#4a6fa5]">
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

function QuickLinkCard({ link }: { link: PortalQuickLink }) {
  return (
    <Link to={link.to} className={guestTheme.serviceCard}>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBgClass[link.iconBg]}`}
      >
        <NavIcon name={link.icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1 text-right">
        <h3 className="text-sm font-semibold text-slate-800">{link.title}</h3>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{link.description}</p>
      </div>
      <svg
        className="h-4 w-4 shrink-0 rotate-180 text-slate-400 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export function PortalOverviewPage({ data }: { data: PortalOverview }) {
  const heroBg =
    data.tone === 'warm'
      ? 'bg-gradient-to-b from-[#faf6f0] to-white'
      : 'bg-white';

  return (
    <div className="guest-theme text-slate-700">
      {/* Hero */}
      <section className={`relative overflow-hidden border-b border-slate-200/60 ${heroBg}`}>
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#e8eef6]/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#f3ebe0]/70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <span className="inline-block rounded-full bg-[#f0f4fa] px-3 py-1 text-xs font-semibold text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
                {data.badge}
              </span>
              <h1 className="mt-4 text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
                {data.title}
              </h1>
              <p className="mt-4 text-sm leading-8 text-slate-600 sm:text-base">
                {data.subtitle}
              </p>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <Link to={data.primaryCta.to} className={guestTheme.btnPrimary}>
                  {data.primaryCta.label}
                </Link>
                {data.secondaryCta && (
                  <Link to={data.secondaryCta.to} className={guestTheme.btnSecondary}>
                    {data.secondaryCta.label}
                  </Link>
                )}
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#c5d4e8]/40 to-transparent blur-2xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
                <img
                  src={data.imageSrc}
                  alt={data.imageAlt}
                  className="h-auto w-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose */}
      <section className="bg-[#f4f6f9]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl">هدف این بخش</h2>
            <p className="mt-4 text-sm leading-8 text-slate-600 sm:text-base">{data.purpose}</p>
            {data.purposeExtra && (
              <p className="mt-3 text-sm leading-8 text-slate-500 sm:text-base">
                {data.purposeExtra}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl">امکانات و قابلیت‌ها</h2>
            <p className="mt-1 text-sm text-slate-500">
              آنچه این بخش در اختیار کاربران قرار می‌دهد
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.capabilities.map((cap) => (
              <div
                key={cap.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-[#c5d4e8] hover:shadow-md"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                  <NavIcon name={cap.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-slate-800">{cap.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section
        className={
          data.tone === 'warm'
            ? 'bg-gradient-to-b from-[#faf6f0] to-[#f4f6f9]'
            : 'bg-[#f4f6f9]'
        }
      >
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
                مزایای استفاده از این بخش
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                خلاصه‌ای از ارزش‌ها و امکانات کلیدی برای کاربران
              </p>
            </div>
            <ul className="space-y-2">
              {data.highlights.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl">دسترسی سریع</h2>
            <p className="mt-1 text-sm text-slate-500">
              میانبر به پرکاربردترین بخش‌های این سامانه
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.quickLinks.map((link) => (
              <QuickLinkCard key={`${link.to}-${link.title}`} link={link} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-slate-200/60 bg-[#f4f6f9]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="rounded-2xl border border-[#c5d4e8] bg-gradient-to-l from-[#f0f4fa] to-white p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-base font-bold text-slate-800 sm:text-lg">
              آماده شروع هستید؟
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              همین حالا از امکانات {data.badge} استفاده کنید یا سوالات خود را در بخش پرسش‌های
              متداول ببینید.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              <Link to={data.primaryCta.to} className={guestTheme.btnPrimary}>
                {data.primaryCta.label}
              </Link>
              <Link to="/guest/faq" className={guestTheme.btnSecondary}>
                <NavIcon name="book" className="h-4 w-4" />
                سوالات متداول
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
