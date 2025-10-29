import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { tripService } from '@/services/tripService';
import { Trip } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Calendar, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CreateTripModal } from '@/components/modals/CreateTripModal';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTrips = async () => {
    try {
      const data = await tripService.getTrips();
      console.log('✅ Fetched trips:', data);
      setTrips(data);
    } catch (error: any) {
      console.error('❌ Error fetching trips:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load trips',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Planora</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.firstName || user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">My Trips</h2>
            <p className="text-muted-foreground">Manage and view all your trips</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Trip
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : trips.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-4">Create your first trip to get started</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Trip
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Link key={trip._id} to={`/trips/${trip._id}/itinerary`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {trip.coverImage && (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={trip.coverImage} 
                        alt={trip.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{trip.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {trip.destination}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </div>
                    <div className="mt-4 flex -space-x-2">
                      {trip.members?.slice(0, 3).map((member, idx) => (
                        <div
                          key={idx}
                          className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium border-2 border-background"
                        >
                          {member.user?.firstName?.[0] || member.user?.email?.[0] || '?'}
                        </div>
                      ))}
                      {trip.members && trip.members.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium border-2 border-background">
                          +{trip.members.length - 3}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <CreateTripModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal} 
        onSuccess={fetchTrips} 
      />
    </div>
  );
}
