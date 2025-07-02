
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  ExternalLink, 
  Calendar, 
  Users, 
  TrendingUp,
  Clock,
  DollarSign,
  MapPin
} from "lucide-react";

interface MainCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Subcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  main_category_id: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface VendorService {
  id: string;
  service_name: string;
  service_description: string;
  main_category_id: string;
  subcategory_id: string;
  price_range: any;
  duration_minutes: number;
  location_type: string;
  is_active: boolean;
  featured: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  subcategory: string;
  tags: string[];
  readTime: number;
  views: number;
  publishedAt: string;
  featured: boolean;
  coverImage?: string;
}

const VendorCategoryBlogView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Fetch categories for blog context
  const { data: mainCategories } = useQuery({
    queryKey: ['blog-main-categories'],
    queryFn: async (): Promise<MainCategory[]> => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: subcategories } = useQuery({
    queryKey: ['blog-subcategories'],
    queryFn: async (): Promise<Subcategory[]> => {
      const { data, error } = await supabase
        .from('vendor_subcategories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: vendorServices } = useQuery({
    queryKey: ['blog-vendor-services'],
    queryFn: async (): Promise<VendorService[]> => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Sample blog posts generated from our vendor categories
  const generateBlogPosts = (): BlogPost[] => {
    if (!mainCategories || !subcategories || !vendorServices) return [];

    const posts: BlogPost[] = [];

    // Featured category overview posts
    mainCategories.forEach((category, index) => {
      const categorySubcategories = subcategories.filter(sub => sub.main_category_id === category.id);
      const categoryServices = vendorServices.filter(service => service.main_category_id === category.id);

      posts.push({
        id: `blog-${category.id}`,
        title: `Complete Guide to ${category.name}: Everything You Need to Know`,
        excerpt: `Discover the comprehensive world of ${category.name.toLowerCase()} with our detailed guide covering all services, pricing, and expert tips.`,
        content: `${category.description} This comprehensive guide covers ${categorySubcategories.length} subcategories and ${categoryServices.length} different services available in the market.`,
        category: category.name,
        subcategory: "Overview",
        tags: [category.name.toLowerCase().replace(/\s+/g, '-'), 'guide', 'overview'],
        readTime: 8 + index,
        views: 1200 + (index * 300),
        publishedAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
        featured: index < 2,
        coverImage: `https://images.unsplash.com/photo-${1600000000000 + index * 1000}?w=800&h=400&fit=crop`
      });
    });

    // Subcategory specific posts
    subcategories.forEach((subcategory, index) => {
      const mainCategory = mainCategories.find(cat => cat.id === subcategory.main_category_id);
      const subServices = vendorServices.filter(service => service.subcategory_id === subcategory.id);

      if (mainCategory) {
        posts.push({
          id: `blog-sub-${subcategory.id}`,
          title: `${subcategory.name}: Top Services and Pricing Guide 2024`,
          excerpt: `Everything you need to know about ${subcategory.name.toLowerCase()} including top providers, pricing trends, and expert recommendations.`,
          content: `${subcategory.description} Find the best ${subcategory.name.toLowerCase()} services with ${subServices.length} verified providers in your area.`,
          category: mainCategory.name,
          subcategory: subcategory.name,
          tags: [subcategory.name.toLowerCase().replace(/\s+/g, '-'), 'pricing', 'services'],
          readTime: 5 + (index % 6),
          views: 800 + (index * 150),
          publishedAt: new Date(Date.now() - ((index + 10) * 24 * 60 * 60 * 1000)).toISOString(),
          featured: index % 8 === 0
        });
      }
    });

    // Service-specific how-to posts
    vendorServices.slice(0, 10).forEach((service, index) => {
      const subcategory = subcategories.find(sub => sub.id === service.subcategory_id);
      const mainCategory = mainCategories.find(cat => cat.id === service.main_category_id);

      if (subcategory && mainCategory) {
        posts.push({
          id: `blog-service-${service.id}`,
          title: `How to Choose the Best ${service.service_name} Service`,
          excerpt: `Professional guide to selecting the right ${service.service_name.toLowerCase()} service for your needs, including cost factors and quality indicators.`,
          content: `${service.service_description} Learn about pricing, duration, and what to expect from professional ${service.service_name.toLowerCase()} services.`,
          category: mainCategory.name,
          subcategory: subcategory.name,
          tags: [service.service_name.toLowerCase().replace(/\s+/g, '-'), 'how-to', 'tips'],
          readTime: 4 + (index % 5),
          views: 600 + (index * 100),
          publishedAt: new Date(Date.now() - ((index + 20) * 24 * 60 * 60 * 1000)).toISOString(),
          featured: service.featured
        });
      }
    });

    return posts;
  };

  const blogPosts = generateBlogPosts();

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Vendor Services Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Expert insights, guides, and tips for all your service needs - from property maintenance to subscription services
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("")}
          >
            All Categories
          </Button>
          {mainCategories?.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.name)}
              className="flex items-center gap-1"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.slice(0, 3).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-orange-200">
                <div className="h-48 bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {mainCategories?.find(cat => cat.name === post.category)?.icon || "📝"}
                    </div>
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{post.category}</Badge>
                    <Badge variant="secondary">{post.subcategory}</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read Article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Articles</h2>
          <Badge variant="secondary">{filteredPosts.length} articles</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {mainCategories?.find(cat => cat.name === post.category)?.icon || "📝"}
                    </span>
                    {post.featured && (
                      <Badge variant="destructive" className="text-xs">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  <Badge variant="secondary" className="text-xs">{post.subcategory}</Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Content Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{blogPosts.length}</div>
                <div className="text-sm text-muted-foreground">Total Articles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{mainCategories?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{featuredPosts.length}</div>
                <div className="text-sm text-muted-foreground">Featured</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {Math.round(blogPosts.reduce((acc, post) => acc + post.views, 0) / 1000)}K
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCategoryBlogView;
