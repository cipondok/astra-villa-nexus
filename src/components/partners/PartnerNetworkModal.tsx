import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Mail, Star } from "lucide-react";

interface PartnerNetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PartnerNetworkModal = ({ isOpen, onClose }: PartnerNetworkModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock partner data
  const partners = [
    {
      id: 1,
      name: "Jakarta Property Solutions",
      type: "Real Estate Agency",
      location: "Jakarta, Indonesia",
      rating: 4.8,
      phone: "+62 21 1234 5678",
      email: "contact@jps.com",
      specialties: ["Residential", "Commercial", "Investment"]
    },
    {
      id: 2,
      name: "Bali Villa Experts",
      type: "Villa Specialist",
      location: "Bali, Indonesia",
      rating: 4.9,
      phone: "+62 361 987 654",
      email: "info@baliexperts.com",
      specialties: ["Luxury Villas", "Resort Properties", "Land Development"]
    },
    {
      id: 3,
      name: "Surabaya Commercial Hub",
      type: "Commercial Specialist",
      location: "Surabaya, Indonesia",
      rating: 4.7,
      phone: "+62 31 456 789",
      email: "business@surabayahub.com",
      specialties: ["Office Spaces", "Retail", "Industrial"]
    }
  ];

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Partner Network Directory</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners by name, location, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      <CardDescription>{partner.type}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{partner.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{partner.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{partner.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{partner.email}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {partner.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full mt-2" size="sm">
                    Contact Partner
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No partners found matching your search criteria.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerNetworkModal;