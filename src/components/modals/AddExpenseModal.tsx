import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { expenseService } from '@/services/expenseService';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Type for member in the trip
interface TripMember {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

// Helper function to normalize member data
function normalizeMember(member: any): TripMember | null {
  if (!member) return null;
  
  // If member is a string ID, we can't show a name
  if (typeof member === 'string') {
    return {
      _id: member,
      name: 'Unknown User',
      email: '',
    };
  }
  
  // Handle trip member structure: { user: { _id, firstName, lastName, email }, role, status }
  const user = member.user || member;
  
  if (!user || !user._id) return null;
  
  // Extract name from user object
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const displayName = fullName || user.email || user.name || 'Unknown User';
  
  return {
    _id: user._id,
    name: displayName,
    email: user.email || '',
    profilePicture: user.avatar || user.profilePicture,
  };
}

interface FormData {
  description: string;
  amount: string;
  paidBy: string;
  date: string;
}

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
  const [formData, setFormData] = useState<FormData>({
    description: '',
    amount: '',
    paidBy: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Get and normalize members from trip
  const members = trip?.members
    ?.map(normalizeMember)
    .filter((member): member is TripMember => member !== null) || [];

  console.log('🔍 Members in modal:', members);

  // Set default paidBy when user or trip changes
  useEffect(() => {
    if (user && trip && !formData.paidBy && members.length > 0) {
      const currentUserMember = members.find(m => m._id === user.id);
      if (currentUserMember) {
        setFormData(prev => ({ ...prev, paidBy: currentUserMember._id }));
      }
    }
  }, [user, trip, members]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!trip?._id) {
      toast({ title: 'Trip not found', variant: 'destructive' });
      return;
    }

    if (selectedMembers.length === 0) {
      toast({ title: 'Please select at least one member', variant: 'destructive' });
      return;
    }

    if (!formData.paidBy) {
      toast({ title: 'Please select who paid', variant: 'destructive' });
      return;
    }

    console.log('📤 Adding expense:', formData);

    const splitAmount = parseFloat(formData.amount) / selectedMembers.length;
    
    // Transform data to match backend expectations
    const expenseData = {
      title: formData.description,
      description: formData.description,
      amount: parseFloat(formData.amount),
      currency: 'USD',
      category: 'OTHER',
      date: formData.date,
      paidBy: formData.paidBy,
      participants: selectedMembers.map((memberId) => ({
        user: memberId,
        share: splitAmount,
        isPaid: false,
      })),
    };

    console.log('📤 Sending to backend:', expenseData);

    setLoading(true);
    try {
      await expenseService.createExpense(trip._id, expenseData);
      
      toast({ title: 'Expense added successfully!' });
      onOpenChange(false);
      setFormData({ 
        description: '', 
        amount: '', 
        paidBy: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      setSelectedMembers([]);
      onSuccess();
    } catch (error: unknown) {
      console.error('❌ Error adding expense:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add expense';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no members or no trip
  if (!trip || members.length === 0) {
    return null;
  }

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
            <Select 
              value={formData.paidBy} 
              onValueChange={(value) => setFormData({ ...formData, paidBy: value })}
            >
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
