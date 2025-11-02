import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Store, ArrowLeft, Star, MapPin, Phone, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Vendor {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviews: number;
  location: string;
  phone: string;
  email: string;
  image?: string;
  verified: boolean;
}

// Mock vendor data - Replace with actual API call
const mockVendors: Record<string, Vendor[]> = {
  construction: [
    {
      id: '1',
      name: 'BuildMaster Construction',
      description: 'Professional construction services with 15+ years experience',
      rating: 4.8,
      reviews: 124,
      location: 'Jakarta',
      phone: '+62 812-3456-7890',
      email: 'info@buildmaster.com',
      verified: true
    },
    {
      id: '2',
      name: 'Premium Builders',
      description: 'Specialized in residential and commercial construction',
      rating: 4.6,
      reviews: 98,
      location: 'Surabaya',
      phone: '+62 813-9876-5432',
      email: 'contact@premiumbuilders.com',
      verified: true
    }
  ],
  interior: [
    {
      id: '3',
      name: 'Modern Interior Design',
      description: 'Creating beautiful and functional spaces',
      rating: 4.9,
      reviews: 156,
      location: 'Jakarta',
      phone: '+62 814-5555-6666',
      email: 'hello@moderninterior.com',
      verified: true
    }
  ],
  renovation: [
    {
      id: '4',
      name: 'Renovation Experts',
      description: 'Home renovation and repair specialists',
      rating: 4.7,
      reviews: 89,
      location: 'Bandung',
      phone: '+62 815-7777-8888',
      email: 'info@renovationexperts.com',
      verified: true
    }
  ]
};

const categoryTitles: Record<string, string> = {
  construction: 'Construction Services',
  interior: 'Interior Design',
  renovation: 'Renovation & Repair',
  electrical: 'Electrical Services',
  plumbing: 'Plumbing Services',
  landscaping: 'Landscaping',
  security: 'Security Systems',
  furniture: 'Furniture & Fixtures'
};

const MarketplaceCategory = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuth();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-primary/20">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl mb-2">Authentication Required</CardTitle>
                <CardDescription className="text-base">
                  Please log in or create an account to view vendors
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/auth?mode=login')}
                  className="flex-1"
                  size="lg"
                >
                  Log In
                </Button>
                <Button 
                  onClick={() => navigate('/auth?mode=signup')}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Create Account
                </Button>
              </div>
              
              <Button
                onClick={() => navigate('/marketplace')}
                variant="ghost"
                className="w-full"
              >
                ← Back to Marketplace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const categoryTitle = categoryTitles[categoryId || ''] || 'Services';
  const vendors = mockVendors[categoryId || ''] || [];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {categoryTitle}
          </h1>
          <p className="text-muted-foreground">
            {vendors.length} verified vendors available
          </p>
        </div>

        {/* Vendors Grid */}
        {vendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card
                key={vendor.id}
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={vendor.image} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {vendor.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                        {vendor.verified && (
                          <Badge variant="default" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium">{vendor.rating}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({vendor.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2">
                    {vendor.description}
                  </CardDescription>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{vendor.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1"
                      onClick={() => setSelectedVendor(vendor)}
                    >
                      Contact Vendor
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No vendors available yet</CardTitle>
              <CardDescription>
                We're currently onboarding vendors for this category. Check back soon!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/marketplace')}>
                Browse Other Categories
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MarketplaceCategory;
