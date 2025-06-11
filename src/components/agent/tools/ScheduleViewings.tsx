
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";

const ScheduleViewings = () => {
  const [viewings] = useState([
    {
      id: 1,
      property: "Luxury Villa in Seminyak",
      client: "Sarah Johnson",
      date: "2024-02-16",
      time: "10:00",
      status: "confirmed",
      location: "Seminyak, Bali"
    },
    {
      id: 2,
      property: "Modern Apartment in Kuningan",
      client: "Michael Chen",
      date: "2024-02-16",
      time: "14:30",
      status: "pending",
      location: "Kuningan, Jakarta"
    },
    {
      id: 3,
      property: "Penthouse in SCBD",
      client: "Emma Wilson",
      date: "2024-02-17",
      time: "11:00",
      status: "confirmed",
      location: "SCBD, Jakarta"
    }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Viewings
        </CardTitle>
        <CardDescription>Manage property viewing appointments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {viewings.map((viewing) => (
            <div key={viewing.id} className="p-3 border rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{viewing.property}</span>
                <Badge variant={viewing.status === 'confirmed' ? 'default' : 'secondary'}>
                  {viewing.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {viewing.client}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {viewing.date} at {viewing.time}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {viewing.location}
              </div>
            </div>
          ))}
          <Button className="w-full" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule New Viewing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleViewings;
