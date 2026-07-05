import { btnAction } from './styles';

export const mawkibActionIconClass = 'h-3.5 w-3.5 shrink-0';

export const mawkibActionBtnBase = `${btnAction} inline-flex min-h-9 min-w-[8.25rem] items-center justify-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap`;

export const mawkibActionBtnNeutral = `${mawkibActionBtnBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;

export const mawkibActionBtnPrimary = `${mawkibActionBtnBase} border-[#4a6fa5]/30 bg-[#f0f4fa] text-[#4a6fa5] hover:bg-[#e8eef6]`;

export const mawkibActionBtnViolet = `${mawkibActionBtnBase} border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100`;

export const mawkibActionBtnDanger = `${mawkibActionBtnBase} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`;
