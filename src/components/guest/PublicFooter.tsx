import { Link } from 'react-router-dom';

const quickLinks = [
  { to: '/', label: 'صفحه اصلی' },
  { to: '/guest/mawkibs', label: 'موکب‌ها' },
  { to: '/guest/reserve', label: 'رزرو موکب' },
  { to: '/guest/track', label: 'پیگیری رزرو' },
];

const pilgrimLinks = [
  { to: '/register', label: 'ثبت‌نام زائر' },
  { to: '/guest/reserve', label: 'رزرو موکب' },
  { to: '/guest/track', label: 'پیگیری رزرو' },
];

const ownerLinks = [
  { to: '/guest/mawkib-owner/register', label: 'ثبت‌نام موکب‌دار' },
  { to: '/login', label: 'ورود موکب‌داران' },
];

function FooterLinkGroup({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="text-sm text-slate-500 transition hover:text-[#4a6fa5]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-base font-bold text-slate-800">سامانه اسکان زائر</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              سامانه یکپارچه رزرو، مدیریت و پیگیری اسکان زائران در موکب‌های خدمات‌رسان.
            </p>
          </div>

          <FooterLinkGroup title="دسترسی سریع" links={quickLinks} />
          <FooterLinkGroup title="زائران" links={pilgrimLinks} />
          <FooterLinkGroup title="موکب‌داران" links={ownerLinks} />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {year} سامانه مدیریت اسکان و خدمات زائر. تمامی حقوق محفوظ است.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <a href="mailto:info@mokeb.local" className="transition hover:text-[#4a6fa5]">
              ارتباط با ما
            </a>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <Link to="/login" className="transition hover:text-[#4a6fa5]">
              ورود به پنل
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
