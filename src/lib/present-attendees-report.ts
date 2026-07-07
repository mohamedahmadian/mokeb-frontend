import api from './api';
import type { MealType } from '../types';

export interface PresentAttendeeRow {
  reservationId: number;
  mealPlanId: number | null;
  trackingCode: string;
  fullName: string;
  mobile: string;
  nationalId: string | null;
  maleGuestCount: number;
  femaleGuestCount: number;
  isPresent: boolean;
  presence: string;
  isServed: boolean;
}

export interface PresentAttendeesReport {
  mawkibId: number;
  mawkibName: string;
  date: string;
  mealType: MealType;
  stats: {
    total: number;
    present: number;
    absent: number;
  };
  rows: PresentAttendeeRow[];
}

export const presentAttendeesReportApi = {
  get: (params: { mawkibId: number; date: string; mealType: MealType }) =>
    api
      .get<PresentAttendeesReport>('/meal-plans/reports/present-attendees', {
        params,
      })
      .then((r) => r.data),
};
