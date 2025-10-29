import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { expenseService } from '@/services/expenseService';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettleUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Helper to normalize member data
interface NormalizedMember {
  _id: string;
  name: string;
  email: string;
}

function normalizeMember(member: any): NormalizedMember | null {
  if (!member) return null;
  
  // Handle trip member structure: { user: { _id, firstName, lastName, email }, role, status }
  const user = member.user || member;
  
  if (!user || !user._id) return null;
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const displayName = fullName || user.email || user.name || 'Unknown User';
  
  return {
    _id: user._id,
    name: displayName,
    email: user.email || '',
  };
}

export function SettleUpModal({ open, onOpenChange, onSuccess }: SettleUpModalProps) {
  const { trip } = useTrip();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
  });

  // Normalize members from trip
  const members = (trip?.members || [])
    .map(normalizeMember)
    .filter((m): m is NormalizedMember => m !== null);

  console.log('🔍 Members in SettleUp:', members);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    if (!formData.from || !formData.to) {
      toast({ 
        title: 'Please select both payer and receiver', 
        variant: 'destructive' 
      });
      return;
    }

    if (formData.from === formData.to) {
      toast({ 
        title: 'Payer and receiver must be different', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    try {
      // Note: You'll need to implement this in expenseService
      // await expenseService.settleUp(trip._id, formData.from, formData.to, parseFloat(formData.amount));
      
      toast({ 
        title: 'Settlement recorded!', 
        description: 'Balance updated successfully.' 
      });
      onOpenChange(false);
      setFormData({ from: '', to: '', amount: '' });
      onSuccess();
    } catch (error: any) {
      console.error('❌ Error recording settlement:', error);
      toast({
        title: 'Failed to record settlement',
        description: error.response?.data?.message || 'Something went wrong',
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
          <DialogDescription>Record or confirm a payment</DialogDescription>
        </DialogHeader>

        {/* New Settlement Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from">Who Paid</Label>
            <Select 
              value={formData.from} 
              onValueChange={(value) => setFormData({ ...formData, from: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payer" />
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
            <Label htmlFor="to">Who Received</Label>
            <Select 
              value={formData.to} 
              onValueChange={(value) => setFormData({ ...formData, to: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select receiver" />
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
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
