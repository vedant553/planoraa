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
import { User, Settlement } from '@/types';

interface SettleUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SettleUpModal({ open, onOpenChange, onSuccess }: SettleUpModalProps) {
  const { trip } = useTrip();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    amount: '',
  });
  const [pendingSettlements, setPendingSettlements] = useState<Settlement[]>([]);

  useEffect(() => {
    if (trip?.settlements) {
      const pending = trip.settlements.filter((s) => s.status === 'pending');
      setPendingSettlements(pending);
    }
  }, [trip]);

  const members = trip?.members.filter((m): m is User => typeof m !== 'string') || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    setLoading(true);
    try {
      await expenseService.settleUp(trip._id, formData.from, formData.to, parseFloat(formData.amount));
      toast({ 
        title: 'Settlement recorded!', 
        description: 'Waiting for the other party to confirm.' 
      });
      onOpenChange(false);
      setFormData({ from: '', to: '', amount: '' });
      setStep('select');
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to record settlement',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (settlementId: string) => {
    if (!trip) return;
    try {
      await expenseService.confirmSettlement(trip._id, settlementId);
      toast({ title: 'Settlement confirmed!', description: 'Balances have been updated.' });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Failed to confirm settlement',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
          <DialogDescription>Record or confirm a payment</DialogDescription>
        </DialogHeader>

        {/* Pending Settlements */}
        {pendingSettlements.length > 0 && (
          <div className="space-y-2">
            <Label>Pending Confirmations</Label>
            {pendingSettlements.map((settlement) => {
              const from = typeof settlement.from === 'string' ? null : (settlement.from as User);
              const to = typeof settlement.to === 'string' ? null : (settlement.to as User);
              const isReceiver = to?._id === user?._id;

              return (
                <Card key={settlement._id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{from?.name}</span> paid{' '}
                          <span className="font-medium">{to?.name}</span>
                        </p>
                        <p className="text-lg font-semibold">${settlement.amount.toFixed(2)}</p>
                      </div>
                      {isReceiver && (
                        <Button size="sm" onClick={() => handleConfirm(settlement._id)}>
                          Confirm
                        </Button>
                      )}
                      {!isReceiver && (
                        <span className="text-sm text-muted-foreground">Waiting for confirmation</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* New Settlement Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="from">Who Paid</Label>
            <Select value={formData.from} onValueChange={(value) => setFormData({ ...formData, from: value })}>
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
            <Select value={formData.to} onValueChange={(value) => setFormData({ ...formData, to: value })}>
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
