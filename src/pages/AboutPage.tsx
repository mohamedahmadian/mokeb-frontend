import { Link } from 'react-router-dom';
import { GuestPageHeader } from '../components/guest/GuestShell';
import { NavIcon } from '../components/ui/NavIcons';
import { guestTheme } from '../lib/guest-theme';

const milestones = [
  { year: '۱۴۰۱', title: 'راه‌اندازی نسخه آزمایشی', description: 'شروع فعالیت سامانه با تمرکز بر رزرو آنلاین موکب‌ها' },
  { year: '۱۴۰۲', title: 'گسترش خدمات', description: 'افزودن پنل موکب‌داران و پیگیری رزرو برای زائران' },
  { year: '۱۴۰۳', title: 'سامانه خادمین', description: 'راه‌اندازی بخش خادم‌یاری و تطبیق نیاز موکب‌ها با داوطلبان' },
  { year: '۱۴۰۴', title: 'توسعه زیرساخت', description: 'بهبود تجربه کاربری و آماده‌سازی برای مقیاس ملی' },
];

const values = [
  {
    icon: 'pilgrims' as const,
    title: 'خدمت‌رسانی به زائر',
    description: 'اولویت ما تسهیل سفر زیارتی و ایجاد آرامش برای زائران گرامی است.',
  },
  {
    icon: 'mawkibs' as const,
    title: 'حمایت از موکب‌ها',
    description: 'ابزارهای ساده و کاربردی برای مدیریت بهتر موکب‌ها و ظرفیت اقامتی.',
  },
  {
    icon: 'honorary' as const,
    title: 'هم‌افزایی اجتماعی',
    description: 'ایجاد پل ارتباطی میان موکب‌ها، خادمان و زائران در یک بستر واحد.',
  },
];

const stats = [
  { value: '+۵۰۰', label: 'موکب ثبت‌شده' },
  { value: '+۱۰,۰۰۰', label: 'رزرو موفق' },
  { value: '+۲,۰۰۰', label: 'خادم داوطلب' },
  { value: '۳۱', label: 'استان تحت پوشش' },
];

export function AboutPage() {
  return (
    <div className={guestTheme.page}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <GuestPageHeader
          icon={<NavIcon name="info" className="h-6 w-6" />}
          title="درباره ما"
          subtitle="آشنایی با سامانه مدیریت اسکان و خدمات زائر"
        />

        <div className={`${guestTheme.cardLg} mb-6`}>
          <h2 className="text-base font-bold text-slate-800">ما که هستیم؟</h2>
          <p className="mt-3 text-sm leading-8 text-slate-600">
            سامانه مدیریت اسکان و خدمات زائر بستری یکپارچه برای ارتباط میان زائران، موکب‌داران و
            خادمان افتخاری است. هدف ما ساده‌سازی فرآیند رزرو اقامت، مدیریت ظرفیت موکب‌ها و تسهیل
            مشارکت داوطلبانه در خدمت‌رسانی به زائران حرم مطهر است.
          </p>
          <p className="mt-3 text-sm leading-8 text-slate-600">
            این سامانه با تکیه بر تجربه عملیاتی موکب‌ها و نیازهای واقعی زائران طراحی شده و در حال
            توسعه مستمر برای پوشش گسترده‌تر خدمات در ایام زیارتی است.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm"
            >
              <p className="text-lg font-bold text-[#4a6fa5] sm:text-xl">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="mb-4 text-base font-bold text-slate-800">ارزش‌های ما</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                  <NavIcon name={value.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-800">{value.title}</h3>
                <p className="mt-2 text-xs leading-7 text-slate-500 sm:text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${guestTheme.cardLg} mb-6`}>
          <h2 className="text-base font-bold text-slate-800">مسیر رشد</h2>
          <ol className="mt-5 space-y-4">
            {milestones.map((item, index) => (
              <li key={item.year} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4a6fa5] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  {index < milestones.length - 1 && (
                    <span className="mt-1 w-px flex-1 bg-slate-200" aria-hidden />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-xs font-medium text-[#4a6fa5]">{item.year}</p>
                  <h3 className="mt-0.5 text-sm font-semibold text-slate-800">{item.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-slate-500">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-[#c5d4e8] bg-gradient-to-l from-[#f0f4fa] to-white p-5 text-center shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-slate-800">سؤال یا پیشنهادی دارید؟</h2>
          <p className="mt-2 text-sm text-slate-500">
            تیم پشتیبانی ما آماده پاسخگویی به شماست.
          </p>
          <div className="mt-4">
            <Link to="/guest/contact" className={guestTheme.btnPrimary}>
              ارتباط با ما
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
