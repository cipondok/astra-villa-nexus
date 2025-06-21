
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import TokenManagementHub from '@/components/admin/TokenManagementHub';

const TokenConfiguration = () => {
  const { isAuthenticated, profile } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to access token configuration</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Admin access required to manage token configuration
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ASTRA Token Configuration</h1>
          <p className="text-muted-foreground">
            Manage and configure the ASTRA token system
          </p>
        </div>
        
        <TokenManagementHub />
      </div>
    </div>
  );
};

export default TokenConfiguration;
