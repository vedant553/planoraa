import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip } from '@/types';
import { tripService } from '@/services/tripService';
import { useParams } from 'react-router-dom';

interface TripContextType {
  trip: Trip | null;
  loading: boolean;
  refreshTrip: () => Promise<void>;
  updateTrip: (updates: Partial<Trip>) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshTrip = async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      const data = await tripService.getTrip(tripId);
      setTrip(data);
    } catch (error) {
      console.error('Failed to fetch trip:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTrip();
  }, [tripId]);

  const updateTrip = (updates: Partial<Trip>) => {
    if (trip) {
      setTrip({ ...trip, ...updates });
    }
  };

  return (
    <TripContext.Provider value={{ trip, loading, refreshTrip, updateTrip }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within TripProvider');
  }
  return context;
};
