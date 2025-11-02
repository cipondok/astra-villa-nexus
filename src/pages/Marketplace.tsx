import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Wrench, Paintbrush, Hammer, Zap, Droplets, Shield, TreePine, Search, Filter, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ServiceCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  vendorCount: number;
  bgColor: string;
  iconColor: string;
}

const categories: ServiceCategory[] = [
  {
    id: 'construction',
    icon: <Hammer className="w-6 h-6" />,
    title: 'Construction Services',
    description: 'Professional builders & contractors',
    vendorCount: 45,
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    iconColor: 'text-orange-600 dark:text-orange-400'
  },
  {
    id: 'interior',
    icon: <Paintbrush className="w-6 h-6" />,
    title: 'Interior Design',
    description: 'Expert interior designers',
    vendorCount: 32,
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    iconColor: 'text-pink-600 dark:text-pink-400'
  },
  {
    id: 'renovation',
    icon: <Wrench className="w-6 h-6" />,
    title: 'Renovation & Repair',
    description: 'Home renovation specialists',
    vendorCount: 38,
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'electrical',
    icon: <Zap className="w-6 h-6" />,
    title: 'Electrical Services',
    description: 'Licensed electricians',
    vendorCount: 28,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    id: 'plumbing',
    icon: <Droplets className="w-6 h-6" />,
    title: 'Plumbing Services',
    description: 'Professional plumbers',
    vendorCount: 25,
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    id: 'landscaping',
    icon: <TreePine className="w-6 h-6" />,
    title: 'Landscaping',
    description: 'Garden & landscape experts',
    vendorCount: 22,
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'security',
    icon: <Shield className="w-6 h-6" />,
    title: 'Security Systems',
    description: 'Home security installation',
    vendorCount: 18,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'furniture',
    icon: <Store className="w-6 h-6" />,
    title: 'Furniture & Fixtures',
    description: 'Quality furniture suppliers',
    vendorCount: 35,
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
];

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      // Store intended destination
      sessionStorage.setItem('redirectAfterLogin', `/marketplace${selectedCategory ? `?category=${selectedCategory}` : ''}`);
    }
  }, [user, selectedCategory]);

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
                  Please log in or create an account to access our marketplace services
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-sm">Why do I need to log in?</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Connect directly with verified vendors</li>
                  <li>Save your favorite service providers</li>
                  <li>Track your service requests and bookings</li>
                  <li>Get personalized recommendations</li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full"
              >
                ← Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const filteredCategories = selectedCategory
    ? categories.filter(c => c.id === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Marketplace Services
          </h1>
          <p className="text-muted-foreground">
            Connect with trusted vendors for all your property needs
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search services or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={selectedCategory ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {selectedCategory ? 'Clear Filter' : 'All Categories'}
          </Button>
        </div>

        {/* Category Filter Chips */}
        {!selectedCategory && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.title}
              </Badge>
            ))}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Card
              key={category.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/30"
              onClick={() => navigate(`/marketplace/category/${category.id}`)}
            >
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl ${category.bgColor} flex items-center justify-center mb-4`}>
                  <div className={category.iconColor}>
                    {category.icon}
                  </div>
                </div>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {category.vendorCount} vendors
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Browse →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 dark:from-primary/20 dark:to-purple-500/20 border border-primary/20 dark:border-primary/30">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Are you a service provider?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join our marketplace and connect with thousands of property owners
            </p>
            <Button
              onClick={() => navigate('/vendor-registration')}
              size="lg"
              className="shadow-lg"
            >
              Become a Vendor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
