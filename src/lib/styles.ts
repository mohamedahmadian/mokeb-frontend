import { guestTheme } from './guest-theme';

/** Shared admin/panel tokens aligned with public guest theme */

export const btnPrimary = `${guestTheme.btnPrimary} min-h-10`;

export const btnSecondary = `${guestTheme.btnSecondary} min-h-10`;

export const btnDanger =
  'inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50';

export const btnAction =
  'inline-flex min-h-9 items-center justify-center rounded-lg px-2.5 py-1.5 text-xs font-medium transition';

export const btnSuccess = `${guestTheme.btnPrimary} min-h-9 px-3 py-1.5 text-xs`;

export const inputClass = guestTheme.input;

export const filterInputClass = guestTheme.input;

export const panelCard = guestTheme.cardLg;

export const statusApproved = 'bg-[#e8eef6] text-[#3d5d8a]';

export const statusPending = 'bg-amber-100 text-amber-700';

export const statusRejected = 'bg-red-100 text-red-700';

export const statusCancelled = 'bg-slate-100 text-slate-600';

export const selectItemActive = 'bg-[#f0f4fa] font-medium text-[#4a6fa5]';

export const selectItemHover = 'hover:bg-[#f0f4fa]';

export const focusRing = 'focus:border-[#4a6fa5] focus:outline-none focus:ring-2 focus:ring-[#4a6fa5]/20';
