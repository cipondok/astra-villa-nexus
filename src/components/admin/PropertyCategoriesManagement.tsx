import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Key, 
  Construction, 
  Rocket,
  Save,
  X,
  Search,
  RefreshCw
} from "lucide-react";

interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  parent_id: string | null;
  meta_data: any;
  created_at: string;
  updated_at: string;
}

interface PropertyService {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  service_type: string;
  price_range_min: number | null;
  price_range_max: number | null;
  features: string[];
  requirements: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const PropertyCategoriesManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState<PropertyCategory | null>(null);
  const [selectedService, setSelectedService] = useState<PropertyService | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"categories" | "services">("categories");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch property categories
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['property-categories'],
    queryFn: async (): Promise<PropertyCategory[]> => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch property services
  const { data: servicesData, isLoading: servicesLoading, refetch: refetchServices } = useQuery({
    queryKey: ['property-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_services')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Transform services data to match our interface
  const services: PropertyService[] = servicesData?.map(service => ({
    ...service,
    features: Array.isArray(service.features) ? service.features as string[] : [],
    requirements: Array.isArray(service.requirements) ? service.requirements as string[] : [],
  })) || [];

  // Initialize sample data
  useEffect(() => {
    const initializeSampleData = async () => {
      if (categories && categories.length === 0) {
        try {
          // Insert main categories
          const mainCategories = [
            { name: 'Buy Properties', slug: 'buy', description: 'Properties available for purchase', icon: '🏠', display_order: 1 },
            { name: 'Rent Properties', slug: 'rent', description: 'Properties available for rental', icon: '🔑', display_order: 2 },
            { name: 'New Projects', slug: 'new-projects', description: 'Upcoming and under construction projects', icon: '🏗️', display_order: 3 },
            { name: 'Pre-Launching', slug: 'pre-launching', description: 'Exclusive pre-launch property offers', icon: '🚀', display_order: 4 }
          ];

          const { data: insertedCategories, error } = await supabase
            .from('property_categories')
            .insert(mainCategories)
            .select();

          if (error) throw error;

          // Insert subcategories
          const subcategories = [
            // Buy subcategories
            { name: 'Residential Houses', slug: 'residential-houses', description: 'Single family homes and houses', icon: '🏡', display_order: 1, parent_id: insertedCategories.find(c => c.slug === 'buy')?.id },
            { name: 'Apartments & Condos', slug: 'apartments-condos', description: 'Apartments and condominium units', icon: '🏢', display_order: 2, parent_id: insertedCategories.find(c => c.slug === 'buy')?.id },
            { name: 'Commercial Properties', slug: 'commercial-buy', description: 'Office buildings, shops, and commercial spaces', icon: '🏪', display_order: 3, parent_id: insertedCategories.find(c => c.slug === 'buy')?.id },
            { name: 'Land & Plots', slug: 'land-plots', description: 'Vacant land and building plots', icon: '🌍', display_order: 4, parent_id: insertedCategories.find(c => c.slug === 'buy')?.id },
            
            // Rent subcategories
            { name: 'Residential Rental', slug: 'residential-rental', description: 'Houses and apartments for rent', icon: '🏠', display_order: 1, parent_id: insertedCategories.find(c => c.slug === 'rent')?.id },
            { name: 'Commercial Rental', slug: 'commercial-rental', description: 'Office and retail spaces for rent', icon: '🏢', display_order: 2, parent_id: insertedCategories.find(c => c.slug === 'rent')?.id },
            { name: 'Short Term Rental', slug: 'short-term-rental', description: 'Vacation and short-term rentals', icon: '🏖️', display_order: 3, parent_id: insertedCategories.find(c => c.slug === 'rent')?.id },
            
            // New Projects subcategories
            { name: 'Under Construction', slug: 'under-construction', description: 'Projects currently under construction', icon: '🚧', display_order: 1, parent_id: insertedCategories.find(c => c.slug === 'new-projects')?.id },
            { name: 'Approved Projects', slug: 'approved-projects', description: 'Approved projects ready to start', icon: '✅', display_order: 2, parent_id: insertedCategories.find(c => c.slug === 'new-projects')?.id },
            { name: 'Mixed Development', slug: 'mixed-development', description: 'Mixed-use development projects', icon: '🏙️', display_order: 3, parent_id: insertedCategories.find(c => c.slug === 'new-projects')?.id },
            
            // Pre-Launching subcategories
            { name: 'Early Bird Offers', slug: 'early-bird', description: 'Special pre-launch pricing', icon: '🐦', display_order: 1, parent_id: insertedCategories.find(c => c.slug === 'pre-launching')?.id },
            { name: 'VIP Preview', slug: 'vip-preview', description: 'Exclusive preview for VIP customers', icon: '👑', display_order: 2, parent_id: insertedCategories.find(c => c.slug === 'pre-launching')?.id },
            { name: 'Investment Opportunities', slug: 'investment-pre', description: 'Pre-launch investment opportunities', icon: '💎', display_order: 3, parent_id: insertedCategories.find(c => c.slug === 'pre-launching')?.id }
          ];

          await supabase.from('property_categories').insert(subcategories);

          // Insert sample services
          const sampleServices = [
            {
              category_id: insertedCategories.find(c => c.slug === 'buy')?.id,
              name: 'Home Purchase Assistance',
              slug: 'home-purchase',
              description: 'Complete assistance for buying residential properties',
              service_type: 'buy',
              features: ['Property evaluation', 'Legal documentation', 'Financing assistance', 'Post-purchase support']
            },
            {
              category_id: insertedCategories.find(c => c.slug === 'rent')?.id,
              name: 'Rental Management',
              slug: 'rental-management',
              description: 'Full rental property management services',
              service_type: 'rent',
              features: ['Tenant screening', 'Rent collection', 'Property maintenance', 'Legal compliance']
            },
            {
              category_id: insertedCategories.find(c => c.slug === 'new-projects')?.id,
              name: 'Project Investment',
              slug: 'project-investment',
              description: 'Investment opportunities in new development projects',
              service_type: 'new_projects',
              features: ['Early booking discounts', 'Construction updates', 'Guaranteed returns', 'Flexible payment plans']
            },
            {
              category_id: insertedCategories.find(c => c.slug === 'pre-launching')?.id,
              name: 'Pre-Launch Booking',
              slug: 'pre-launch-booking',
              description: 'Exclusive pre-launch property bookings',
              service_type: 'pre_launching',
              features: ['Best price guarantee', 'Priority selection', 'VIP customer benefits', 'Exclusive access']
            }
          ];

          await supabase.from('property_services').insert(sampleServices);
          
          refetchCategories();
          refetchServices();
          showSuccess("Sample Data", "Property categories and services initialized successfully!");
        } catch (error) {
          console.error('Error initializing sample data:', error);
        }
      }
    };

    initializeSampleData();
  }, [categories, refetchCategories, refetchServices, showSuccess]);

  // Category operations
  const categoryMutation = useMutation({
    mutationFn: async (categoryData: any) => {
      if (categoryData.id) {
        const { error } = await supabase
          .from('property_categories')
          .update(categoryData)
          .eq('id', categoryData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('property_categories')
          .insert([categoryData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", "Category saved successfully!");
      setIsCategoryModalOpen(false);
      refetchCategories();
    },
    onError: (error: any) => {
      showError("Error", error.message);
    },
  });

  // Service operations
  const serviceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      if (serviceData.id) {
        const { error } = await supabase
          .from('property_services')
          .update(serviceData)
          .eq('id', serviceData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('property_services')
          .insert([serviceData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", "Service saved successfully!");
      setIsServiceModalOpen(false);
      refetchServices();
    },
    onError: (error: any) => {
      showError("Error", error.message);
    },
  });

  const getMainCategories = () => {
    return categories?.filter(cat => !cat.parent_id) || [];
  };

  const getSubCategories = (parentId: string) => {
    return categories?.filter(cat => cat.parent_id === parentId) || [];
  };

  const getCategoryIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'buy': return <Home className="h-4 w-4" />;
      case 'rent': return <Key className="h-4 w-4" />;
      case 'new_projects': return <Construction className="h-4 w-4" />;
      case 'pre_launching': return <Rocket className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Building2 className="h-5 w-5" />
            Property Categories & Services Management
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage property categories (Buy, Rent, New Projects, Pre-Launching) and their associated services
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-border bg-card rounded-t-lg p-2">
        <button
          onClick={() => setActiveTab("categories")}
          className={`py-2 px-4 border-b-2 font-medium text-sm rounded-md transition-colors ${
            activeTab === "categories"
              ? "border-primary text-primary bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Categories ({categories?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`py-2 px-4 border-b-2 font-medium text-sm rounded-md transition-colors ${
            activeTab === "services"
              ? "border-primary text-primary bg-primary/10"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Services ({services?.length || 0})
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-card-foreground">Property Categories</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Main categories and subcategories for property organization
                </CardDescription>
              </div>
              <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedCategory(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <CategoryModal
                  category={selectedCategory}
                  parentCategories={getMainCategories()}
                  onSave={(data) => categoryMutation.mutate(data)}
                  isLoading={categoryMutation.isPending}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading categories...</div>
            ) : (
              <div className="space-y-6">
                {getMainCategories().map((mainCat) => (
                  <div key={mainCat.id} className="border border-border rounded-lg p-4 bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mainCat.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg text-card-foreground">{mainCat.name}</h3>
                          <p className="text-muted-foreground text-sm">{mainCat.description}</p>
                        </div>
                        <Badge variant={mainCat.is_active ? "default" : "secondary"} className={
                          mainCat.is_active 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        }>
                          {mainCat.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(mainCat);
                          setIsCategoryModalOpen(true);
                        }}
                        className="border-border text-foreground hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Subcategories */}
                    <div className="ml-8 space-y-2">
                      {getSubCategories(mainCat.id).map((subCat) => (
                        <div key={subCat.id} className="flex items-center justify-between p-2 bg-muted/50 rounded border border-border">
                          <div className="flex items-center gap-2">
                            <span>{subCat.icon}</span>
                            <span className="font-medium text-foreground">{subCat.name}</span>
                            <Badge variant="outline" className="border-border text-muted-foreground">
                              {subCat.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(subCat);
                              setIsCategoryModalOpen(true);
                            }}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-card-foreground">Property Services</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Services available for each property category
                </CardDescription>
              </div>
              <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedService(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <ServiceModal
                  service={selectedService}
                  categories={categories || []}
                  onSave={(data) => serviceMutation.mutate(data)}
                  isLoading={serviceMutation.isPending}
                />
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading services...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">Service</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Price Range</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services?.map((service) => {
                      const category = categories?.find(c => c.id === service.category_id);
                      return (
                        <TableRow key={service.id} className="border-border hover:bg-muted/50">
                          <TableCell>
                            <div>
                              <div className="font-medium text-foreground">{service.name}</div>
                              <div className="text-sm text-muted-foreground">{service.description}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">{category?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(service.service_type)}
                              <Badge variant="outline" className="border-border text-muted-foreground">
                                {service.service_type.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground">
                            {service.price_range_min && service.price_range_max
                              ? `$${service.price_range_min.toLocaleString()} - $${service.price_range_max.toLocaleString()}`
                              : 'Not specified'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={service.is_active ? "default" : "secondary"} className={
                              service.is_active 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                            }>
                              {service.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedService(service);
                                setIsServiceModalOpen(true);
                              }}
                              className="border-border text-foreground hover:bg-muted"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ 
  category, 
  parentCategories, 
  onSave, 
  isLoading 
}: {
  category: PropertyCategory | null;
  parentCategories: PropertyCategory[];
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '',
    parent_id: category?.parent_id || '',
    display_order: category?.display_order || 0,
    is_active: category?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(category ? { ...formData, id: category.id } : formData);
  };

  return (
    <DialogContent className="max-w-md bg-card border-border">
      <DialogHeader>
        <DialogTitle className="text-card-foreground">
          {category ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-foreground">Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="bg-background border-border text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">Slug</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            required
            className="bg-background border-border text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">Icon (Emoji)</Label>
          <Input
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🏠"
            className="bg-background border-border text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">Parent Category</Label>
          <Select 
            value={formData.parent_id} 
            onValueChange={(value) => setFormData({ ...formData, parent_id: value === 'none' ? '' : value })}
          >
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue placeholder="Select parent category (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="none" className="text-foreground hover:bg-muted">No Parent (Main Category)</SelectItem>
              {parentCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="text-foreground hover:bg-muted">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="accent-primary"
          />
          <Label className="text-foreground">Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Service Modal Component
const ServiceModal = ({ 
  service, 
  categories, 
  onSave, 
  isLoading 
}: {
  service: PropertyService | null;
  categories: PropertyCategory[];
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    slug: service?.slug || '',
    description: service?.description || '',
    category_id: service?.category_id || '',
    service_type: service?.service_type || 'buy',
    price_range_min: service?.price_range_min || '',
    price_range_max: service?.price_range_max || '',
    features: service?.features?.join('\n') || '',
    requirements: service?.requirements?.join('\n') || '',
    is_active: service?.is_active ?? true,
    display_order: service?.display_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
      ...formData,
      features: formData.features.split('\n').filter(f => f.trim()),
      requirements: formData.requirements.split('\n').filter(r => r.trim()),
      price_range_min: formData.price_range_min ? parseFloat(formData.price_range_min.toString()) : null,
      price_range_max: formData.price_range_max ? parseFloat(formData.price_range_max.toString()) : null,
    };
    onSave(service ? { ...processedData, id: service.id } : processedData);
  };

  return (
    <DialogContent className="max-w-2xl bg-card border-border">
      <DialogHeader>
        <DialogTitle className="text-card-foreground">
          {service ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground">Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Slug</Label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>
        <div>
          <Label className="text-foreground">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="bg-background border-border text-foreground"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground">Category</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-foreground hover:bg-muted">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Service Type</Label>
            <Select 
              value={formData.service_type} 
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="buy" className="text-foreground hover:bg-muted">Buy</SelectItem>
                <SelectItem value="rent" className="text-foreground hover:bg-muted">Rent</SelectItem>
                <SelectItem value="new_projects" className="text-foreground hover:bg-muted">New Projects</SelectItem>
                <SelectItem value="pre_launching" className="text-foreground hover:bg-muted">Pre-Launching</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground">Min Price</Label>
            <Input
              type="number"
              value={formData.price_range_min}
              onChange={(e) => setFormData({ ...formData, price_range_min: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
          <div>
            <Label className="text-foreground">Max Price</Label>
            <Input
              type="number"
              value={formData.price_range_max}
              onChange={(e) => setFormData({ ...formData, price_range_max: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>
        <div>
          <Label className="text-foreground">Features (one per line)</Label>
          <Textarea
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder="Property evaluation&#10;Legal documentation&#10;Financing assistance"
            className="bg-background border-border text-foreground"
          />
        </div>
        <div>
          <Label className="text-foreground">Requirements (one per line)</Label>
          <Textarea
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            placeholder="Valid ID&#10;Proof of income&#10;Credit check"
            className="bg-background border-border text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="accent-primary"
          />
          <Label className="text-foreground">Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
            {isLoading ? 'Saving...' : 'Save Service'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default PropertyCategoriesManagement;
