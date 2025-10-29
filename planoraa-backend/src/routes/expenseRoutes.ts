import express from 'express';
import {
  createExpense,
  getTripExpenses,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/trips/:tripId/expenses', createExpense);
router.get('/trips/:tripId/expenses', getTripExpenses);
router.put('/expenses/:expenseId', updateExpense);
router.delete('/expenses/:expenseId', deleteExpense);

export default router;
