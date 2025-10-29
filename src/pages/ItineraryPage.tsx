import { useState, useEffect } from 'react';
import { useTrip } from '@/context/TripContext';
import { activityService } from '@/services/activityService';
import { Activity } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, MapPin, Clock } from 'lucide-react';
import { AddActivityModal } from '@/components/modals/AddActivityModal';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ItineraryPage() {
  const { trip } = useTrip();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchActivities = async () => {
    if (!trip) return;
    try {
      const data = await activityService.getActivities(trip._id);
      console.log('✅ Fetched activities:', data);
      setActivities(data);
    } catch (error) {
      console.error('❌ Error fetching activities:', error);
      toast({ title: 'Failed to load activities', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [trip]);

  // ✅ FIXED: Use startTime instead of dateTime
  const groupedActivities = activities.reduce((acc, activity) => {
    // ✅ Use startTime from backend
    const date = format(parseISO(activity.startTime), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Itinerary</h1>
          <p className="text-muted-foreground">Plan your daily activities</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : Object.keys(groupedActivities).length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No activities yet</h3>
            <p className="text-muted-foreground mb-4">Start planning by adding your first activity</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dayActivities]) => (
              <div key={date}>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(parseISO(date), 'EEEE, MMMM d, yyyy')}
                </h2>
                <div className="space-y-3">
                  {dayActivities
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .map((activity) => (
                      <Card key={activity._id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{activity.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {activity.description && (
                            <p className="text-muted-foreground">{activity.description}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              {format(parseISO(activity.startTime), 'h:mm a')}
                            </div>
                            {activity.location && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {activity.location}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <AddActivityModal open={showAddModal} onOpenChange={setShowAddModal} onSuccess={fetchActivities} />
    </div>
  );
}
