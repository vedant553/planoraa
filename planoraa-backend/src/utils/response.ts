import { Response } from 'express';

export const sendSuccess = (res: Response, statusCode: number, data: any, message?: string) => {
  res.status(statusCode).json({
    success: true,
    message: message || 'Success',
    data,
  });
};

export const sendError = (res: Response, statusCode: number, message: string, error?: any) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};
