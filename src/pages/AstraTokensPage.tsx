import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AstraTokenHub from '@/components/astra/AstraTokenHub';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Briefcase } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

const AstraTokensPage = () => {
  const { user, loading } = useAuth();
  const { data: userRoles = [] } = useUserRoles();
  const isAgent = userRoles.includes('agent');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link to="/user-dashboard">
            <Button variant="ghost" className="text-foreground hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <User className="h-4 w-4 mr-1" />
              User Dashboard
            </Button>
          </Link>
          {isAgent && (
            <Link to="/agent-dashboard">
              <Button variant="ghost" className="text-foreground hover:bg-primary/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <Briefcase className="h-4 w-4 mr-1" />
                Agent Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <AstraTokenHub />
        </div>
      </div>
    </div>
  );
};

export default AstraTokensPage;