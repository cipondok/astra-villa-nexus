import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2, Eye, Edit, Plus, MapPin, ArrowLeft, Trash2,
  Search, SlidersHorizontal, TrendingUp, Heart, MessageSquare,
  BarChart3, Sparkles, MoreVertical, Archive, CheckCircle,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OpportunityScoreRing from "@/components/property/OpportunityScoreRing";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua', icon: Building2 },
  { value: 'active', label: 'Aktif', icon: CheckCircle },
  { value: 'draft', label: 'Draft', icon: Edit },
  { value: 'reserved', label: 'Reserved', icon: Archive },
  { value: 'sold', label: 'Terjual', icon: TrendingUp },
  { value: 'inactive', label: 'Nonaktif', icon: Archive },
];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'active': return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
    case 'draft': return 'bg-muted text-muted-foreground border-border/40';
    case 'reserved': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    case 'sold': return 'bg-primary/10 text-primary border-primary/20';
    case 'inactive': return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'pending_approval': return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
    default: return 'bg-muted text-muted-foreground border-border/40';
  }
};

const MyProperties = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/?auth=true');
  }, [isAuthenticated, navigate]);

  // Fetch properties
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['my-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, property_type, listing_type, status, approval_status, city, state, location, images, image_urls, created_at, bedrooms, bathrooms, area_sqm, opportunity_score, demand_heat_score')
        .or(`agent_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch performance stats (favorites count per property)
  const propertyIds = properties.map(p => p.id);
  const { data: favCounts = {} } = useQuery({
    queryKey: ['my-properties-fav-counts', propertyIds],
    queryFn: async () => {
      if (propertyIds.length === 0) return {};
      const { data } = await supabase
        .from('favorites')
        .select('property_id')
        .in('property_id', propertyIds);
      const counts: Record<string, number> = {};
      (data || []).forEach(f => {
        counts[f.property_id] = (counts[f.property_id] || 0) + 1;
      });
      return counts;
    },
    enabled: propertyIds.length > 0,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Properti berhasil dihapus');
      setDeleteId(null);
    },
    onError: () => toast.error('Gagal menghapus properti'),
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('properties')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      toast.success('Status diperbarui');
    },
    onError: () => toast.error('Gagal memperbarui status'),
  });

  // Filtered properties
  const filtered = properties.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.title?.toLowerCase().includes(q) && !p.location?.toLowerCase().includes(q) && !p.city?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Stats
  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    draft: properties.filter(p => p.status === 'draft' || p.status === 'pending_approval').length,
    sold: properties.filter(p => p.status === 'sold').length,
  };

  const getImageUrl = (p: any) => p.image_urls?.[0] || p.images?.[0] || '/placeholder.svg';

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate('/dashboard/property-owner')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Properti Saya</h1>
              <p className="text-xs text-muted-foreground">{stats.total} listing</p>
            </div>
          </div>
          <Button size="sm" className="h-9 rounded-xl px-4 text-sm" onClick={() => navigate('/add-property')}>
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' },
            { label: 'Aktif', value: stats.active, color: 'text-chart-2', bg: 'bg-chart-2/10' },
            { label: 'Draft', value: stats.draft, color: 'text-chart-4', bg: 'bg-chart-4/10' },
            { label: 'Terjual', value: stats.sold, color: 'text-primary', bg: 'bg-primary/10' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl ${s.bg} p-3 text-center`}>
              <p className={`text-lg sm:text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari properti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl border-border/50 bg-card"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-10 rounded-xl border-border/50 bg-card text-sm">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Properties List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/30 bg-card p-3 flex gap-3">
                <div className="h-20 w-20 rounded-xl bg-muted/40 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/40 rounded-lg w-2/3" />
                  <div className="h-3 bg-muted/40 rounded-lg w-1/2" />
                  <div className="h-3 bg-muted/40 rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="h-20 w-20 rounded-3xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold mb-1">
              {properties.length === 0 ? 'Belum ada properti' : 'Tidak ada hasil'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {properties.length === 0 ? 'Mulai dengan menambahkan properti pertama Anda' : 'Coba ubah filter atau kata kunci pencarian'}
            </p>
            {properties.length === 0 && (
              <Button onClick={() => navigate('/add-property')} className="rounded-xl h-10 px-5">
                <Plus className="h-4 w-4 mr-1.5" />
                Tambah Properti
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            <AnimatePresence>
              {filtered.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.03, duration: 0.25 }}
                >
                  <Card
                    className="rounded-2xl border-border/30 bg-card overflow-hidden cursor-pointer card-hover-lift"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <CardContent className="p-3 flex gap-3">
                      {/* Thumbnail */}
                      <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
                        <img
                          src={getImageUrl(property)}
                          alt={property.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute top-1 right-1">
                          <OpportunityScoreRing score={property.opportunity_score} size={28} />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <h3 className="text-sm font-semibold text-foreground line-clamp-1 leading-tight">
                              {property.title || 'Untitled'}
                            </h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property.id}`); }}>
                                  <Eye className="h-3.5 w-3.5 mr-2" /> Lihat
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/property/${property.id}/edit`); }}>
                                  <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {property.status !== 'active' && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: property.id, status: 'active' }); }}>
                                    <CheckCircle className="h-3.5 w-3.5 mr-2" /> Aktifkan
                                  </DropdownMenuItem>
                                )}
                                {property.status !== 'draft' && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: property.id, status: 'draft' }); }}>
                                    <Edit className="h-3.5 w-3.5 mr-2" /> Jadikan Draft
                                  </DropdownMenuItem>
                                )}
                                {property.status !== 'reserved' && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: property.id, status: 'reserved' }); }}>
                                    <Archive className="h-3.5 w-3.5 mr-2" /> Reserved
                                  </DropdownMenuItem>
                                )}
                                {property.status !== 'sold' && (
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: property.id, status: 'sold' }); }}>
                                    <TrendingUp className="h-3.5 w-3.5 mr-2" /> Tandai Terjual
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => { e.stopPropagation(); setDeleteId(property.id); }}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-1 text-muted-foreground mb-1.5">
                            <MapPin className="h-3 w-3 flex-shrink-0 text-primary/60" />
                            <span className="text-[11px] line-clamp-1">{property.location || property.city || 'No location'}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">
                              {property.price ? formatCurrency(property.price) : 'TBD'}
                            </span>
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border ${getStatusStyle(property.status)}`}>
                              {property.status === 'pending_approval' ? 'Pending' : property.status}
                            </Badge>
                          </div>

                          {/* Mini performance stats */}
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Heart className="h-3 w-3" />
                              {favCounts[property.id] || 0}
                            </span>
                            {property.bedrooms > 0 && (
                              <span>{property.bedrooms} KT</span>
                            )}
                            {property.area_sqm > 0 && (
                              <span>{property.area_sqm}m²</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Properti?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Properti akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyProperties;
