import { Outlet } from 'react-router-dom';
import { TripProvider } from '@/context/TripContext';
import { TripSidebar } from '@/components/TripSidebar';

export default function MainLayout() {
  return (
    <TripProvider>
      <div className="flex min-h-screen w-full bg-background">
        <TripSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </TripProvider>
  );
}
