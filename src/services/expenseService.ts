import api from './api';
import { Expense, Balance } from '@/types';

export const expenseService = {
  async addExpense(tripId: string, expenseData: Partial<Expense>): Promise<Expense[]> {
    const { data } = await api.post<Expense[]>(`/trips/${tripId}/expenses`, expenseData);
    return data;
  },

  async getExpenses(tripId: string): Promise<Expense[]> {
    const { data } = await api.get<Expense[]>(`/trips/${tripId}/expenses`);
    return data;
  },

  async updateExpense(tripId: string, expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    const { data } = await api.put<Expense>(`/trips/${tripId}/expenses/${expenseId}`, updates);
    return data;
  },

  async deleteExpense(tripId: string, expenseId: string): Promise<void> {
    await api.delete(`/trips/${tripId}/expenses/${expenseId}`);
  },

  async getBalances(tripId: string): Promise<Balance> {
    const { data } = await api.get<Balance>(`/trips/${tripId}/balances`);
    return data;
  },

  async settleUp(tripId: string, from: string, to: string, amount: number): Promise<void> {
    await api.post(`/trips/${tripId}/settle`, { from, to, amount });
  },

  async confirmSettlement(tripId: string, settlementId: string): Promise<void> {
    await api.put(`/trips/${tripId}/settlements/${settlementId}/confirm`);
  },
};
