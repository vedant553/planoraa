import api from './api';

export interface Expense {
  _id: string;
  trip: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  receipt?: string;
  paidBy: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  participants: Array<{
    user: {
      _id: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    share: number;
    isPaid: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export const expenseService = {
  // Get all expenses for a trip
  async getExpenses(tripId: string): Promise<Expense[]> {
    const response = await api.get(`/trips/${tripId}/expenses`);
    return response.data.data.expenses;
  },

  // Create new expense
  async createExpense(tripId: string, data: {
    title?: string;
    description?: string;
    amount: number;
    currency?: string;
    category?: string;
    date?: string;
    paidBy?: string;
    participants: Array<{
      user: string;
      share: number;
      isPaid?: boolean;
    }>;
  }): Promise<Expense> {
    const response = await api.post(`/trips/${tripId}/expenses`, data);
    return response.data.data.expense;
  },

  // Alias for backwards compatibility
  async addExpense(tripId: string, data: any): Promise<Expense> {
    return expenseService.createExpense(tripId, data);
  },

  // Update expense
  async updateExpense(
    expenseId: string,
    data: Partial<Expense>
  ): Promise<Expense> {
    const response = await api.put(`/expenses/${expenseId}`, data);
    return response.data.data.expense;
  },

  // Delete expense
  async deleteExpense(expenseId: string): Promise<void> {
    await api.delete(`/expenses/${expenseId}`);
  },

  // Get balances (placeholder - calculates locally)
  async getBalances(tripId: string): Promise<Record<string, number>> {
    const expenses = await expenseService.getExpenses(tripId);
    const balances: Record<string, number> = {};

    expenses.forEach(expense => {
      const paidById = expense.paidBy._id;
      balances[paidById] = (balances[paidById] || 0) + expense.amount;
      
      expense.participants.forEach(participant => {
        const userId = participant.user._id;
        balances[userId] = (balances[userId] || 0) - participant.share;
      });
    });

    return balances;
  },
};
