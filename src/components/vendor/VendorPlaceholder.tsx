
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface VendorPlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

const VendorPlaceholder = ({ title, description, icon: Icon, comingSoon = true }: VendorPlaceholderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Icon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">
            {comingSoon ? 'Coming Soon' : 'Not Available'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {comingSoon 
              ? 'This feature is currently under development and will be available soon.'
              : 'This feature is not yet implemented.'
            }
          </p>
          {comingSoon && (
            <Button variant="outline" disabled>
              Notify When Ready
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorPlaceholder;
