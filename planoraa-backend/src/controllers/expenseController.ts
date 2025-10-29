import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Expense from '../models/Expense';
import Trip from '../models/Trip';
import { sendSuccess, sendError } from '../utils/response';

// Create expense
export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { tripId } = req.params;

    // Verify trip access
    const trip = await Trip.findById(tripId);
    if (!trip) {
      sendError(res, 404, 'Trip not found');
      return;
    }

    const expense = await Expense.create({
      ...req.body,
      trip: tripId,
      paidBy: userId,
    });

    await expense.populate([
      { path: 'paidBy', select: 'firstName lastName email' },
      { path: 'participants.user', select: 'firstName lastName email' },
    ]);

    sendSuccess(res, 201, { expense }, 'Expense created successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error creating expense', error.message);
  }
};

// Get all expenses for a trip
export const getTripExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId } = req.params;

    const expenses = await Expense.find({ trip: tripId })
      .populate('paidBy', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName email')
      .sort({ date: -1 });

    // Calculate total
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    sendSuccess(res, 200, { expenses, count: expenses.length, total });
  } catch (error: any) {
    sendError(res, 500, 'Error fetching expenses', error.message);
  }
};

// Update expense
export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'paidBy', select: 'firstName lastName email' },
      { path: 'participants.user', select: 'firstName lastName email' },
    ]);

    if (!expense) {
      sendError(res, 404, 'Expense not found');
      return;
    }

    sendSuccess(res, 200, { expense }, 'Expense updated successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error updating expense', error.message);
  }
};

// Delete expense
export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByIdAndDelete(expenseId);

    if (!expense) {
      sendError(res, 404, 'Expense not found');
      return;
    }

    sendSuccess(res, 200, null, 'Expense deleted successfully');
  } catch (error: any) {
    sendError(res, 500, 'Error deleting expense', error.message);
  }
};
