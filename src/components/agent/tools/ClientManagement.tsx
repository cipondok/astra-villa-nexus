import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Phone, Mail, Search, Plus, MessageSquare } from "lucide-react";

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+62 812-3456-7890",
      status: "active",
      interestedIn: "Villa in Seminyak",
      lastContact: "2024-02-15",
      budget: "Rp 15,000,000,000",
      notes: "Looking for ocean view villa"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@example.com",
      phone: "+62 811-2345-6789",
      status: "lead",
      interestedIn: "Apartment in SCBD",
      lastContact: "2024-02-14",
      budget: "Rp 5,000,000,000",
      notes: "First-time buyer, needs guidance"
    },
    {
      id: 3,
      name: "Emma Wilson",
      email: "emma.wilson@example.com",
      phone: "+62 813-4567-8901",
      status: "prospect",
      interestedIn: "Townhouse in Pondok Indah",
      lastContact: "2024-02-12",
      budget: "Rp 8,000,000,000",
      notes: "Investment property"
    }
  ]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.interestedIn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCallClient = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmailClient = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'lead': return 'secondary';
      case 'prospect': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Client Management
        </CardTitle>
        <CardDescription>Manage your clients and track their property interests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          <div className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span>{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(client.status)} className="capitalize">
                    {client.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Interested in:</span>
                    <p className="font-medium">{client.interestedIn}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <p className="font-medium">{client.budget}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Contact:</span>
                    <p className="font-medium">{client.lastContact}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="font-medium">{client.notes}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleCallClient(client.phone)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEmailClient(client.email)}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientManagement;