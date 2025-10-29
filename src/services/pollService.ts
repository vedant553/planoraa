import api from './api';

export interface Poll {
  _id: string;
  trip: string;
  question: string;
  description?: string;
  type: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  votes: Array<{
    user: {
      _id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    voteType: 'upvote' | 'downvote';
    votedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const pollService = {
  // Get all polls for a trip
  async getPolls(tripId: string): Promise<Poll[]> {
    const response = await api.get(`/trips/${tripId}/polls`);
    return response.data.data.polls;
  },

  // Create new poll
  async createPoll(tripId: string, data: {
    question: string;
    description?: string;
  }): Promise<Poll> {
    const response = await api.post(`/trips/${tripId}/polls`, data);
    return response.data.data.poll;
  },

  // Vote on poll
  async vote(tripId: string, pollId: string, voteType: 'upvote' | 'downvote'): Promise<Poll> {
    const response = await api.post(`/polls/${pollId}/vote`, { voteType });
    return response.data.data.poll;
  },

  // Close poll
  async closePoll(pollId: string): Promise<Poll> {
    const response = await api.put(`/polls/${pollId}/close`);
    return response.data.data.poll;
  },
};
