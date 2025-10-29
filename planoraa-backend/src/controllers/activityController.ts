import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Activity from '../models/Activity';
import Trip from '../models/Trip';
import { sendSuccess, sendError } from '../utils/response';

// Create activity
export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { tripId } = req.params;

    // Verify user has access to trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      sendError(res, 404, 'Trip not found');
      return;
    }

    const hasAccess = 
      trip.owner.toString() === userId ||
      trip.members.some(m => m.user.toString() === userId);

    if (!hasAccess) {
      sendError(res, 403, 'Access denied');
      return;
    }

    const activity = await Activity.create({
      ...req.body,
      trip: tripId,
      createdBy: userId,
    });

    await activity.populate('createdBy', 'firstName lastName email');

    sendSuccess(res, 201, { activity }, 'Activity created successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error creating activity', error.message);
  }
};

// Get all activities for a trip
export const getTripActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;

    const activities = await Activity.find({ trip: tripId })
      .populate('createdBy', 'firstName lastName email')
      .sort({ sortOrder: 1, startTime: 1 });

    sendSuccess(res, 200, { activities, count: activities.length });
  } catch (error: any) {
    sendError(res, 500, 'Error fetching activities', error.message);
  }
};

// Update activity
export const updateActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findByIdAndUpdate(
      activityId,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    if (!activity) {
      sendError(res, 404, 'Activity not found');
      return;
    }

    sendSuccess(res, 200, { activity }, 'Activity updated successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error updating activity', error.message);
  }
};

// Delete activity
export const deleteActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findByIdAndDelete(activityId);

    if (!activity) {
      sendError(res, 404, 'Activity not found');
      return;
    }

    sendSuccess(res, 200, null, 'Activity deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error deleting activity', error.message);
  }
};
