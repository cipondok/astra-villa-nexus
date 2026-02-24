import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  BookmarkCheck,
  Bell,
  BellOff,
  Trash2,
  Search,
  MapPin,
  Home,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { useSavedSearches, SavedSearch } from '@/hooks/useSavedSearches';
import { formatDistanceToNow } from 'date-fns';

interface SavedSearchesPanelProps {
  onApplySearch: (filters: Record<string, any>, query?: string) => void;
}

const SavedSearchesPanel = ({ onApplySearch }: SavedSearchesPanelProps) => {
  const {
    savedSearches,
    isLoading,
    unreadNotifications,
    updateSearch,
    deleteSearch,
  } = useSavedSearches();

  const [open, setOpen] = useState(false);

  const handleApply = (search: SavedSearch) => {
    onApplySearch(search.filters, search.query || undefined);
    setOpen(false);
  };

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}B`;
    if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}M`;
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const renderFilterSummary = (filters: Record<string, any>) => {
    const badges: string[] = [];
    if (filters.location && filters.location !== 'all') badges.push(filters.location);
    if (filters.propertyType && filters.propertyType !== 'all') badges.push(filters.propertyType);
    if (filters.listingType && filters.listingType !== 'all') badges.push(filters.listingType === 'rent' ? 'For Rent' : 'For Sale');
    if (filters.city && filters.city !== 'all') badges.push(filters.city);
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? formatPrice(filters.minPrice) : '0';
      const max = filters.maxPrice ? formatPrice(filters.maxPrice) : '∞';
      badges.push(`${min} - ${max}`);
    }
    if (filters.bedrooms && filters.bedrooms !== 'all') badges.push(`${filters.bedrooms}BR`);
    return badges;
  };

  if (savedSearches.length === 0 && !isLoading) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <BookmarkCheck className="h-4 w-4" />
          Saved ({savedSearches.length})
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5" />
            Saved Searches
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadNotifications} new matches
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-3 pr-2">
            {savedSearches.map((search) => {
              const badges = renderFilterSummary(search.filters);
              return (
                <Card key={search.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleApply(search)}
                        className="flex-1 text-left hover:opacity-80 transition-opacity"
                      >
                        <h4 className="font-semibold text-sm">{search.name}</h4>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {badges.map((badge, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                          {search.query && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Search className="h-2.5 w-2.5" />
                              {search.query}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          Saved {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                        </p>
                      </button>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {/* Email toggle */}
                        <div className="flex items-center gap-1.5">
                          {search.email_notifications ? (
                            <Bell className="h-3.5 w-3.5 text-primary" />
                          ) : (
                            <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <Switch
                            checked={search.email_notifications}
                            onCheckedChange={(checked) =>
                              updateSearch(search.id, { email_notifications: checked })
                            }
                            className="scale-75"
                          />
                        </div>

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete saved search?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove &quot;{search.name}&quot; and stop any associated email notifications.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteSearch(search.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SavedSearchesPanel;
