
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, Phone, CheckCircle } from "lucide-react";

const ScheduleViewings = () => {
  const [viewings, setViewings] = useState([
    {
      id: 1,
      property: "Luxury Villa in Seminyak",
      client: "Sarah Johnson",
      clientPhone: "+62 812-3456-7890",
      date: "2024-02-16",
      time: "10:00",
      status: "confirmed",
      location: "Seminyak, Bali",
      notes: "Client interested in immediate purchase"
    },
    {
      id: 2,
      property: "Modern Apartment in Kuningan",
      client: "Michael Chen",
      clientPhone: "+62 811-2345-6789",
      date: "2024-02-16",
      time: "14:30",
      status: "pending",
      location: "Kuningan, Jakarta",
      notes: "Follow-up viewing, price negotiation"
    },
    {
      id: 3,
      property: "Penthouse in SCBD",
      client: "Emma Wilson",
      clientPhone: "+62 813-4567-8901",
      date: "2024-02-17",
      time: "11:00",
      status: "confirmed",
      location: "SCBD, Jakarta",
      notes: "VIP client, premium service required"
    }
  ]);

  const handleUpdateStatus = (id: number, newStatus: string) => {
    setViewings(prev => prev.map(v => v.id === id ? {...v, status: newStatus} : v));
  };

  const handleCallClient = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

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
            <div key={viewing.id} className="p-4 border rounded-lg space-y-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">{viewing.property}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={viewing.status === 'confirmed' ? 'default' : 'secondary'}>
                    {viewing.status}
                  </Badge>
                  {viewing.status === 'pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateStatus(viewing.id, 'confirmed')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{viewing.client}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="p-1 h-6 w-6"
                      onClick={() => handleCallClient(viewing.clientPhone)}
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{viewing.date} at {viewing.time}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{viewing.location}</span>
                  </div>
                  {viewing.notes && (
                    <p className="text-muted-foreground italic text-xs">{viewing.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="pt-4 border-t">
            <Button className="w-full" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Viewing
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleViewings;
