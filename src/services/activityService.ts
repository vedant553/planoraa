import api from './api';
import { Activity } from '@/types';

export const activityService = {
  async addActivity(tripId: string, activityData: Partial<Activity>): Promise<Activity[]> {
    const { data } = await api.post<Activity[]>(`/trips/${tripId}/activities`, activityData);
    return data;
  },

  async getActivities(tripId: string): Promise<Activity[]> {
    const { data } = await api.get<Activity[]>(`/trips/${tripId}/activities`);
    return data;
  },
};
