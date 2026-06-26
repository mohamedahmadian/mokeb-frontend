import api from './api';

export interface CapacityStats {
  totalMawkibs: number;
  totalMaleCapacity: number;
  totalFemaleCapacity: number;
  totalCapacity: number;
  emptyMaleCapacity: number;
  emptyFemaleCapacity: number;
  emptyCapacity: number;
  filledCapacity: number;
}

export interface DashboardStats {
  capacityStats?: CapacityStats;
  myMawkibsStats?: CapacityStats;
  pilgrimStats?: {
    totalReservations: number;
    pendingReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
  };
  totalPilgrims?: number;
  totalMawkibOwners?: number;
  pendingRequests?: number;
  pendingReservations?: number;
  totalReservations?: number;
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats').then((r) => r.data),
};
