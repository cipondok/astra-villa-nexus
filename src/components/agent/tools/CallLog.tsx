
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Clock, User } from "lucide-react";

const CallLog = () => {
  const [calls] = useState([
    {
      id: 1,
      client: "Sarah Johnson",
      phone: "+62 812-3456-7890",
      type: "outgoing",
      duration: "12:34",
      date: "2024-02-15",
      time: "14:30",
      status: "completed",
      notes: "Interested in Seminyak villa"
    },
    {
      id: 2,
      client: "Michael Chen",
      phone: "+62 811-2345-6789",
      type: "incoming",
      duration: "08:15",
      date: "2024-02-15",
      time: "11:20",
      status: "completed",
      notes: "Follow-up on apartment viewing"
    },
    {
      id: 3,
      client: "Emma Wilson",
      phone: "+62 813-4567-8901",
      type: "missed",
      duration: "00:00",
      date: "2024-02-14",
      time: "16:45",
      status: "missed",
      notes: "Need to call back"
    }
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Call Log
        </CardTitle>
        <CardDescription>Track your client calls and follow-ups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.map((call) => (
            <div key={call.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{call.client}</span>
                </div>
                <Badge variant={call.status === 'completed' ? 'default' : call.status === 'missed' ? 'destructive' : 'secondary'}>
                  {call.type}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {call.duration}
                </div>
                <span>{call.date} {call.time}</span>
              </div>
            </div>
          ))}
          <Button className="w-full" variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Make New Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallLog;
