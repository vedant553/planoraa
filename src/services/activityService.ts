import api from './api';

export interface Activity {
  _id: string;
  trip: string;
  title: string;
  description?: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  startTime: string;
  endTime?: string;
  category: string;
  priority: string;
  status: string;
  notes?: string;
  cost?: number;
  bookingUrl?: string;
  sortOrder: number;
  createdBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const activityService = {
  // Get all activities for a trip
  async getActivities(tripId: string): Promise<Activity[]> {
    const response = await api.get(`/trips/${tripId}/activities`);
    return response.data.data.activities;
  },

  // Create new activity
  async createActivity(tripId: string, data: {
    title: string;
    description?: string;
    location?: string;
    coordinates?: { latitude: number; longitude: number };
    startTime: string;
    endTime?: string;
    category?: string;
    priority?: string;
    status?: string;
    notes?: string;
    cost?: number;
    bookingUrl?: string;
    sortOrder?: number;
  }): Promise<Activity> {
    const response = await api.post(`/trips/${tripId}/activities`, data);
    return response.data.data.activity;
  },

  // Update activity
  async updateActivity(
    activityId: string,
    data: Partial<Activity>
  ): Promise<Activity> {
    const response = await api.put(`/activities/${activityId}`, data);
    return response.data.data.activity;
  },

  // Delete activity
  async deleteActivity(activityId: string): Promise<void> {
    await api.delete(`/activities/${activityId}`);
  },
};
