import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 401, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      sendError(res, 401, 'User not found');
      return;
    }

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      sendError(res, 401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      sendError(res, 401, 'Token expired');
    } else {
      sendError(res, 500, 'Authentication error', error.message);
    }
  }
};
