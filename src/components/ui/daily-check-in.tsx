
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Gift, Star } from 'lucide-react';

const DailyCheckIn = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Check-in
        </CardTitle>
        <CardDescription>Check in daily to earn rewards</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current Streak</p>
            <p className="text-2xl font-bold">7 days</p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">
            <Star className="h-3 w-3 mr-1" />
            Gold Streak
          </Badge>
        </div>

        <Button className="w-full">
          <Gift className="h-4 w-4 mr-2" />
          Check In Today
        </Button>
      </CardContent>
    </Card>
  );
};

export default DailyCheckIn;
