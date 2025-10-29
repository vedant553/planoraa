import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Trip from '../models/Trip';
import User from '../models/User';  // ✅ Added
import { sendSuccess, sendError } from '../utils/response';

// Create new trip
export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, description, destination, startDate, endDate, budget, currency, coverImage } = req.body;

    const trip = await Trip.create({
      title,
      description,
      destination,
      startDate,
      endDate,
      budget,
      currency,
      coverImage,
      owner: userId,
      members: [{
        user: userId,
        role: 'OWNER',
        status: 'ACCEPTED',
      }],
    });

    await trip.populate('owner', 'firstName lastName email');

    sendSuccess(res, 201, { trip }, 'Trip created successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error creating trip', error.message);
  }
};

// Get all trips for current user
export const getUserTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const trips = await Trip.find({
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
    })
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, { trips, count: trips.length });
  } catch (error: any) {
    sendError(res, 500, 'Error fetching trips', error.message);
  }
};

// Get single trip
export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;

    const trip = await Trip.findById(tripId)
      .populate('owner', 'firstName lastName email avatar')
      .populate('members.user', 'firstName lastName email avatar');

    if (!trip) {
      sendError(res, 404, 'Trip not found');
      return;
    }

    // Check if user has access
    const hasAccess =
      trip.owner._id.toString() === userId ||
      trip.members.some(m => m.user._id.toString() === userId);

    if (!hasAccess) {
      sendError(res, 403, 'Access denied');
      return;
    }

    sendSuccess(res, 200, { trip });
  } catch (error: any) {
    sendError(res, 500, 'Error fetching trip', error.message);
  }
};

// Update trip
export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      sendError(res, 404, 'Trip not found');
      return;
    }

    // Check if user is owner or admin
    const isOwner = trip.owner.toString() === userId;
    const isAdmin = trip.members.some(
      m => m.user.toString() === userId && (m.role === 'OWNER' || m.role === 'ADMIN')
    );

    if (!isOwner && !isAdmin) {
      sendError(res, 403, 'Not authorized to update this trip');
      return;
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      tripId,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email');

    sendSuccess(res, 200, { trip: updatedTrip }, 'Trip updated successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error updating trip', error.message);
  }
};

// Delete trip
export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const userId = req.user!.userId;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      sendError(res, 404, 'Trip not found');
      return;
    }

    if (trip.owner.toString() !== userId) {
      sendError(res, 403, 'Only trip owner can delete the trip');
      return;
    }

    await Trip.findByIdAndDelete(tripId);

    sendSuccess(res, 200, null, 'Trip deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error deleting trip', error.message);
  }
};

// Add member to trip
export const addTripMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { userId: memberUserId, email, role } = req.body;
    const currentUserId = req.user!.userId;

    console.log('📤 Add member request:', { tripId, email, memberUserId, role });

    const trip = await Trip.findById(tripId);

    if (!trip) {
      sendError(res, 404, 'Trip not found');
      return;
    }

    // Check if current user is owner or admin
    const isOwner = trip.owner.toString() === currentUserId;
    const isAdmin = trip.members.some(m => {
      const userId = m.user?._id || m.user;
      return userId?.toString() === currentUserId && (m.role === 'OWNER' || m.role === 'ADMIN');
    });

    if (!isOwner && !isAdmin) {
      sendError(res, 403, 'Not authorized to add members');
      return;
    }

    // Lookup user by email if provided
    let finalMemberUserId = memberUserId;
    
    if (!finalMemberUserId && email) {
      console.log('🔍 Looking up user by email:', email);
      
      const user = await User.findOne({ email });
      console.log('✅ Found user:', user?._id);
      
      if (!user) {
        sendError(res, 404, `User with email ${email} not found`);
        return;
      }
      
      finalMemberUserId = (user._id as any).toString();
    }

    if (!finalMemberUserId) {
      sendError(res, 400, 'Either userId or email is required');
      return;
    }

    // ✅ FIXED: Check if user already a member (handle both populated and unpopulated)
    const isMember = trip.members.some(m => {
      const userId = m.user?._id || m.user;
      return userId?.toString() === finalMemberUserId;
    });

    if (isMember) {
      sendError(res, 400, 'User is already a member');
      return;
    }

    console.log('➕ Adding member:', finalMemberUserId);

    trip.members.push({
      user: finalMemberUserId as any,
      role: role || 'MEMBER',
      status: 'PENDING',
      joinedAt: new Date(),
    });

    console.log('💾 Saving trip...');
    await trip.save();
    
    console.log('📋 Populating members...');
    await trip.populate('members.user', 'firstName lastName email');

    console.log('✅ Member added successfully');
    sendSuccess(res, 200, { trip }, 'Member added successfully');
  } catch (error: any) {
    console.error('❌ Error adding member:', error);
    sendError(res, 500, 'Error adding member', error.message);
  }
};

