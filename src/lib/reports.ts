import api from './api';

export interface ReportCountItem {
  label: string;
  count: number;
}

export interface PilgrimReport {
  scope: 'all' | 'mine';
  summary: {
    total: number;
    maleCount: number;
    femaleCount: number;
    unknownGenderCount: number;
    activeCount: number;
    inactiveCount: number;
    withNationalIdCount: number;
    withProfileImageCount: number;
    withNationalIdCardCount: number;
    todayRegistrationCount: number;
    weekRegistrationCount: number;
    monthRegistrationCount: number;
  };
  genderBreakdown: ReportCountItem[];
  statusBreakdown: ReportCountItem[];
  profileCompletion: ReportCountItem[];
  byProvince: ReportCountItem[];
  byCity: ReportCountItem[];
  monthlyRegistrations: ReportCountItem[];
  weeklyRegistrations: ReportCountItem[];
}

export interface MawkibOwnersReport {
  summary: {
    total: number;
    activeCount: number;
    inactiveCount: number;
    maleCount: number;
    femaleCount: number;
    unknownGenderCount: number;
    withMawkibCount: number;
  };
  genderBreakdown: ReportCountItem[];
  byProvince: ReportCountItem[];
  byCity: ReportCountItem[];
}

export interface MawkibTodayGuestItem {
  mawkibId: number;
  mawkibName: string;
  maleGuests: number;
  femaleGuests: number;
  totalGuests: number;
  maleCapacity: number;
  femaleCapacity: number;
}

export interface MawkibsReport {
  scope: 'all' | 'mine';
  summary: {
    total: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalMaleCapacity: number;
    totalFemaleCapacity: number;
    onlineReservationEnabledCount: number;
    todayMaleGuests: number;
    todayFemaleGuests: number;
    todayTotalGuests: number;
    pendingRegistrationRequestCount: number;
    rejectedRegistrationRequestCount: number;
  };
  statusBreakdown: ReportCountItem[];
  approvalScopeTotal: number;
  byProvince: ReportCountItem[];
  byCity: ReportCountItem[];
  todayDate: string;
  todayGuestByMawkib: MawkibTodayGuestItem[];
}

export interface ReservationsReportMawkibRow {
  mawkibId: number;
  mawkibName: string;
  capacity: number;
  reservationCount: number;
  confirmedCount: number;
  occupancyPercent: number;
}

export interface ReservationsReport {
  scope: 'all' | 'mine';
  summary: {
    total: number;
    confirmedCount: number;
    pendingCount: number;
    rejectedCount: number;
    cancelledCount: number;
    completedCount: number;
    expiredCount: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
    monthGrowthPercent: number | null;
    totalMaleGuests: number;
    totalFemaleGuests: number;
    todayMaleGuests: number;
    todayFemaleGuests: number;
    averageStayDays: number;
    pendingActionCount: number;
  };
  capacity: {
    totalCapacity: number;
    occupiedCapacity: number;
    remainingCapacity: number;
    occupancyPercent: number;
  };
  statusBreakdown: ReportCountItem[];
  genderBreakdown: ReportCountItem[];
  todayGenderBreakdown: ReportCountItem[];
  mawkibRows: ReservationsReportMawkibRow[];
  highlights: {
    mostReserved: ReservationsReportMawkibRow | null;
    leastReserved: ReservationsReportMawkibRow | null;
    fullCapacityMawkibs: ReservationsReportMawkibRow[];
    noReservationMawkibs: ReservationsReportMawkibRow[];
  };
  busyDays: ReportCountItem[];
  monthlyReservations: ReportCountItem[];
}

export const reportsApi = {
  getPilgrims: () => api.get<PilgrimReport>('/reports/pilgrims').then((r) => r.data),
  getMawkibOwners: () =>
    api.get<MawkibOwnersReport>('/reports/mawkib-owners').then((r) => r.data),
  getMawkibs: () => api.get<MawkibsReport>('/reports/mawkibs').then((r) => r.data),
  getReservations: () =>
    api.get<ReservationsReport>('/reports/reservations').then((r) => r.data),
};
