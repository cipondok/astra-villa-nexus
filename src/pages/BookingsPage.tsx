import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { usePropertyBooking, PropertyBooking } from '@/hooks/usePropertyBooking';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Eye, 
  Key, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', icon: AlertCircle },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-500/30', icon: XCircle },
  no_show: { label: 'No Show', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30', icon: XCircle },
};

const typeIcons = {
  viewing: Eye,
  rental: Key,
  purchase_inquiry: HelpCircle,
};

function BookingCard({ 
  booking, 
  isOwner = false,
  onConfirm,
  onCancel,
  onComplete,
}: { 
  booking: PropertyBooking; 
  isOwner?: boolean;
  onConfirm?: () => void;
  onCancel?: (reason: string) => void;
  onComplete?: () => void;
}) {
  const navigate = useNavigate();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const status = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const TypeIcon = typeIcons[booking.booking_type] || Eye;

  const handleCancel = () => {
    onCancel?.(cancelReason);
    setCancelDialogOpen(false);
    setCancelReason('');
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Property Image */}
        <div 
          className="w-full sm:w-48 h-32 sm:h-auto cursor-pointer"
          onClick={() => navigate(`/properties/${booking.property_id}`)}
        >
          <img
            src={booking.properties?.images?.[0] || '/placeholder.svg'}
            alt={booking.properties?.title || 'Property'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Booking Details */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 
                className="font-semibold text-base line-clamp-1 cursor-pointer hover:text-primary"
                onClick={() => navigate(`/properties/${booking.property_id}`)}
              >
                {booking.properties?.title || 'Property'}
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {booking.properties?.location || booking.properties?.city || 'Location'}
              </div>
            </div>
            <Badge variant="outline" className={cn("text-xs", status.color)}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <TypeIcon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="capitalize">{booking.booking_type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Calendar className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>{format(new Date(booking.scheduled_date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <span>{booking.scheduled_time}</span>
            </div>
            {isOwner && booking.requester && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={booking.requester.avatar_url || ''} />
                  <AvatarFallback>{booking.requester.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-xs truncate">{booking.requester.full_name}</span>
              </div>
            )}
          </div>

          {booking.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              Note: {booking.notes}
            </p>
          )}

          {/* Actions */}
          {booking.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              {isOwner && (
                <Button size="sm" onClick={onConfirm} className="h-8 text-xs">
                  Confirm
                </Button>
              )}
              <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs text-destructive">
                    Cancel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Booking</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Reason for cancellation</Label>
                      <Textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Please provide a reason..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCancelDialogOpen(false)} className="flex-1">
                      Keep Booking
                    </Button>
                    <Button variant="destructive" onClick={handleCancel} className="flex-1">
                      Cancel Booking
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {booking.status === 'confirmed' && isOwner && (
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={onComplete} className="h-8 text-xs">
                Mark as Completed
              </Button>
            </div>
          )}

          {booking.cancellation_reason && (
            <p className="text-xs text-destructive mt-2">
              Cancelled: {booking.cancellation_reason}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    myBookings, 
    receivedBookings, 
    isLoading, 
    updateBooking,
    isUpdating 
  } = usePropertyBooking();

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to view your bookings.</p>
            <Button onClick={() => navigate('/auth')}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingBookings = myBookings.filter(b => 
    ['pending', 'confirmed'].includes(b.status) && 
    new Date(b.scheduled_date) >= new Date()
  );
  const pastBookings = myBookings.filter(b => 
    ['completed', 'cancelled', 'no_show'].includes(b.status) ||
    new Date(b.scheduled_date) < new Date()
  );

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">My Bookings</h1>
          <p className="text-sm text-muted-foreground">Manage your property viewings and inquiries</p>
        </div>
      </div>

      <Tabs defaultValue="my-bookings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-bookings" className="gap-2">
            <Calendar className="h-4 w-4" />
            My Bookings
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">{upcomingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="received" className="gap-2">
            <User className="h-4 w-4" />
            Received
            {receivedBookings.filter(b => b.status === 'pending').length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {receivedBookings.filter(b => b.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-bookings" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="flex">
                    <div className="w-48 h-32 bg-muted" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-5 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : myBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-1">No Bookings Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start exploring properties and schedule your first viewing!
                </p>
                <Button onClick={() => navigate('/properties')}>
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {upcomingBookings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Upcoming</h3>
                  {upcomingBookings.map(booking => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={(reason) => updateBooking({ 
                        bookingId: booking.id, 
                        status: 'cancelled',
                        cancellationReason: reason
                      })}
                    />
                  ))}
                </div>
              )}

              {pastBookings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Past</h3>
                  {pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="flex">
                    <div className="w-48 h-32 bg-muted" />
                    <div className="flex-1 p-4 space-y-3">
                      <div className="h-5 bg-muted rounded w-1/2" />
                      <div className="h-4 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : receivedBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-1">No Booking Requests</h3>
                <p className="text-sm text-muted-foreground">
                  When someone requests to view your properties, they'll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {receivedBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isOwner
                  onConfirm={() => updateBooking({ bookingId: booking.id, status: 'confirmed' })}
                  onCancel={(reason) => updateBooking({ 
                    bookingId: booking.id, 
                    status: 'cancelled',
                    cancellationReason: reason 
                  })}
                  onComplete={() => updateBooking({ bookingId: booking.id, status: 'completed' })}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
