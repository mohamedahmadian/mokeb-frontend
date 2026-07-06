import { btnAction } from '../../lib/styles';

export const mealPlanIconClass = 'h-3.5 w-3.5 shrink-0';

const mealPlanActionBtn = `${btnAction} inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border shadow-sm !min-h-8 !px-2.5 !py-1.5 !text-[11px] font-medium disabled:cursor-not-allowed disabled:opacity-50`;

export const mealPlanSecondaryBtn = `${mealPlanActionBtn} border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50`;

export const mealPlanPrimaryBtn = `${mealPlanActionBtn} border-emerald-700 bg-emerald-600 text-white hover:border-emerald-800 hover:bg-emerald-700`;

export const mealPlanDangerBtn = `${mealPlanSecondaryBtn} border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50`;

export const mealPlanAccentBtn = `${mealPlanActionBtn} border-[#3d5d8a] bg-[#4a6fa5] text-white hover:border-[#2f4a6f] hover:bg-[#3d5d8a]`;
