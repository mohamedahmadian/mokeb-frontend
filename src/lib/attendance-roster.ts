import api from './api';

export type AttendanceRosterKind = 'absent' | 'present';

export interface AttendanceRosterRow {
  reservationId: number;
  fullName: string;
  mobile: string;
  nationalId: string | null;
  durationMs: number;
  lastExitAt: string | null;
}

export interface AttendanceRosterResponse {
  kind: AttendanceRosterKind;
  generatedAt: string;
  mawkibId: number | null;
  rows: AttendanceRosterRow[];
}

export const attendanceRosterApi = {
  get: (kind: AttendanceRosterKind, mawkibId?: number) =>
    api
      .get<AttendanceRosterResponse>('/reservations/attendance-roster', {
        params: {
          kind,
          ...(mawkibId ? { mawkibId } : {}),
        },
      })
      .then((r) => r.data),
};
