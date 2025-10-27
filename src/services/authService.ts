import api from './api';
import { AuthResponse, User } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  async updateProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('profilePic', file);
    const { data } = await api.put<User>('/users/me/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
