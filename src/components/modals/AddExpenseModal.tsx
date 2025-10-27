import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { expenseService } from '@/services/expenseService';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddExpenseModal({ open, onOpenChange, onSuccess }: AddExpenseModalProps) {
  const { trip } = useTrip();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    paidBy: user?._id || '',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const members = trip?.members.filter((m): m is User => typeof m !== 'string') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip || selectedMembers.length === 0) {
      toast({ title: 'Please select at least one member', variant: 'destructive' });
      return;
    }

    const splitAmount = parseFloat(formData.amount) / selectedMembers.length;
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
      splitDetails: selectedMembers.map((memberId) => ({
        user: memberId,
        owes: splitAmount,
      })),
    };

    setLoading(true);
    try {
      await expenseService.addExpense(trip._id, expenseData);
      toast({ title: 'Expense added successfully!' });
      onOpenChange(false);
      setFormData({ description: '', amount: '', paidBy: user?._id || '', date: new Date().toISOString().split('T')[0] });
      setSelectedMembers([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to add expense',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>Record a group expense</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Dinner at restaurant"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="100.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By</Label>
            <Select value={formData.paidBy} onValueChange={(value) => setFormData({ ...formData, paidBy: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member._id} value={member._id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Split Between</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
              {members.map((member) => (
                <div key={member._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={member._id}
                    checked={selectedMembers.includes(member._id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMembers([...selectedMembers, member._id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter((id) => id !== member._id));
                      }
                    }}
                  />
                  <label htmlFor={member._id} className="text-sm cursor-pointer">
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
