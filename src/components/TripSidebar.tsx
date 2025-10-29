import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTrip } from '@/context/TripContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, DollarSign, Vote, UserPlus, ArrowLeft, Menu, X } from 'lucide-react';
import { InviteMemberModal } from '@/components/modals/InviteMemberModal';
import { cn } from '@/lib/utils';

export function TripSidebar() {
  const { trip, loading } = useTrip();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading || !trip) {
    return (
      <aside className="w-64 border-r bg-card p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </aside>
    );
  }

  // ✅ FIXED: Use trip.owner instead of trip.createdBy
  const isOwner = typeof trip.owner === 'string' 
    ? trip.owner === user?.id 
    : trip.owner?._id === user?.id;

  const navItems = [
    { path: `/trips/${trip._id}/itinerary`, label: 'Itinerary', icon: Calendar },
    { path: `/trips/${trip._id}/expenses`, label: 'Expenses', icon: DollarSign },
    { path: `/trips/${trip._id}/voting`, label: 'Voting', icon: Vote },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0",
          isExpanded ? "translate-x-0" : "-translate-x-full"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex flex-col h-full">
          {/* Trip Header */}
          <div className="p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mb-4 w-full justify-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {/* ✅ FIXED: Use trip.coverImage instead of trip.tripImage */}
            {trip.coverImage && (
              <img 
                src={trip.coverImage} 
                alt={trip.title} 
                className="w-full h-32 object-cover rounded-lg mb-3" 
              />
            )}
            
            {/* ✅ FIXED: Use trip.title instead of trip.name */}
            <h2 className="font-bold text-lg">{trip.title}</h2>
            <p className="text-sm text-muted-foreground">{trip.destination}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Members Section */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Members</h3>
              {isOwner && (
                <Button size="sm" variant="ghost" onClick={() => setShowInviteModal(true)}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              {trip.members?.map((member) => {
                // ✅ FIXED: Handle backend member structure
                const memberUser = member.user;
                if (!memberUser) return null;
                
                // Get display name
                const displayName = memberUser.firstName 
                  ? `${memberUser.firstName} ${memberUser.lastName || ''}`.trim()
                  : memberUser.email;
                
                // Get initials
                const initials = memberUser.firstName?.[0] || memberUser.email?.[0] || '?';
                
                return (
                  <div key={memberUser._id} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={memberUser.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{displayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isExpanded && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <InviteMemberModal open={showInviteModal} onOpenChange={setShowInviteModal} />
    </>
  );
}
