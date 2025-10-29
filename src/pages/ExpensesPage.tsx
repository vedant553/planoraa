import { useState, useEffect } from 'react';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { expenseService } from '@/services/expenseService';
import { Expense } from '@/services/expenseService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';
import { SettleUpModal } from '@/components/modals/SettleUpModal';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ExpensesPage() {
  const { trip } = useTrip();
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);

  const fetchData = async () => {
    if (!trip) return;
    
    try {
      const expensesData = await expenseService.getExpenses(trip._id);
      
      console.log('✅ Fetched expenses:', expensesData);
      setExpenses(expensesData);
      
      // Calculate balances locally with null checks
      const calculatedBalances: Record<string, number> = {};
      
      expensesData.forEach(expense => {
        // Check if paidBy exists and has _id
        if (expense.paidBy && expense.paidBy._id) {
          const paidById = expense.paidBy._id;
          calculatedBalances[paidById] = (calculatedBalances[paidById] || 0) + expense.amount;
        }
        
        // Check participants array
        if (expense.participants && Array.isArray(expense.participants)) {
          expense.participants.forEach(participant => {
            // Check if participant and user exist
            if (participant && participant.user && participant.user._id) {
              const userId = participant.user._id;
              calculatedBalances[userId] = (calculatedBalances[userId] || 0) - participant.share;
            }
          });
        }
      });
      
      setBalances(calculatedBalances);
    } catch (error) {
      console.error('❌ Error loading expenses:', error);
      toast({ title: 'Failed to load expenses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [trip]);

  const userBalance = user ? balances[user.id] || 0 : 0;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const userOwed = Object.values(balances).reduce((sum, bal) => (bal > 0 ? sum + bal : sum), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track and settle group expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSettleModal(true)}>
            Settle Up
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl">${totalExpenses.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className={userBalance < 0 ? 'border-destructive' : userBalance > 0 ? 'border-green-500' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>Your Balance</CardDescription>
            <CardTitle className={`text-2xl ${userBalance < 0 ? 'text-destructive' : userBalance > 0 ? 'text-green-600' : ''}`}>
              ${Math.abs(userBalance).toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userBalance < 0 ? (
              <div className="flex items-center text-sm text-destructive">
                <TrendingDown className="h-4 w-4 mr-1" />
                You owe
              </div>
            ) : userBalance > 0 ? (
              <div className="flex items-center text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                You are owed
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Settled up</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Owed to Group</CardDescription>
            <CardTitle className="text-2xl">${userOwed.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : expenses.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No expenses yet</h3>
            <p className="text-muted-foreground mb-4">Start tracking by adding your first expense</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => {
                  // Safe access to payer info
                  const payer = expense.paidBy;
                  const payerName = payer 
                    ? (payer.firstName 
                        ? `${payer.firstName} ${payer.lastName || ''}`.trim()
                        : payer.email)
                    : 'Unknown';

                  return (
                    <div key={expense._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{expense.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Paid by {payerName} • {format(new Date(expense.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">${expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          Split {expense.participants?.length || 0} ways
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      <AddExpenseModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={fetchData} />
      <SettleUpModal open={showSettleModal} onOpenChange={setShowSettleModal} onSuccess={fetchData} />
    </div>
  );
}
