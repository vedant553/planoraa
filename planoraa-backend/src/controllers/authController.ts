import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 400, 'User already exists with this email');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // Generate tokens - FIX HERE
    const accessToken = generateAccessToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    sendSuccess(res, 201, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    }, 'User registered successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error registering user', error.message);
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 401, 'Invalid credentials');
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendError(res, 401, 'Invalid credentials');
      return;
    }

    // Generate tokens - FIX HERE
    const accessToken = generateAccessToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    const refreshToken = generateRefreshToken({
      userId: (user._id as any).toString(),
      email: user.email,
    });

    sendSuccess(res, 200, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    }, 'Login successful');
  } catch (error: any) {
    sendError(res, 500, 'Error logging in', error.message);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendError(res, 400, 'Refresh token required');
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
    });

    sendSuccess(res, 200, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (error: any) {
    sendError(res, 401, 'Invalid refresh token', error.message);
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, { user });
  } catch (error: any) {
    sendError(res, 500, 'Error fetching profile', error.message);
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { firstName, lastName, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendSuccess(res, 200, { user }, 'Profile updated successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error updating profile', error.message);
  }
};
