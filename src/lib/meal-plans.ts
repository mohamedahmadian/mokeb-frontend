import api from './api';
import type { MealPlan, MealType } from '../types';

export interface SaveMealPlanEntry {
  id?: number;
  date: string;
  mealType: MealType;
  isRequired: boolean;
  guestCount?: number;
}

export const mealPlansApi = {
  getByReservation: (reservationId: number) =>
    api
      .get<MealPlan[]>(`/meal-plans/reservation/${reservationId}`)
      .then((r) => r.data),

  generate: (reservationId: number) =>
    api
      .post<MealPlan[]>(`/meal-plans/reservation/${reservationId}/generate`)
      .then((r) => r.data),

  save: (reservationId: number, entries: SaveMealPlanEntry[]) =>
    api
      .put<MealPlan[]>(`/meal-plans/reservation/${reservationId}`, { entries })
      .then((r) => r.data),

  addDay: (reservationId: number, date: string) =>
    api
      .post<MealPlan[]>(`/meal-plans/reservation/${reservationId}/days`, { date })
      .then((r) => r.data),

  removeDay: (reservationId: number, date: string) =>
    api
      .delete<MealPlan[]>(`/meal-plans/reservation/${reservationId}/days/${date}`)
      .then((r) => r.data),

  serve: (mealPlanId: number, guestCount: number) =>
    api
      .patch<MealPlan>(`/meal-plans/${mealPlanId}/serve`, { guestCount })
      .then((r) => r.data),

  upsertEntry: (
    reservationId: number,
    entry: { date: string; mealType: MealType; isRequired: boolean },
  ) =>
    api
      .patch<MealPlan[]>(`/meal-plans/reservation/${reservationId}/entry`, entry)
      .then((r) => r.data),
};
