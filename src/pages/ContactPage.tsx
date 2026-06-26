import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { GuestPageHeader } from '../components/guest/GuestShell';
import { NavIcon } from '../components/ui/NavIcons';
import { guestTheme } from '../lib/guest-theme';

const contactChannels = [
  {
    icon: 'mail' as const,
    title: 'ایمیل',
    value: 'info@mokeb.local',
    hint: 'پاسخ در کمتر از ۲۴ ساعت',
    href: 'mailto:info@mokeb.local',
  },
  {
    icon: 'info' as const,
    title: 'تلفن پشتیبانی',
    value: '۰۲۱-۱۲۳۴۵۶۷۸',
    hint: 'شنبه تا پنج‌شنبه، ۸ تا ۱۷',
    href: 'tel:+982112345678',
  },
  {
    icon: 'mawkibs' as const,
    title: 'آدرس دفتر',
    value: 'تهران، خیابان نمونه، پلاک ۱۲۳',
    hint: 'مراجعه با هماهنگی قبلی',
    href: undefined,
  },
];

const faqItems = [
  {
    question: 'چطور می‌توانم رزرو موکب ثبت کنم؟',
    answer: 'از بخش «رزرو موکب» در منوی اصلی، موکب مورد نظر را انتخاب و درخواست خود را ثبت کنید.',
  },
  {
    question: 'موکب‌داران چگونه ثبت‌نام می‌کنند؟',
    answer: 'از مسیر «ثبت‌نام موکب‌دار» فرم مربوطه را تکمیل کرده و پس از تأیید به پنل دسترسی خواهید داشت.',
  },
  {
    question: 'آیا امکان پیگیری رزرو بدون ورود وجود دارد؟',
    answer: 'بله، با کد رزرو یا شماره موبایل در بخش «پیگیری رزرو» می‌توانید وضعیت را مشاهده کنید.',
  },
];

export function ContactPage() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <div className={guestTheme.page}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <GuestPageHeader
          icon={<NavIcon name="mail" className="h-6 w-6" />}
          title="ارتباط با ما"
          subtitle="پرسش، پیشنهاد یا گزارش مشکل خود را با ما در میان بگذارید"
        />

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {contactChannels.map((channel) => (
            <div
              key={channel.title}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                <NavIcon name={channel.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-slate-800">{channel.title}</h3>
              {channel.href ? (
                <a
                  href={channel.href}
                  className="mt-1 block text-sm text-[#4a6fa5] transition hover:text-[#3d5d8a] hover:underline"
                  dir="ltr"
                >
                  {channel.value}
                </a>
              ) : (
                <p className="mt-1 text-sm text-slate-700">{channel.value}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">{channel.hint}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <form
            onSubmit={handleSubmit}
            className={`${guestTheme.cardLg} lg:col-span-3`}
          >
            <h2 className="text-base font-bold text-slate-800">فرم تماس</h2>
            <p className="mt-1 text-xs text-slate-400">
              این فرم به‌زودی فعال می‌شود. فعلاً از راه‌های تماس بالا استفاده کنید.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-slate-600">نام و نام خانوادگی</span>
                <input
                  type="text"
                  className={guestTheme.input}
                  placeholder="مثال: علی محمدی"
                  disabled
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-slate-600">شماره موبایل</span>
                <input
                  type="tel"
                  className={guestTheme.input}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                  disabled
                />
              </label>
            </div>

            <label className="mt-3 block text-sm">
              <span className="mb-1.5 block text-slate-600">موضوع</span>
              <input
                type="text"
                className={guestTheme.input}
                placeholder="موضوع پیام شما"
                disabled
              />
            </label>

            <label className="mt-3 block text-sm">
              <span className="mb-1.5 block text-slate-600">متن پیام</span>
              <textarea
                className={`${guestTheme.input} min-h-28 resize-y`}
                placeholder="پیام خود را بنویسید..."
                disabled
              />
            </label>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Link to="/guest/about" className={`${guestTheme.btnSecondary} w-full sm:w-auto`}>
                درباره ما
              </Link>
              <button
                type="submit"
                className={`${guestTheme.btnPrimary} w-full cursor-not-allowed opacity-50 sm:w-auto`}
                disabled
              >
                ارسال پیام
              </button>
            </div>
          </form>

          <div className="lg:col-span-2">
            <div className={`${guestTheme.cardLg} h-full`}>
              <h2 className="text-base font-bold text-slate-800">سؤالات متداول</h2>
              <ul className="mt-4 space-y-4">
                {faqItems.map((item) => (
                  <li key={item.question} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <h3 className="text-sm font-medium text-slate-800">{item.question}</h3>
                    <p className="mt-1.5 text-xs leading-7 text-slate-500 sm:text-sm">{item.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
