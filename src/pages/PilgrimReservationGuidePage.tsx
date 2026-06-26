import { Link } from 'react-router-dom';
import { GuestPageHeader } from '../components/guest/GuestShell';
import { NavIcon, type NavIconName } from '../components/ui/NavIcons';
import { RESERVATION_STATUS_LABELS } from '../lib/constants';
import { guestTheme } from '../lib/guest-theme';

type GuideStep = {
  number: number;
  icon: NavIconName;
  title: string;
  summary: string;
  bullets: string[];
  cta?: { to: string; label: string; primary?: boolean };
  secondaryCta?: { to: string; label: string };
  showFormFields?: boolean;
  showMawkibFilters?: boolean;
  showServicePeriod?: boolean;
  showStatuses?: boolean;
  showTrackingMethods?: boolean;
};

const formFields = [
  {
    icon: 'profile' as const,
    label: 'اطلاعات شخصی',
    hint: 'نام، نام خانوادگی، شماره موبایل و استان/شهر',
    required: true,
  },
  {
    icon: 'reserve' as const,
    label: 'بازه تاریخ اقامت',
    hint: 'تاریخ ورود و خروج از موکب',
    required: true,
  },
  {
    icon: 'users' as const,
    label: 'تعداد نفرات',
    hint: 'تعداد آقایان و خانم‌های همراه شما',
    required: true,
  },
  {
    icon: 'mawkibs' as const,
    label: 'انتخاب موکب',
    hint: 'از میان موکب‌های مناسب، یک مورد را انتخاب کنید',
    required: true,
  },
  {
    icon: 'pilgrims' as const,
    label: 'همراهان',
    hint: 'نام و اطلاعات همراهان (اختیاری)',
  },
  {
    icon: 'info' as const,
    label: 'توضیحات',
    hint: 'نیازهای خاص یا توضیحات تکمیلی (اختیاری)',
  },
];

const mawkibFilterReasons = [
  {
    icon: 'check' as const,
    title: 'تأییدشده و فعال',
    description:
      'فقط موکب‌هایی نمایش داده می‌شوند که توسط مدیریت تأیید شده‌اند و در وضعیت فعال قرار دارند.',
  },
  {
    icon: 'reserve' as const,
    title: 'شروع خدمات',
    description:
      'تاریخ شروع رزرو شما نباید قبل از «شروع خدمات» موکب باشد؛ یعنی موکب باید وارد بازه خدمت‌دهی شده باشد.',
  },
  {
    icon: 'users' as const,
    title: 'ظرفیت آزاد',
    description:
      'موکب باید در بازه تاریخ انتخابی شما، ظرفیت کافی برای تعداد آقایان و خانم‌های درخواستی داشته باشد.',
  },
  {
    icon: 'track' as const,
    title: 'تغییر لیست',
    description:
      'با تغییر تاریخ اقامت یا تعداد نفرات، لیست موکب‌های پیشنهادی به‌صورت خودکار به‌روز می‌شود.',
  },
];

const reservationStatuses = [
  {
    key: 'Pending',
    tone: 'pending' as const,
    description:
      'درخواست شما ثبت شده و در انتظار بررسی و تأیید موکب‌دار است. لطفاً صبور باشید.',
  },
  {
    key: 'Confirmed',
    tone: 'approved' as const,
    description:
      'موکب‌دار رزرو شما را تأیید کرده است. می‌توانید برای اقامت برنامه‌ریزی کنید.',
  },
  {
    key: 'Cancelled',
    tone: 'cancelled' as const,
    description: 'رزرو لغو شده است — ممکن است توسط موکب‌دار یا به درخواست شما باشد.',
  },
  {
    key: 'Completed',
    tone: 'completed' as const,
    description: 'اقامت شما به پایان رسیده و رزرو تکمیل شده است.',
  },
];

const trackingMethods = [
  {
    icon: 'track' as const,
    title: 'پیگیری رزرو (بدون ورود)',
    description:
      'از منوی «پیگیری رزرو» با وارد کردن کد رزرو یا شماره موبایل، وضعیت درخواست خود را ببینید.',
    bullets: ['کد رزرو پس از ثبت درخواست به شما نمایش داده می‌شود.', 'با موبایل می‌توانید همه رزروهای خود را ببینید.'],
    cta: { to: '/guest/track', label: 'رفتن به پیگیری رزرو' },
  },
  {
    icon: 'panel' as const,
    title: 'داشبورد کاربری',
    description:
      'با ورود به حساب کاربری، تمام رزروها را در بخش «رزروها» مشاهده و مدیریت کنید.',
    bullets: [
      'ورود با شماره موبایل و رمز عبور (۴ رقم آخر موبایل).',
      'مشاهده جزئیات کامل هر رزرو و وضعیت آن در داشبورد.',
    ],
    cta: { to: '/login', label: 'ورود به پنل کاربری' },
  },
];

const steps: GuideStep[] = [
  {
    number: 1,
    icon: 'reserve',
    title: 'ثبت درخواست رزرو',
    summary:
      'از صفحه «رزرو موکب» اطلاعات خود، بازه اقامت و تعداد نفرات را وارد کنید و موکب مورد نظر را انتخاب نمایید.',
    bullets: [
      'ثبت‌نام جداگانه الزامی نیست؛ با همان موبایل حساب شما ساخته می‌شود.',
      'پس از ثبت، کد رزرو دریافت می‌کنید — آن را نگه دارید.',
      'ثبت درخواست به معنای تأیید نهایی نیست؛ منتظر تأیید موکب‌دار بمانید.',
    ],
    showFormFields: true,
    cta: { to: '/guest/reserve', label: 'شروع رزرو موکب', primary: true },
    secondaryCta: { to: '/register', label: 'ثبت‌نام زائر' },
  },
  {
    number: 2,
    icon: 'mawkibs',
    title: 'موکب‌های قابل انتخاب در فرم',
    summary:
      'لیست موکب‌ها بر اساس شرایط شما فیلتر می‌شود. هر موکبی که می‌بینید، تأییدشده، فعال و در بازه خدمت‌دهی مناسب است.',
    bullets: [
      'موکب‌های در انتظار تأیید یا غیرفعال در این لیست نیستند.',
      'اگر موکبی نمایش داده نشد، تاریخ یا تعداد نفرات را تغییر دهید.',
      'ظرفیت باقی‌مانده هر موکب در کارت آن نمایش داده می‌شود.',
    ],
    showMawkibFilters: true,
    showServicePeriod: true,
  },
  {
    number: 3,
    icon: 'myRequests',
    title: 'وضعیت رزرو و تأیید موکب‌دار',
    summary:
      'پس از ثبت درخواست، رزرو شما در وضعیت «در انتظار» قرار می‌گیرد. موکب‌دار درخواست را بررسی و تأیید یا رد می‌کند.',
    bullets: [
      'تا زمان تأیید موکب‌دار، رزرو قطعی محسوب نمی‌شود.',
      'پس از تأیید، وضعیت به «تأیید شده» تغییر می‌کند.',
      'در صورت لغو، وضعیت «لغو شده» نمایش داده می‌شود.',
    ],
    showStatuses: true,
  },
  {
    number: 4,
    icon: 'track',
    title: 'پیگیری رزرو',
    summary:
      'هر زمان می‌توانید وضعیت رزرو خود را از دو مسیر پیگیری کنید: صفحه عمومی پیگیری یا داشبورد پس از ورود.',
    bullets: [
      'کد رزرو را از صفحه تأیید ثبت یا پیامک/اطلاع‌رسانی دریافت کنید.',
      'با موبایل می‌توانید بدون ورود، همه رزروها را ببینید.',
      'در داشبورد، جزئیات کامل‌تر و تاریخچه رزروها در دسترس است.',
    ],
    showTrackingMethods: true,
  },
];

function StepBadge({ number, icon }: { number: number; icon: NavIconName }) {
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <span className="absolute inset-0 rounded-2xl bg-[#4a6fa5]/10" />
      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#4a6fa5] text-[10px] font-bold text-white">
        {number}
      </span>
      <NavIcon name={icon} className="relative h-5 w-5 text-[#4a6fa5]" />
    </div>
  );
}

function StatusCard({
  label,
  description,
  tone,
}: {
  label: string;
  description: string;
  tone: 'pending' | 'approved' | 'cancelled' | 'completed';
}) {
  const styles = {
    pending: 'border-amber-200 bg-amber-50/80',
    approved: 'border-emerald-200 bg-emerald-50/80',
    cancelled: 'border-red-200 bg-red-50/80',
    completed: 'border-slate-200 bg-slate-50/80',
  };
  const badgeStyles = {
    pending: 'bg-amber-100 text-amber-700 ring-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    cancelled: 'bg-red-100 text-red-700 ring-red-200',
    completed: 'bg-slate-100 text-slate-600 ring-slate-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[tone]}`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badgeStyles[tone]}`}
      >
        {tone === 'approved' && <NavIcon name="check" className="h-3.5 w-3.5" strokeWidth={2} />}
        {label}
      </span>
      <p className="mt-2.5 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

export function PilgrimReservationGuidePage() {
  return (
    <div className={guestTheme.page}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <GuestPageHeader
          icon={<NavIcon name="book" className="h-6 w-6" />}
          title="راهنمای رزرو موکب"
          subtitle="مراحل رزرو، انتخاب موکب، وضعیت درخواست و روش‌های پیگیری برای زائران"
        />

        <div className="mb-8 hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:block">
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4a6fa5] text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <span className="text-xs font-medium text-slate-600">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-2 h-px flex-1 bg-gradient-to-l from-[#c5d4e8] to-transparent" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {steps.map((step) => (
            <article
              key={step.number}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-5 py-4 sm:px-6">
                <div className="flex items-start gap-4">
                  <StepBadge number={step.number} icon={step.icon} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold text-slate-800 sm:text-lg">{step.title}</h2>
                    <p className="mt-1.5 text-sm leading-7 text-slate-600">{step.summary}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5 sm:px-6">
                <ul className="space-y-2">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4a6fa5]" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                {step.showFormFields && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {formFields.map((field) => (
                      <div
                        key={field.label}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                      >
                        <NavIcon name={field.icon} className="mt-0.5 h-4 w-4 shrink-0 text-[#4a6fa5]" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {field.label}
                            {field.required && <span className="mr-0.5 text-red-400">*</span>}
                          </p>
                          <p className="text-xs text-slate-500">{field.hint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {step.showMawkibFilters && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {mawkibFilterReasons.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
                            <NavIcon name={item.icon} className="h-4 w-4" />
                          </span>
                          <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                        </div>
                        <p className="text-xs leading-7 text-slate-500 sm:text-sm">{item.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {step.showServicePeriod && (
                  <div className="rounded-xl border border-[#c5d4e8] bg-gradient-to-l from-[#f0f4fa] to-white p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]">
                        <NavIcon name="reserve" className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800">تاریخ خدمت‌دهی چیست؟</h4>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          هر موکب بازه‌ای به نام{' '}
                          <strong className="font-medium text-slate-800">تاریخ خدمت‌دهی</strong> دارد که
                          از «شروع خدمات» تا «پایان خدمات» مشخص می‌شود. در این بازه موکب فعال است و
                          آماده پذیرش زائران می‌باشد.
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          اگر تاریخ رزرو شما قبل از شروع خدمات موکب باشد، آن موکب در لیست نمایش داده
                          نمی‌شود. همچنین اگر بازه رزرو از حداکثر روز مجاز موکب بیشتر باشد، فیلتر
                          می‌شود.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {step.showStatuses && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {reservationStatuses.map((status) => (
                      <StatusCard
                        key={status.key}
                        label={RESERVATION_STATUS_LABELS[status.key]}
                        description={status.description}
                        tone={status.tone}
                      />
                    ))}
                  </div>
                )}

                {step.showTrackingMethods && (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {trackingMethods.map((method) => (
                      <div
                        key={method.title}
                        className="flex h-full flex-col rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
                            <NavIcon name={method.icon} className="h-4 w-4" />
                          </span>
                          <h4 className="text-sm font-semibold text-slate-800">{method.title}</h4>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{method.description}</p>
                        <ul className="mt-3 space-y-1.5">
                          {method.bullets.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2 text-xs text-slate-500 sm:text-sm">
                              <NavIcon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4a6fa5]/60" strokeWidth={2} />
                              {bullet}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <Link to={method.cta.to} className={`${guestTheme.btnSecondary} w-full sm:w-auto`}>
                            <NavIcon name={method.icon} className="h-4 w-4" />
                            {method.cta.label}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(step.cta || step.secondaryCta) && (
                  <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-start">
                    {step.secondaryCta && (
                      <Link
                        to={step.secondaryCta.to}
                        className={`${guestTheme.btnSecondary} w-full sm:w-auto`}
                      >
                        <NavIcon name="register" className="h-4 w-4" />
                        {step.secondaryCta.label}
                      </Link>
                    )}
                    {step.cta && (
                      <Link
                        to={step.cta.to}
                        className={`${step.cta.primary ? guestTheme.btnPrimary : guestTheme.btnSecondary} w-full sm:w-auto`}
                      >
                        <NavIcon name={step.icon} className="h-4 w-4" />
                        {step.cta.label}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-[#c5d4e8] bg-gradient-to-l from-[#f0f4fa] to-white p-5 text-center shadow-sm sm:p-6">
          <NavIcon name="info" className="mx-auto h-6 w-6 text-[#4a6fa5]" />
          <h2 className="mt-2 text-base font-bold text-slate-800">سؤالی درباره رزرو دارید؟</h2>
          <p className="mt-2 text-sm text-slate-500">
            پاسخ سؤالات پرتکرار را در بخش سوالات متداول ببینید یا با پشتیبانی تماس بگیرید.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/guest/faq" className={`${guestTheme.btnPrimary} w-full sm:w-auto`}>
              <NavIcon name="book" className="h-4 w-4" />
              سوالات متداول
            </Link>
            <Link to="/guest/reserve" className={`${guestTheme.btnSecondary} w-full sm:w-auto`}>
              <NavIcon name="reserve" className="h-4 w-4" />
              شروع رزرو
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
