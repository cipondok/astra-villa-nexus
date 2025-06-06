
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Star, User } from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  title: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  experience: string;
  properties: number;
}

interface AgentContactCardProps {
  agent: Agent;
}

const AgentContactCard = ({ agent }: AgentContactCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Your Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{agent.name}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">{agent.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{agent.rating}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Experience:</span>
            <p className="font-medium">{agent.experience}</p>
          </div>
          <div>
            <span className="text-gray-600">Properties Sold:</span>
            <p className="font-medium">{agent.properties}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            {agent.phone}
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            {agent.email}
          </Button>
        </div>

        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">Verified Agent</Badge>
          <Badge className="bg-blue-100 text-blue-800">Top Performer</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentContactCard;
