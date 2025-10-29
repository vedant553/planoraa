import { useState, useEffect } from 'react';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { pollService, Poll } from '@/services/pollService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Vote, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ProposePollModal } from '@/components/modals/ProposePollModal';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function VotingPage() {
  const { trip } = useTrip();
  const { user } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProposeModal, setShowProposeModal] = useState(false);

  const fetchPolls = async () => {
    if (!trip) return;
    try {
      const data = await pollService.getPolls(trip._id);
      console.log('✅ Fetched polls:', data);
      setPolls(data);
    } catch (error) {
      console.error('❌ Error fetching polls:', error);
      toast({ title: 'Failed to load polls', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [trip]);

  const handleVote = async (pollId: string, voteType: 'upvote' | 'downvote') => {
    if (!trip) return;
    try {
      await pollService.vote(trip._id, pollId, voteType);
      fetchPolls();
      toast({ title: 'Vote recorded!' });
    } catch (error: any) {
      console.error('❌ Error voting:', error);
      toast({
        title: 'Failed to vote',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Voting</h1>
          <p className="text-muted-foreground">Make decisions together</p>
        </div>
        <Button onClick={() => setShowProposeModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Propose Poll
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : polls.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Vote className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
            <p className="text-muted-foreground mb-4">Start making group decisions by proposing a poll</p>
            <Button onClick={() => setShowProposeModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Propose Poll
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => {
            const creator = poll.createdBy;
            const creatorName = creator.firstName 
              ? `${creator.firstName} ${creator.lastName || ''}`.trim()
              : creator.email;

            // Find user's vote with null check
            const userVote = poll.votes?.find((v) => {
              const voter = typeof v.user === 'string' ? v.user : v.user._id;
              return voter === user?.id;
            });

            const upvotes = poll.votes?.filter((v) => v.voteType === 'upvote').length || 0;
            const downvotes = poll.votes?.filter((v) => v.voteType === 'downvote').length || 0;

            return (
              <Card key={poll._id}>
                <CardHeader>
                  <CardTitle>{poll.question}</CardTitle>
                  {poll.description && <CardDescription>{poll.description}</CardDescription>}
                  <p className="text-xs text-muted-foreground">Proposed by {creatorName}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={userVote?.voteType === 'upvote' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVote(poll._id, 'upvote')}
                      className={cn(
                        userVote?.voteType === 'upvote' && 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {upvotes}
                    </Button>
                    <Button
                      variant={userVote?.voteType === 'downvote' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVote(poll._id, 'downvote')}
                      className={cn(
                        userVote?.voteType === 'downvote' && 'bg-destructive hover:bg-destructive/90'
                      )}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      {downvotes}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProposePollModal open={showProposeModal} onOpenChange={setShowProposeModal} onSuccess={fetchPolls} />
    </div>
  );
}
