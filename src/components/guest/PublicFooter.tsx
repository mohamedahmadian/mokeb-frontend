import { Link } from "react-router-dom";
import { NavIcon, type NavIconName } from "../ui/NavIcons";

type FooterLink = { to: string; label: string; icon: NavIconName };

type FooterGroup = {
  title: string;
  icon: NavIconName;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    title: "موکب ها",
    icon: "mawkibs",
    links: [
      { to: "/guest/mawkibs", label: "موکب‌ها", icon: "mawkibs" },
      { to: "/guest/reserve", label: "رزرو موکب", icon: "reserve" },
      {
        to: "/guest/honorary-volunteer/needs",
        label: "نیازمندی‌های موکب‌ها",
        icon: "honoraryNeeds",
      },
    ],
  },
  {
    title: "زائران",
    icon: "pilgrims",
    links: [
      { to: "/register", label: "ثبت‌نام زائر", icon: "register" },
      { to: "/guest/reserve", label: "رزرو موکب", icon: "reserve" },
      { to: "/guest/track", label: "پیگیری رزرو", icon: "track" },
      { to: "/guest/reserve/guide", label: "راهنمای رزرو موکب", icon: "book" },
    ],
  },
  {
    title: "سامانه موکب داران",
    icon: "mawkibOwnerPanel",
    links: [
      {
        to: "/guest/mawkib-owner/register",
        label: "ثبت‌نام موکب‌دار",
        icon: "honoraryRegister",
      },
      { to: "/login", label: "ورود به سامانه موکب‌داران", icon: "login" },
      {
        to: "/guest/mawkib-owner/guide",
        label: "راهنمای ثبت موکب",
        icon: "book",
      },
    ],
  },
  {
    title: "سامانه خادمین",
    icon: "honorary",
    links: [
      {
        to: "/guest/honorary-volunteer/register",
        label: "ثبت‌نام خادم",
        icon: "honoraryRegister",
      },
      { to: "/login", label: "ورود به سامانه خادمین", icon: "login" },
      {
        to: "/guest/honorary-volunteer/track",
        label: "پیگیری درخواست خدمت",
        icon: "honoraryTrack",
      },
    ],
  },
];

function FooterLinkGroup({ title, icon, links }: FooterGroup) {
  return (
    <div>
      <h3 className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4a6fa5]/10 text-[#4a6fa5]">
          <NavIcon name={icon} className="h-4 w-4" />
        </span>
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${link.to}-${link.label}`}>
            <Link
              to={link.to}
              className="group flex items-center gap-2 text-sm text-slate-500 transition hover:text-[#4a6fa5]"
            >
              <NavIcon
                name={link.icon}
                className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-[#4a6fa5]"
              />
              <span>{link.label}</span>
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
          {footerGroups.map((group) => (
            <FooterLinkGroup key={group.title} {...group} />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © {year} سامانه مدیریت اسکان و خدمات زائر. تمامی حقوق محفوظ است.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <Link
              to="/guest/faq"
              className="group flex items-center gap-1.5 transition hover:text-[#4a6fa5]"
            >
              <NavIcon
                name="book"
                className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-[#4a6fa5]"
              />
              سوالات متداول
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <Link
              to="/guest/contact"
              className="group flex items-center gap-1.5 transition hover:text-[#4a6fa5]"
            >
              <NavIcon
                name="mail"
                className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-[#4a6fa5]"
              />
              ارتباط با ما
            </Link>
            <span className="hidden text-slate-300 sm:inline" aria-hidden>
              |
            </span>
            <Link
              to="/guest/about"
              className="group flex items-center gap-1.5 transition hover:text-[#4a6fa5]"
            >
              <NavIcon
                name="info"
                className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-[#4a6fa5]"
              />
              درباره ما
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
