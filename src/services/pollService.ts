import api from './api';
import { Poll } from '@/types';

export const pollService = {
  async createPoll(tripId: string, pollData: Partial<Poll>): Promise<Poll[]> {
    const { data } = await api.post<Poll[]>(`/trips/${tripId}/polls`, pollData);
    return data;
  },

  async getPolls(tripId: string): Promise<Poll[]> {
    const { data } = await api.get<Poll[]>(`/trips/${tripId}/polls`);
    return data;
  },

  async vote(tripId: string, pollId: string, voteType: 'upvote' | 'downvote'): Promise<Poll> {
    const { data } = await api.put<Poll>(`/trips/${tripId}/polls/${pollId}/vote`, { voteType });
    return data;
  },
};
