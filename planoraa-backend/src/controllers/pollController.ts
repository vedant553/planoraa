import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Poll from '../models/Poll';
import Trip from '../models/Trip';
import { sendSuccess, sendError } from '../utils/response';

// Create poll
export const createPoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      sendError(res, 404, 'Trip not found');
      return;
    }

    const poll = await Poll.create({
      ...req.body,
      trip: tripId,
      createdBy: userId,
      votes: [],
    });

    await poll.populate('createdBy', 'firstName lastName email');

    sendSuccess(res, 201, { poll }, 'Poll created successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error creating poll', error.message);
  }
};

// Get all polls for a trip
export const getTripPolls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;

    const polls = await Poll.find({ trip: tripId })
      .populate('createdBy', 'firstName lastName email')
      .populate('votes.user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, { polls, count: polls.length });
  } catch (error: any) {
    sendError(res, 500, 'Error fetching polls', error.message);
  }
};

// Vote on poll
export const votePoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { pollId } = req.params;
    const { voteType } = req.body;

    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      sendError(res, 400, 'Invalid vote type');
      return;
    }

    const poll = await Poll.findById(pollId);

    if (!poll) {
      sendError(res, 404, 'Poll not found');
      return;
    }

    if (!poll.isActive) {
      sendError(res, 400, 'Poll is closed');
      return;
    }

    // Check if already voted
    const existingVoteIndex = poll.votes.findIndex(
      v => v.user.toString() === userId
    );

    if (existingVoteIndex !== -1) {
      // Update existing vote
      poll.votes[existingVoteIndex].voteType = voteType as 'upvote' | 'downvote';
      poll.votes[existingVoteIndex].votedAt = new Date();
    } else {
      // Add new vote
      poll.votes.push({
        user: userId as any,
        voteType: voteType as 'upvote' | 'downvote',
        votedAt: new Date(),
      });
    }

    await poll.save();
    await poll.populate([
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'votes.user', select: 'firstName lastName email' },
    ]);

    sendSuccess(res, 200, { poll }, 'Vote recorded successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error voting', error.message);
  }
};

// Close poll
export const closePoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      sendError(res, 404, 'Poll not found');
      return;
    }

    if (poll.createdBy.toString() !== userId) {
      sendError(res, 403, 'Only poll creator can close the poll');
      return;
    }

    poll.isActive = false;
    await poll.save();

    sendSuccess(res, 200, { poll }, 'Poll closed successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error closing poll', error.message);
  }
};
