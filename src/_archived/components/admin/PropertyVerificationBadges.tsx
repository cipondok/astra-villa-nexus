import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Shield, ShieldCheck, Building2, Landmark, CreditCard, Crown, Leaf,
  Plus, Trash2, Search, Loader2, AlertTriangle
} from "lucide-react";

const BADGE_TYPES = [
  { value: "ownership_verified", label: "Ownership Verified", icon: ShieldCheck, color: "text-chart-1" },
  { value: "developer_certified", label: "Developer Certified", icon: Building2, color: "text-chart-2" },
  { value: "government_approved", label: "Government Approved", icon: Landmark, color: "text-chart-3" },
  { value: "bank_partner", label: "Bank Partner", icon: CreditCard, color: "text-chart-4" },
  { value: "premium_listing", label: "Premium Listing", icon: Crown, color: "text-chart-5" },
  { value: "eco_certified", label: "Eco Certified", icon: Leaf, color: "text-green-600" },
] as const;

type BadgeType = typeof BADGE_TYPES[number]["value"];

interface VerificationBadge {
  id: string;
  property_id: string;
  badge_type: BadgeType;
  verified_by: string | null;
  verified_at: string;
  expires_at: string | null;
  notes: string | null;
  is_active: boolean;
}

interface PropertyResult {
  id: string;
  title: string;
  city: string | null;
  property_type: string;
}

const PropertyVerificationBadges = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<PropertyResult | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBadgeType, setNewBadgeType] = useState<BadgeType>("ownership_verified");
  const [newBadgeNotes, setNewBadgeNotes] = useState("");

  // Search properties
  const { data: properties = [], isFetching: isSearching } = useQuery({
    queryKey: ["admin-property-search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, city, property_type")
        .or(`title.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .limit(10);
      if (error) throw error;
      return (data || []) as PropertyResult[];
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30_000,
  });

  // Fetch badges for selected property
  const { data: badges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ["property-badges", selectedProperty?.id],
    queryFn: async () => {
      if (!selectedProperty) return [];
      const { data, error } = await supabase
        .from("property_verification_badges")
        .select("*")
        .eq("property_id", selectedProperty.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as VerificationBadge[];
    },
    enabled: !!selectedProperty,
  });

  // Add badge mutation
  const addBadge = useMutation({
    mutationFn: async () => {
      if (!selectedProperty || !user) throw new Error("No property selected");
      const { error } = await supabase
        .from("property_verification_badges")
        .insert({
          property_id: selectedProperty.id,
          badge_type: newBadgeType,
          verified_by: user.id,
          notes: newBadgeNotes || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-badges", selectedProperty?.id] });
      toast.success("Badge added successfully");
      setAddDialogOpen(false);
      setNewBadgeNotes("");
    },
    onError: (err: any) => {
      if (err.message?.includes("duplicate")) {
        toast.error("This badge already exists for this property");
      } else {
        toast.error("Failed to add badge");
      }
    },
  });

  // Toggle badge active status
  const toggleBadge = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("property_verification_badges")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-badges", selectedProperty?.id] });
      toast.success("Badge updated");
    },
  });

  // Delete badge
  const deleteBadge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("property_verification_badges")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-badges", selectedProperty?.id] });
      toast.success("Badge removed");
    },
  });

  const getBadgeConfig = (type: string) =>
    BADGE_TYPES.find((b) => b.value === type) || BADGE_TYPES[0];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Property Verification Badges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Property search */}
          <div className="space-y-2">
            <Label>Search Property</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Search results dropdown */}
            {properties.length > 0 && !selectedProperty && (
              <div className="border rounded-md bg-popover shadow-md max-h-48 overflow-y-auto">
                {properties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProperty(p);
                      setSearchQuery(p.title);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm"
                  >
                    <span className="font-medium">{p.title}</span>
                    <span className="text-muted-foreground ml-2">
                      {p.city} · {p.property_type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected property info */}
          {selectedProperty && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-semibold text-sm">{selectedProperty.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedProperty.city} · {selectedProperty.property_type}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add Badge
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSelectedProperty(null);
                    setSearchQuery("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Badges table */}
          {selectedProperty && (
            <div>
              {badgesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : badges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No verification badges yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Badge</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Verified At</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badges.map((badge) => {
                      const config = getBadgeConfig(badge.badge_type);
                      const Icon = config.icon;
                      return (
                        <TableRow key={badge.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${config.color}`} />
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {badge.notes || "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(badge.verified_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={badge.is_active}
                              onCheckedChange={(checked) =>
                                toggleBadge.mutate({ id: badge.id, is_active: checked })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteBadge.mutate(badge.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Badge Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Verification Badge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge Type</Label>
              <Select value={newBadgeType} onValueChange={(v) => setNewBadgeType(v as BadgeType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGE_TYPES.map((bt) => {
                    const Icon = bt.icon;
                    return (
                      <SelectItem key={bt.value} value={bt.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${bt.color}`} />
                          {bt.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={newBadgeNotes}
                onChange={(e) => setNewBadgeNotes(e.target.value)}
                placeholder="e.g., Verified via notarized documents..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => addBadge.mutate()} disabled={addBadge.isPending}>
              {addBadge.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyVerificationBadges;
