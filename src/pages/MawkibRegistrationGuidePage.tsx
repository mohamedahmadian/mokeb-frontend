import { Link } from 'react-router-dom';
import { GuestPageHeader } from '../components/guest/GuestShell';
import { MAWKIB_AMENITY_FIELDS } from '../components/mawkibs/MawkibExtraFields';
import { NavIcon, type NavIconName } from '../components/ui/NavIcons';
import { guestTheme } from '../lib/guest-theme';
import { buildLoginUrl } from '../lib/login-portal';
import { MAWKIB_CITIES, MAWKIB_COUNTRIES } from '../lib/mawkib-locations';

type FieldItem = { label: string; hint: string; required?: boolean };

type FieldGroup = {
  icon: NavIconName;
  title: string;
  fields: FieldItem[];
};

const ownerFields: FieldItem[] = [
  { label: 'نام و نام خانوادگی', hint: 'نام کامل مسئول موکب', required: true },
  { label: 'شماره موبایل', hint: 'برای ورود و ارتباط سامانه', required: true },
  { label: 'رمز عبور', hint: 'حداقل ۶ کاراکتر برای ورود امن', required: true },
  { label: 'استان و شهر', hint: 'محل فعالیت یا سکونت شما' },
  { label: 'توضیحات', hint: 'معرفی کوتاه درباره خود یا موکب' },
  { label: 'شبکه‌های اجتماعی', hint: 'واتس‌اپ، تلگرام، بله، ایتا و ایمیل (اختیاری)' },
];

const mawkibFieldGroups: FieldGroup[] = [
  {
    icon: 'mawkibs',
    title: 'اطلاعات پایه',
    fields: [
      { label: 'نام موکب', hint: 'نام رسمی یا شناخته‌شده موکب', required: true },
      { label: 'شماره تماس', hint: 'شماره تماس مستقیم موکب', required: true },
      { label: 'آدرس', hint: 'آدرس دقیق محل اسکان یا خدمات', required: true },
      { label: 'لینک تصویر', hint: 'تصویر نمای موکب برای نمایش در وب‌سایت' },
    ],
  },
  {
    icon: 'track',
    title: 'موقعیت مکانی',
    fields: [
      { label: 'عرض و طول جغرافیایی', hint: 'برای نمایش موقعیت روی نقشه' },
      {
        label: 'کشور و شهر',
        hint: `کشور (${MAWKIB_COUNTRIES.map((c) => c.label).join('، ')}) و شهر (${MAWKIB_CITIES.map((c) => c.label).join('، ')})`,
      },
      { label: 'فاصله تا حرم', hint: 'مثلاً ۵۰۰ متر — به زائران کمک می‌کند' },
    ],
  },
  {
    icon: 'reserve',
    title: 'ظرفیت و بازه خدمات',
    fields: [
      { label: 'ظرفیت آقایان', hint: 'تعداد نفر قابل پذیرش (آقایان)', required: true },
      { label: 'ظرفیت خانم‌ها', hint: 'تعداد نفر قابل پذیرش (خانم‌ها)', required: true },
      { label: 'شروع و پایان خدمات', hint: 'بازه زمانی فعالیت موکب در ایام زیارتی' },
      { label: 'حداکثر بازه رزرو', hint: 'حداکثر تعداد روز قابل رزرو توسط هر زائر' },
    ],
  },
  {
    icon: 'info',
    title: 'توضیحات و خدمات',
    fields: [
      { label: 'توضیحات', hint: 'معرفی کامل موکب، سوابق و ویژگی‌ها' },
      { label: 'امکانات', hint: 'مثلاً اسکان، پارکینگ، حمام — به‌صورت متن آزاد' },
      { label: 'خدمات', hint: 'مثلاً غذا، درمانگاه، پذیرایی' },
      { label: 'قوانین', hint: 'مقررات اقامت و پذیرش زائران' },
    ],
  },
  {
    icon: 'honoraryNeeds',
    title: 'امکانات قابل انتخاب',
    fields: MAWKIB_AMENITY_FIELDS.map(({ label }) => ({
      label,
      hint: 'با تیک زدن، در صفحه عمومی موکب نمایش داده می‌شود',
    })),
  },
  {
    icon: 'mail',
    title: 'اطلاع‌رسانی',
    fields: [
      { label: 'کانال تلگرام', hint: 'آیدی یا لینک کانال' },
      { label: 'واتس‌اپ', hint: 'شماره یا لینک تماس' },
      { label: 'بله و ایتا', hint: 'شماره یا آیدی برای ارتباط سریع' },
      { label: 'آدرس وب‌سایت', hint: 'لینک سایت یا صفحه اختصاصی موکب' },
    ],
  },
];

const steps = [
  {
    number: 1,
    icon: 'honoraryRegister' as const,
    title: 'ثبت‌نام به‌عنوان موکب‌دار',
    summary:
      'قبل از هر چیز باید در سامانه به‌عنوان موکب‌دار حساب کاربری بسازید. این حساب مالکیت موکب‌های شما را مشخص می‌کند.',
    bullets: [
      'فرم ثبت‌نام را با اطلاعات واقعی تکمیل کنید.',
      'پس از ثبت‌نام، مستقیماً به پنل مدیریت هدایت می‌شوید.',
      'اگر قبلاً ثبت‌نام کرده‌اید، از بخش ورود استفاده کنید.',
    ],
    cta: { to: '/guest/mawkib-owner/register', label: 'شروع ثبت‌نام موکب‌دار', primary: true },
    secondaryCta: { to: buildLoginUrl('mawkib-owner'), label: 'ورود به پنل' },
  },
  {
    number: 2,
    icon: 'mawkibOwnerPanel' as const,
    title: 'ثبت اطلاعات موکب در پنل',
    summary:
      'پس از ورود، از بخش «موکب‌ها» در پنل می‌توانید موکب‌های خود را اضافه کنید. برای هر موکب، فرم زیر را با دقت تکمیل کنید.',
    bullets: [
      'می‌توانید چند موکب مختلف ثبت کنید.',
      'فیلدهای ستاره‌دار الزامی هستند.',
      'هرچه اطلاعات کامل‌تر باشد، زائران راحت‌تر انتخاب می‌کنند.',
    ],
    showFieldGroups: true,
  },
  {
    number: 3,
    icon: 'dashboard' as const,
    title: 'بررسی و تأیید توسط مدیریت',
    summary:
      'پس از ثبت، موکب شما با وضعیت «در انتظار بررسی» ذخیره می‌شود. تیم مدیریت اطلاعات را بررسی و در صورت صحت، آن را تأیید می‌کند.',
    bullets: [
      'تا زمان تأیید، موکب در بخش عمومی وب‌سایت نمایش داده نمی‌شود.',
      'در صورت نیاز به اصلاح، از طریق پنل می‌توانید اطلاعات را ویرایش کنید.',
      'پس از تأیید، وضعیت موکب به «تأییدشده» تغییر می‌کند.',
    ],
    statusFlow: [
      { label: 'در انتظار بررسی', tone: 'pending' as const },
      { label: 'بررسی توسط مدیریت', tone: 'review' as const },
      { label: 'تأیید نهایی', tone: 'approved' as const },
    ],
  },
  {
    number: 4,
    icon: 'mawkibs' as const,
    title: 'نمایش عمومی و پذیرش زائر',
    summary:
      'موکب‌های تأییدشده در صفحه «موکب‌ها» به‌صورت عمومی قابل مشاهده هستند. زائران می‌توانند موکب شما را جستجو کرده و درخواست رزرو ثبت کنند.',
    bullets: [
      'موکب در لیست عمومی با نام، ظرفیت و امکانات نمایش داده می‌شود.',
      'زائران می‌توانند جزئیات کامل را مشاهده و رزرو کنند.',
      'شما رزروها را از پنل مدیریت پیگیری و تأیید می‌کنید.',
    ],
    cta: { to: '/guest/mawkibs', label: 'مشاهده موکب‌های عمومی', primary: false },
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

function FieldGroupCard({ group }: { group: FieldGroup }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100">
          <NavIcon name={group.icon} className="h-4 w-4" />
        </span>
        <h4 className="text-sm font-semibold text-slate-800">{group.title}</h4>
      </div>
      <ul className="space-y-2">
        {group.fields.map((field) => (
          <li key={field.label} className="flex items-start gap-2 text-sm">
            <NavIcon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4a6fa5]/60" strokeWidth={2} />
            <div>
              <span className="font-medium text-slate-700">
                {field.label}
                {field.required && <span className="mr-0.5 text-red-400">*</span>}
              </span>
              <p className="text-xs leading-6 text-slate-500">{field.hint}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'pending' | 'review' | 'approved';
}) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    review: 'bg-blue-50 text-[#4a6fa5] ring-[#c5d4e8]',
    approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${styles[tone]}`}
    >
      {tone === 'approved' && <NavIcon name="check" className="h-3.5 w-3.5" strokeWidth={2} />}
      {label}
    </span>
  );
}

export function MawkibRegistrationGuidePage() {
  return (
    <div className={guestTheme.page}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <GuestPageHeader
          icon={<NavIcon name="book" className="h-6 w-6" />}
          title="راهنمای ثبت موکب"
          subtitle="مراحل ثبت‌نام موکب‌دار، افزودن موکب و انتشار عمومی در وب‌سایت"
        />

        {/* Step overview bar */}
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

                {step.number === 1 && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ownerFields.map((field) => (
                      <div
                        key={field.label}
                        className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                      >
                        <NavIcon name="profile" className="mt-0.5 h-4 w-4 shrink-0 text-[#4a6fa5]" />
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

                {step.showFieldGroups && (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {mawkibFieldGroups.map((group) => (
                      <FieldGroupCard key={group.title} group={group} />
                    ))}
                  </div>
                )}

                {step.statusFlow && (
                  <div className="flex flex-wrap items-center gap-2">
                    {step.statusFlow.map((status, index) => (
                      <div key={status.label} className="flex items-center gap-2">
                        <StatusPill label={status.label} tone={status.tone} />
                        {index < step.statusFlow!.length - 1 && (
                          <NavIcon name="chevron" className="h-4 w-4 -rotate-90 text-slate-300" />
                        )}
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
                        <NavIcon name="login" className="h-4 w-4" />
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
          <h2 className="mt-2 text-base font-bold text-slate-800">نیاز به راهنمایی بیشتر دارید؟</h2>
          <p className="mt-2 text-sm text-slate-500">
            تیم پشتیبانی آماده پاسخگویی به سؤالات شما درباره ثبت موکب است.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/guest/contact" className={`${guestTheme.btnPrimary} w-full sm:w-auto`}>
              <NavIcon name="mail" className="h-4 w-4" />
              ارتباط با ما
            </Link>
            <Link
              to="/guest/mawkib-owner/register"
              className={`${guestTheme.btnSecondary} w-full sm:w-auto`}
            >
              <NavIcon name="honoraryRegister" className="h-4 w-4" />
              شروع ثبت‌نام
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
