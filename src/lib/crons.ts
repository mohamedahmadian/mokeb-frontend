import api from './api';

export interface CronJobDefinition {
  id: string;
  name: string;
  description: string;
  schedule: string;
}

export interface CronJobRunResult {
  jobId: string;
  jobName: string;
  updatedCount: number;
  ranAt: string;
}

export const cronsApi = {
  listJobs: () => api.get<CronJobDefinition[]>('/crons').then((r) => r.data),

  runJob: (jobId: string) =>
    api.post<CronJobRunResult>(`/crons/${jobId}/run`).then((r) => r.data),
};
