import api from './api';
import { Trip } from '@/types';

export const tripService = {
  async createTrip(data: { name: string; destination: string; startDate: string; endDate: string }): Promise<Trip> {
    const { data: trip } = await api.post<Trip>('/trips', data);
    return trip;
  },

  async getTrips(): Promise<Trip[]> {
    const { data } = await api.get<Trip[]>('/trips');
    return data;
  },

  async getTrip(id: string): Promise<Trip> {
    const { data } = await api.get<Trip>(`/trips/${id}`);
    return data;
  },

  async updateTrip(id: string, updates: Partial<Trip>, tripImage?: File): Promise<Trip> {
    if (tripImage) {
      const formData = new FormData();
      Object.entries(updates).forEach(([key, value]) => {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
      formData.append('tripImage', tripImage);
      const { data } = await api.put<Trip>(`/trips/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    }
    const { data } = await api.put<Trip>(`/trips/${id}`, updates);
    return data;
  },

  async deleteTrip(id: string): Promise<void> {
    await api.delete(`/trips/${id}`);
  },

  async addMember(tripId: string, email: string): Promise<Trip> {
    const { data } = await api.post<Trip>(`/trips/${tripId}/members`, { email });
    return data;
  },
};
