import type { MealPlan, MealType, Reservation } from '../types';
import { rankReservationsByLookupQuery } from './reservation-lookup';

export const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  Breakfast: 'صبحانه',
  Lunch: 'ناهار',
  Dinner: 'شام',
};

export interface MealPlanCell {
  id?: number;
  isRequired: boolean;
  isServed: boolean;
  servedAt?: string | null;
}

export interface MealPlanRow {
  date: string;
  Breakfast: MealPlanCell;
  Lunch: MealPlanCell;
  Dinner: MealPlanCell;
}

function emptyCell(): MealPlanCell {
  return { isRequired: true, isServed: false };
}

export function emptyMealPlanRow(date: string): MealPlanRow {
  return {
    date,
    Breakfast: emptyCell(),
    Lunch: emptyCell(),
    Dinner: emptyCell(),
  };
}

export function plansToRows(plans: MealPlan[]): MealPlanRow[] {
  const byDate = new Map<string, MealPlanRow>();

  for (const plan of plans) {
    const date = plan.date.slice(0, 10);
    if (!byDate.has(date)) {
      byDate.set(date, emptyMealPlanRow(date));
    }
    const row = byDate.get(date)!;
    row[plan.mealType] = {
      id: plan.id,
      isRequired: plan.isRequired,
      isServed: plan.isServed,
      servedAt: plan.servedAt,
    };
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function rowsToSaveEntries(rows: MealPlanRow[]) {
  return rows.flatMap((row) =>
    MEAL_TYPES.map((mealType) => ({
      id: row[mealType].id,
      date: row.date,
      mealType,
      isRequired: row[mealType].isRequired,
    })),
  );
}

export function pickMealPlanReservation<T extends { status: string }>(
  reservations: T[],
  query?: string,
): T | null {
  const eligible = reservations.filter(
    (item) => item.status === 'Confirmed' || item.status === 'Completed',
  );
  if (eligible.length === 0) return null;
  if (!query?.trim()) return eligible[0] ?? null;

  const ranked = rankReservationsByLookupQuery(
    eligible as unknown as Reservation[],
    query,
  );
  const match = ranked[0];
  if (!match) return null;
  return (
    eligible.find((item) => (item as unknown as Reservation).id === match.id) ?? null
  );
}

export function mealPlanPagePath(reservationId: number): string {
  return `/meal-plans?reservationId=${reservationId}`;
}

export function isMealPlanEligibleReservation(status: string): boolean {
  return status === 'Confirmed' || status === 'Completed';
}

export function isReservationMealPlanLinkVisible(
  reservation: Pick<Reservation, 'status' | 'mawkib'>,
  options: { isAdmin: boolean; isMawkibOwner: boolean },
): boolean {
  if (!isMealPlanEligibleReservation(reservation.status)) return false;
  if (options.isAdmin) return true;
  if (options.isMawkibOwner) {
    return reservation.mawkib.mealPlanManagementEnabled === true;
  }
  return false;
}

export function isDateWithinReservationStay(
  reservation: Pick<Reservation, 'reservationDate' | 'reservationEndDate'>,
  date: string,
): boolean {
  const start = reservation.reservationDate.slice(0, 10);
  const end = (reservation.reservationEndDate ?? reservation.reservationDate).slice(0, 10);
  return date >= start && date <= end;
}

export function shouldShowReservationMealPlan(
  reservation: Pick<Reservation, 'status' | 'reservationDate' | 'reservationEndDate' | 'mawkib'>,
  date: string,
): boolean {
  return (
    isMealPlanEligibleReservation(reservation.status) &&
    isDateWithinReservationStay(reservation, date) &&
    reservation.mawkib.mealPlanManagementEnabled === true
  );
}
