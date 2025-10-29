import api from './api';

export interface Trip {
  _id: string;
  title: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  budget?: number;
  currency: string;
  status: 'PLANNING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  owner: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  members: Array<{
    user: {
      _id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    role: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const tripService = {
  // Get all trips for current user
  async getTrips(): Promise<Trip[]> {
    const response = await api.get('/trips');
    return response.data.data.trips;
  },

  // Get single trip by ID
  async getTripById(tripId: string): Promise<Trip> {
    const response = await api.get(`/trips/${tripId}`);
    return response.data.data.trip;
  },

  // Create new trip
  async createTrip(data: {
    title: string;
    description?: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget?: number;
    currency?: string;
    coverImage?: string;
  }): Promise<Trip> {
    const response = await api.post('/trips', data);
    return response.data.data.trip;
  },

  // Update trip
  async updateTrip(tripId: string, data: Partial<Trip>): Promise<Trip> {
    const response = await api.put(`/trips/${tripId}`, data);
    return response.data.data.trip;
  },

  // Delete trip
  async deleteTrip(tripId: string): Promise<void> {
    await api.delete(`/trips/${tripId}`);
  },

  // Add member to trip
  async addMember(
    tripId: string,
    data: { email: string } | { userId: string; role?: string }
  ): Promise<Trip> {
    const response = await api.post(`/trips/${tripId}/members`, data);
    return response.data.data.trip;
  },

};
