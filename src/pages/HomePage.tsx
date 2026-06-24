import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { guestTheme } from '../lib/guest-theme';

function IconMawkibs({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg className="h-4 w-4 rotate-180 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-7 text-slate-600">
      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8eef6] text-[#4a6fa5]">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span>{children}</span>
    </li>
  );
}

function ShowcaseSection({
  badge,
  title,
  description,
  features,
  cta,
  imageSrc,
  imageAlt,
  reversed = false,
  tone = 'light',
}: {
  badge: string;
  title: string;
  description: string;
  features: string[];
  cta: { to: string; label: string; variant?: 'primary' | 'secondary' };
  imageSrc: string;
  imageAlt: string;
  reversed?: boolean;
  tone?: 'light' | 'warm';
}) {
  const bgClass = tone === 'warm' ? 'bg-gradient-to-b from-[#faf6f0] to-[#f4f6f9]' : 'bg-[#f4f6f9]';

  return (
    <section className={bgClass}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div
          className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-12 ${
            reversed ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          <div>
            <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4a6fa5] shadow-sm ring-1 ring-[#c5d4e8]">
              {badge}
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-800 sm:text-2xl">{title}</h2>
            <p className="mt-3 text-sm leading-8 text-slate-600 sm:text-base">{description}</p>
            <ul className="mt-5 space-y-2">
              {features.map((feature) => (
                <CheckItem key={feature}>{feature}</CheckItem>
              ))}
            </ul>
            <div className="mt-7">
              <Link
                to={cta.to}
                className={cta.variant === 'secondary' ? guestTheme.btnSecondary : guestTheme.btnPrimary}
              >
                {cta.label}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#c5d4e8]/40 to-transparent blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
              <img src={imageSrc} alt={imageAlt} className="h-auto w-full rounded-xl" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const quickServices = [
  {
    to: '/guest/mawkibs',
    title: 'جستجوی موکب',
    description: 'مشاهده و مقایسه موکب‌های فعال',
    iconBg: guestTheme.iconPrimary,
  },
  {
    to: '/guest/track',
    title: 'پیگیری رزرو',
    description: 'پیگیری با کد رزرو یا موبایل',
    iconBg: guestTheme.iconAccent,
  },
  {
    to: '/login',
    title: 'ورود به پنل',
    description: 'مدیریت حساب کاربری',
    iconBg: guestTheme.iconMuted,
  },
] as const;

export function HomePage() {
  return (
    <div className="guest-theme text-slate-700">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200/60 bg-white">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-[#e8eef6]/60 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-[#f3ebe0]/70 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f0f4fa] px-3 py-1 text-xs font-medium text-[#4a6fa5] ring-1 ring-[#c5d4e8]">
              <IconMawkibs className="h-4 w-4" />
              سامانه مدیریت اسکان و خدمات زائر
            </div>
            <h1 className="text-2xl font-bold leading-tight text-slate-800 sm:text-3xl lg:text-4xl">
              در مسیر زیارت، میزبان شما هستیم
            </h1>
            <p className="mt-4 text-sm leading-8 text-slate-600 sm:text-base">
              موکب مناسب را بیابید، رزرو کنید و وضعیت اقامت را به‌صورت آنلاین پیگیری نمایید. موکب‌داران
              نیز می‌توانند ظرفیت و رزروها را در پنل اختصاصی مدیریت کنند.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Link to="/guest/reserve" className={guestTheme.btnPrimary}>
                شروع رزرو موکب
              </Link>
              <Link to="/guest/mawkibs" className={guestTheme.btnSecondary}>
                مشاهده موکب‌ها
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pilgrims */}
      <ShowcaseSection
        badge="ویژه زائران"
        title="رزرو آسان، اقامت مطمئن"
        description="زائر گرامی می‌توانید بدون پیچیدگی، موکب مناسب خود را پیدا کنید، درخواست رزرو ثبت کنید و وضعیت آن را در هر زمان پیگیری نمایید."
        features={[
          'جستجو و مشاهده موکب‌ها بر اساس شهر و ظرفیت',
          'ثبت درخواست رزرو با انتخاب تاریخ و تعداد نفرات',
          'پیگیری رزرو با کد رزرو یا شماره موبایل',
          'ثبت‌نام سریع و دسترسی به پنل شخصی',
        ]}
        cta={{ to: '/guest/reserve', label: 'رزرو موکب' }}
        imageSrc="/images/home-pilgrim.svg"
        imageAlt="تصویر نمادین خدمات زائر"
      />

      {/* Mawkib owners */}
      <ShowcaseSection
        badge="ویژه موکب‌داران"
        title="مدیریت هوشمند موکب شما"
        description="موکب‌داران می‌توانند پس از ثبت‌نام، موکب خود را معرفی کنند، ظرفیت را مدیریت کنند و رزروهای زائران را تأیید یا پیگیری نمایند."
        features={[
          'ثبت‌نام اختصاصی موکب‌دار و ورود به پنل مدیریت',
          'ثبت و ویرایش اطلاعات موکب پس از ورود',
          'مدیریت رزروها و ظرفیت روزانه',
          'دسترسی به جزئیات زائران و وضعیت رزروها',
        ]}
        cta={{
          to: '/guest/mawkib-owner/register',
          label: 'ثبت‌نام موکب‌دار',
          variant: 'secondary',
        }}
        imageSrc="/images/home-mawkib-owner.svg"
        imageAlt="تصویر نمادین مدیریت موکب"
        reversed
        tone="warm"
      />

      {/* Honorary volunteers */}
      <ShowcaseSection
        badge="ویژه خادمان افتخاری"
        title="خدمت با افتخار، همراهی با موکب"
        description="هم موکب‌ها می‌توانند نیازهای نیروی انسانی خود را مطرح کنند و هم افرادی که تمایل به خدمت دارند، آمادگی خود را برای همکاری در موکب اعلام نمایند. این بخش به تطبیق نیاز دو طرفه کمک می‌کند."
        features={[
          'ثبت آمادگی خدمت در حوزه‌های مختلف (آشپزی، نظافت، حمل‌ونقل و ...)',
          'مشخص کردن بازه زمانی و شرایط همکاری',
          'ارتباط میان نیاز موکب‌ها و داوطلبان خدمت',
          'ثبت درخواست ساده بدون نیاز به ورود اولیه',
        ]}
        cta={{ to: '/guest/honorary-volunteer/register', label: 'افتخار خادم‌یاری' }}
        imageSrc="/images/home-volunteer.svg"
        imageAlt="تصویر نمادین خادم‌یاری در موکب"
      />

      {/* Quick links */}
      <section className="border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-800 sm:text-xl">دسترسی سریع</h2>
            <p className="mt-1 text-sm text-slate-500">میانبر به پرکاربردترین بخش‌های سامانه</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickServices.map((service) => (
              <Link key={service.to} to={service.to} className={guestTheme.serviceCard}>
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${service.iconBg}`}
                >
                  <IconMawkibs />
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <h3 className="text-sm font-semibold text-slate-800">{service.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{service.description}</p>
                </div>
                <IconChevron />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
