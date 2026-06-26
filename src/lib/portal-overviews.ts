import type { NavIconName } from '../components/ui/NavIcons';

export type PortalId = 'pilgrims' | 'mawkib-owners' | 'honorary';

export interface PortalCapability {
  icon: NavIconName;
  title: string;
  description: string;
}

export interface PortalQuickLink {
  to: string;
  title: string;
  description: string;
  icon: NavIconName;
  iconBg: 'primary' | 'accent' | 'muted';
}

export interface PortalOverview {
  id: PortalId;
  badge: string;
  title: string;
  subtitle: string;
  purpose: string;
  purposeExtra?: string;
  imageSrc: string;
  imageAlt: string;
  tone: 'light' | 'warm';
  capabilities: PortalCapability[];
  highlights: string[];
  quickLinks: PortalQuickLink[];
  primaryCta: { to: string; label: string };
  secondaryCta?: { to: string; label: string };
  faqCategory?: 'pilgrims' | 'mawkib-owners' | 'honorary';
}

export const PORTAL_OVERVIEWS: Record<PortalId, PortalOverview> = {
  pilgrims: {
    id: 'pilgrims',
    badge: 'سامانه زائران',
    title: 'همراه شما از جستجو تا اقامت',
    subtitle:
      'بخش اختصاص زائران برای یافتن موکب مناسب، ثبت درخواست اقامت و پیگیری آنلاین وضعیت رزرو طراحی شده است.',
    purpose:
      'هدف این بخش، ساده‌سازی مسیر اسکان زائران در ایام زیارتی است. زائر می‌تواند بدون مراجعه حضوری، موکب‌های فعال را ببیند، درخواست رزرو ثبت کند و نتیجه بررسی را در هر زمان دنبال کند.',
    purposeExtra:
      'این سامانه زائر را در مرکز تصمیم‌گیری قرار می‌دهد: انتخاب موکب، مشخص کردن تاریخ و تعداد همراهان، و دسترسی به سوابق رزرو — همه در یک بستر واحد.',
    imageSrc: '/images/home-pilgrim.svg',
    imageAlt: 'تصویر نمادین سامانه زائران',
    tone: 'light',
    capabilities: [
      {
        icon: 'mawkibs',
        title: 'جستجو و مقایسه موکب‌ها',
        description:
          'مشاهده لیست موکب‌های تأییدشده با فیلتر شهر، ظرفیت و جزئیات خدمات هر موکب.',
      },
      {
        icon: 'reserve',
        title: 'ثبت درخواست رزرو',
        description:
          'انتخاب بازه اقامت، تعداد نفرات و موکب مورد نظر و ارسال درخواست برای بررسی موکب‌دار.',
      },
      {
        icon: 'track',
        title: 'پیگیری بدون ورود',
        description:
          'بررسی وضعیت رزرو با کد رهگیری یا شماره موبایل، حتی بدون نیاز به ورود اولیه.',
      },
      {
        icon: 'register',
        title: 'ثبت‌نام و پنل شخصی',
        description:
          'ایجاد حساب کاربری، مشاهده تاریخچه رزروها و ثبت درخواست‌های جدید از پنل زائر.',
      },
      {
        icon: 'myRequests',
        title: 'مدیریت درخواست‌ها',
        description:
          'دسترسی به جزئیات هر رزرو، وضعیت تأیید یا رد، و امکان پیگیری مستمر از پنل کاربری.',
      },
      {
        icon: 'honorary',
        title: 'همکاری خادم‌یاری',
        description:
          'زائرانی که تمایل به خدمت دارند می‌توانند از مسیر جداگانه سامانه خادمین درخواست همکاری ثبت کنند.',
      },
    ],
    highlights: [
      'دسترسی عمومی به فهرست موکب‌ها و اطلاعات تماس',
      'ثبت رزرو با یا بدون حساب کاربری',
      'پیگیری شفاف وضعیت درخواست تا تأیید نهایی',
      'پنل اختصاص برای مدیریت رزروهای شخصی',
      'امکان ثبت‌نام سریع با شماره موبایل',
    ],
    quickLinks: [
      {
        to: '/guest/mawkibs',
        title: 'مشاهده موکب‌ها',
        description: 'جستجو در موکب‌های فعال',
        icon: 'mawkibs',
        iconBg: 'primary',
      },
      {
        to: '/guest/reserve',
        title: 'رزرو موکب',
        description: 'ثبت درخواست اقامت',
        icon: 'reserve',
        iconBg: 'accent',
      },
      {
        to: '/guest/track',
        title: 'پیگیری رزرو',
        description: 'بررسی وضعیت با کد یا موبایل',
        icon: 'track',
        iconBg: 'muted',
      },
      {
        to: '/register',
        title: 'ثبت‌نام زائر',
        description: 'ایجاد حساب کاربری',
        icon: 'register',
        iconBg: 'primary',
      },
      {
        to: '/login',
        title: 'ورود به پنل',
        description: 'مدیریت رزروهای من',
        icon: 'login',
        iconBg: 'muted',
      },
      {
        to: '/guest/reserve/guide',
        title: 'راهنمای رزرو',
        description: 'آشنایی با فرآیند رزرو',
        icon: 'book',
        iconBg: 'accent',
      },
    ],
    primaryCta: { to: '/guest/reserve', label: 'شروع رزرو موکب' },
    secondaryCta: { to: '/guest/mawkibs', label: 'مشاهده موکب‌ها' },
    faqCategory: 'pilgrims',
  },

  'mawkib-owners': {
    id: 'mawkib-owners',
    badge: 'سامانه موکب‌داران',
    title: 'مدیریت یکپارچه موکب و رزروها',
    subtitle:
      'بخش اختصاص موکب‌داران برای معرفی موکب، کنترل ظرفیت، بررسی رزروهای زائران و مدیریت نیروی خادم طراحی شده است.',
    purpose:
      'هدف این بخش، توانمندسازی موکب‌داران در مدیریت دیجیتال فعالیت‌های اسکان‌دهی است. پس از تأیید حساب، موکب‌دار ابزارهای لازم برای معرفی موکب، پاسخ به درخواست‌های زائران و هماهنگی نیروی انسانی را در اختیار دارد.',
    purposeExtra:
      'این سامانه به موکب‌دار کمک می‌کند ظرفیت را به‌درستی مدیریت کند، از رزروهای هم‌پوشان جلوگیری نماید و ارتباط شفاف‌تری با زائران و خادمان برقرار کند.',
    imageSrc: '/images/home-mawkib-owner.svg',
    imageAlt: 'تصویر نمادین سامانه موکب‌داران',
    tone: 'warm',
    capabilities: [
      {
        icon: 'mawkibOwnerRegister',
        title: 'ثبت‌نام و احراز هویت',
        description:
          'ثبت‌نام اختصاصی موکب‌دار و فعال‌سازی حساب پس از تأیید مدیریت سامانه.',
      },
      {
        icon: 'mawkibs',
        title: 'ثبت و ویرایش موکب',
        description:
          'معرفی موکب با آدرس، ظرفیت، تصاویر، امکانات و بازه خدمت‌دهی در فهرست عمومی.',
      },
      {
        icon: 'reservations',
        title: 'مدیریت رزروها',
        description:
          'مشاهده درخواست‌های زائران، بررسی جزئیات و تأیید یا رد هر رزرو با ثبت توضیحات.',
      },
      {
        icon: 'users',
        title: 'اطلاعات زائران',
        description:
          'دسترسی به مشخصات زائر، تعداد همراهان و اطلاعات تماس برای هماهنگی اقامت.',
      },
      {
        icon: 'honoraryAdd',
        title: 'درخواست نیروی خادم',
        description:
          'ثبت نیازمندی خادم با مشخص کردن موکب، حوزه خدمت، بازه زمانی و توضیحات تکمیلی.',
      },
      {
        icon: 'honorary',
        title: 'بررسی درخواست‌های همکاری',
        description:
          'مشاهده و مدیریت درخواست‌های خادمان داوطلب و تعیین وضعیت تأیید یا رد.',
      },
    ],
    highlights: [
      'پنل مدیریت اختصاص برای هر موکب‌دار',
      'کنترل ظرفیت روزانه و جلوگیری از رزرو بیش از حد',
      'نمایش موکب در فهرست عمومی پس از تأیید',
      'انتشار نیازمندی خادم در صفحه عمومی سامانه',
      'دسترسی به آمار و تاریخچه رزروها',
    ],
    quickLinks: [
      {
        to: '/guest/mawkib-owner/register',
        title: 'ثبت‌نام موکب‌دار',
        description: 'درخواست حساب کاربری',
        icon: 'mawkibOwnerRegister',
        iconBg: 'accent',
      },
      {
        to: '/login?portal=mawkib-owner',
        title: 'ورود به پنل',
        description: 'مدیریت موکب و رزروها',
        icon: 'login',
        iconBg: 'primary',
      },
      {
        to: '/guest/mawkib-owner/guide',
        title: 'راهنمای ثبت موکب',
        description: 'آشنایی با فرآیند ثبت',
        icon: 'book',
        iconBg: 'muted',
      },
      {
        to: '/guest/honorary-volunteer/needs',
        title: 'نیازمندی‌های موکب‌ها',
        description: 'مشاهده عمومی درخواست‌ها',
        icon: 'honoraryNeeds',
        iconBg: 'primary',
      },
    ],
    primaryCta: { to: '/guest/mawkib-owner/register', label: 'ثبت‌نام موکب‌دار' },
    secondaryCta: { to: '/login?portal=mawkib-owner', label: 'ورود به پنل' },
    faqCategory: 'mawkib-owners',
  },

  honorary: {
    id: 'honorary',
    badge: 'سامانه خادمین',
    title: 'پل ارتباطی خادمان و موکب‌ها',
    subtitle:
      'بخش اختصاص خادمان افتخاری برای اعلام آمادگی خدمت، یافتن فرصت‌های همکاری با موکب‌ها و پیگیری درخواست‌ها طراحی شده است.',
    purpose:
      'هدف این بخش، تسهیل مشارکت داوطلبانه در خدمت‌رسانی به زائران است. موکب‌داران نیازهای نیروی انسانی خود را ثبت می‌کنند و خادمان علاقه‌مند می‌توانند بر اساس توانایی و زمان خود، برای همکاری اعلام آمادگی کنند.',
    purposeExtra:
      'این سامانه فرآیند تطبیق نیاز و ظرفیت را شفاف می‌کند: هر نیازمندی با جزئیات حوزه خدمت و بازه زمانی منتشر می‌شود و خادم می‌تواند مستقیماً برای همان موکب درخواست ارسال کند.',
    imageSrc: '/images/home-volunteer.svg',
    imageAlt: 'تصویر نمادین سامانه خادمین',
    tone: 'light',
    capabilities: [
      {
        icon: 'honoraryRegister',
        title: 'ثبت‌نام خادم جدید',
        description:
          'ایجاد حساب کاربری با نقش خادم‌یار و ثبت اطلاعات هویتی و حوزه‌های تمایل به خدمت.',
      },
      {
        icon: 'login',
        title: 'ثبت‌نام کاربر موجود',
        description:
          'ورود با حساب قبلی و تکمیل فقط اطلاعات همکاری، بدون تکرار اطلاعات شخصی.',
      },
      {
        icon: 'honoraryNeeds',
        title: 'نیازمندی‌های موکب‌ها',
        description:
          'مشاهده درخواست‌های نیروی خادم ثبت‌شده توسط موکب‌داران و انتخاب فرصت مناسب.',
      },
      {
        icon: 'honorary',
        title: 'اعلام آمادگی همکاری',
        description:
          'انتخاب نیازمندی و پیش‌پر شدن خودکار فرم ثبت‌نام با اطلاعات همان درخواست.',
      },
      {
        icon: 'honoraryTrack',
        title: 'پیگیری درخواست',
        description:
          'بررسی وضعیت درخواست با کد رهگیری یا موبایل، حتی بدون ورود به پنل.',
      },
      {
        icon: 'myRequests',
        title: 'مدیریت در پنل',
        description:
          'مشاهده، ویرایش یا لغو درخواست‌های در انتظار از بخش «درخواست‌های من».',
      },
    ],
    highlights: [
      'حوزه‌های متنوع خدمت: آشپزی، نظافت، حمل‌ونقل و ...',
      'ثبت درخواست با یا بدون انتخاب از نیازمندی‌ها',
      'پیگیری شفاف وضعیت تا تأیید موکب‌دار',
      'امکان ویرایش درخواست‌های در انتظار بررسی',
      'ارتباط مستقیم میان نیاز موکب و داوطلب خدمت',
    ],
    quickLinks: [
      {
        to: '/guest/honorary-volunteer/register',
        title: 'ثبت‌نام خادم',
        description: 'اعلام آمادگی خدمت',
        icon: 'honoraryRegister',
        iconBg: 'primary',
      },
      {
        to: '/guest/honorary-volunteer/needs',
        title: 'نیازمندی‌های موکب‌ها',
        description: 'فرصت‌های همکاری فعال',
        icon: 'honoraryNeeds',
        iconBg: 'accent',
      },
      {
        to: '/guest/honorary-volunteer/track',
        title: 'پیگیری درخواست',
        description: 'بررسی وضعیت با کد یا موبایل',
        icon: 'honoraryTrack',
        iconBg: 'muted',
      },
      {
        to: '/login?portal=honorary',
        title: 'ورود به پنل',
        description: 'مدیریت درخواست‌های من',
        icon: 'login',
        iconBg: 'primary',
      },
    ],
    primaryCta: { to: '/guest/honorary-volunteer/register', label: 'ثبت‌نام خادم' },
    secondaryCta: { to: '/guest/honorary-volunteer/needs', label: 'مشاهده نیازمندی‌ها' },
    faqCategory: 'honorary',
  },
};

export function getPortalOverview(id: PortalId): PortalOverview {
  return PORTAL_OVERVIEWS[id];
}
