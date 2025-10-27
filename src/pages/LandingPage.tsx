import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Vote } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Planora</h1>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <img 
            src="/hero-image.png" 
            alt="Travel adventure" 
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-5xl font-bold mb-6 text-white">
          Plan Unforgettable Group Trips Together
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Collaborate, Vote and track expenses seamlessly for stress-free adventures.
        </p>
        <Button 
          size="lg" 
          className="bg-[#71bb46] text-black hover:bg-[#5e9c3a] hover:text-black"
          asChild
        >
          <Link to="/login">Start Planning Now</Link>
        </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Everything You Need</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Calendar className="h-12 w-12" />}
            title="Shared Itineraries"
            description="Create day-by-day plans that everyone can see and contribute to."
          />
          <FeatureCard
            icon={<DollarSign className="h-12 w-12" />}
            title="Expense Tracking"
            description="Track shared costs and settle up easily with secure confirmations."
          />
          <FeatureCard
            icon={<Vote className="h-12 w-12" />}
            title="Group Voting"
            description="Make decisions together with polls for activities and destinations."
          />
          <FeatureCard
            icon={<MapPin className="h-12 w-12" />}
            title="Real-time Updates"
            description="See changes instantly as your group collaborates on the trip."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-primary/10 rounded-lg p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Start Planning?</h3>
          <p className="text-muted-foreground mb-6">Join Planora today and make group travel effortless.</p>
          <Button size="lg" asChild>
            <Link to="/login">Create Your First Trip</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/80 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 Planora. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card text-card-foreground hover:shadow-lg transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
