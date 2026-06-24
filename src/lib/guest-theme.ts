/** Shared visual tokens for public / guest-facing pages */

export const guestTheme = {
  page: 'guest-theme min-h-screen min-h-dvh bg-[#f4f6f9] text-slate-700',
  pageInner: 'relative mx-auto max-w-2xl px-4 py-8 sm:py-10',

  headerRow: 'mb-8 flex items-center gap-3 text-right',
  headerIcon:
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-[#4a6fa5] shadow-sm',
  headerTitle: 'text-lg font-bold text-slate-800 sm:text-xl',
  headerSubtitle: 'mt-0.5 text-sm text-slate-500',

  card: 'rounded-2xl border border-slate-200/80 bg-white shadow-sm',
  cardLg: 'rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6',

  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[#4a6fa5] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#3d5d8a] disabled:opacity-50',
  btnPrimaryLg:
    'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4a6fa5] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d5d8a] disabled:opacity-50',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50',
  btnGhost:
    'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-900',

  input:
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition focus:border-[#4a6fa5] focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/20',
  searchBox:
    'flex items-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition focus-within:border-[#4a6fa5] focus-within:ring-2 focus-within:ring-[#4a6fa5]/15',

  iconPrimary: 'bg-[#e8eef6] text-[#4a6fa5]',
  iconAccent: 'bg-[#f3ebe0] text-[#8b6914]',
  iconMuted: 'bg-slate-100 text-slate-600',

  accentText: 'text-[#4a6fa5]',
  accentTextHover: 'hover:text-[#3d5d8a]',
  accentBorder: 'border-[#c5d4e8]',
  accentBg: 'bg-[#e8eef6]',
  accentBgSoft: 'bg-[#f0f4fa]',

  topBar: 'border-b border-slate-200/70 bg-white/90 backdrop-blur-sm',
  topBarInner: 'mx-auto flex max-w-2xl items-center justify-between px-4 py-3',

  serviceCard:
    'group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-[#c5d4e8] hover:shadow-md',
  resultCard:
    'group w-full rounded-xl border border-slate-200/80 bg-white p-4 text-right shadow-sm transition hover:border-[#c5d4e8] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/20',

  divider: 'h-px w-12 bg-gradient-to-l from-transparent via-[#c5a572]/50 to-transparent',
} as const;

/** Detail sections (MawkibPublicDetail, tracking header, etc.) */
export const guestDetailTheme = {
  sectionHeader: 'border-b border-slate-100 bg-gradient-to-l from-[#f0f4fa] to-white px-4 py-3.5 sm:px-5',
  sectionIcon: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8eef6] text-[#4a6fa5]',
  fieldIcon:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-slate-100',
  highlight: 'font-mono text-lg font-bold text-[#4a6fa5]',
  link: 'text-[#4a6fa5] hover:text-[#3d5d8a] hover:underline',
  amenityCard:
    'flex items-center gap-3 rounded-xl border border-[#c5d4e8] bg-[#f0f4fa] p-3 text-sm font-medium text-[#3d5d8a]',
  amenityIcon:
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#4a6fa5] shadow-sm ring-1 ring-[#c5d4e8]',
  facilityItem:
    'flex items-center gap-3 rounded-xl bg-[#f0f4fa] px-3 py-2.5 text-[#3d5d8a] ring-1 ring-[#c5d4e8]',
  trackingCard:
    'relative overflow-hidden rounded-2xl border border-[#c5d4e8] bg-gradient-to-b from-[#f0f4fa] via-white to-white text-center shadow-sm',
  trackingIcon:
    'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8eef6] text-[#4a6fa5]',
} as const;
