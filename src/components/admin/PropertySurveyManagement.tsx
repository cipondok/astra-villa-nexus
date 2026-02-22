
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin, Clock, User, Eye, CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useSurveyBookings, useSurveyBookingStats } from "@/hooks/useSurveyBookings";

const PropertySurveyManagement = () => {
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: surveys, isLoading, error } = useSurveyBookings();

  const updateSurveyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('property_survey_bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Survey Updated", "Survey status has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['survey-bookings'] });
      setShowDetailDialog(false);
      setSelectedSurvey(null);
    },
    onError: (error: any) => {
      showError("Update Failed", error.message || "Failed to update survey status.");
    },
  });

  const handleViewDetails = (survey: any) => {
    setSelectedSurvey(survey);
    setShowDetailDialog(true);
  };

  const handleStatusUpdate = (status: string) => {
    if (selectedSurvey) {
      updateSurveyMutation.mutate({ id: selectedSurvey.id, status });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-chart-3/50 text-chart-3"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getSurveyTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      viewing: "bg-chart-2/20 text-chart-2",
      inspection: "bg-primary/20 text-primary",
      valuation: "bg-chart-1/20 text-chart-1"
    };
    return <Badge className={colors[type] || colors.viewing}>{type?.toUpperCase()}</Badge>;
  };

  const filteredSurveys = surveys?.filter(survey =>
    survey.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.property_location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const hasRestrictedAccess = surveys?.some(survey => !survey.has_full_access);

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      {hasRestrictedAccess && (
        <Card className="bg-chart-3/10 border-chart-3/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-chart-3">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Security Notice</span>
            </div>
            <p className="text-chart-3/80 text-sm mt-1">
              Some customer information is masked for privacy protection. You only see full details for properties you own/manage.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5" />
            Property Survey Booking System
            {hasRestrictedAccess && <Shield className="h-4 w-4 text-chart-3" />}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage property viewing and survey appointments with privacy protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <Input
                placeholder="Search by customer name, email, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-chart-3" />
                    <span className="text-sm text-muted-foreground">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {surveys?.filter(s => s.status === 'pending').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-1" />
                    <span className="text-sm text-muted-foreground">Confirmed</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {surveys?.filter(s => s.status === 'confirmed').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-chart-2" />
                    <span className="text-sm text-muted-foreground">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {surveys?.filter(s => s.status === 'completed').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Today</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {surveys?.filter(s => new Date(s.preferred_date).toDateString() === new Date().toDateString()).length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Surveys Table */}
            <div className="border border-border rounded-lg bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-muted-foreground">Property</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Date & Time</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading surveys...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-destructive">
                        Error loading bookings: {error?.message || "Please check database functions"}
                      </TableCell>
                    </TableRow>
                  ) : filteredSurveys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No survey bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSurveys.map((survey) => (
                      <TableRow key={survey.id} className="border-border">
                        <TableCell className="text-foreground">
                          <div className="text-sm">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {survey.customer_name}
                              {!survey.has_full_access && <Shield className="h-3 w-3 text-chart-3" />}
                            </div>
                            <div className="text-muted-foreground">{survey.customer_email}</div>
                            <div className="text-muted-foreground">{survey.customer_phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="text-sm">
                            <div className="font-medium text-foreground">{survey.property_title}</div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {survey.property_location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSurveyTypeBadge(survey.survey_type)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(survey.preferred_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {survey.preferred_time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(survey.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(survey)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Survey Booking Details</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review and manage property survey appointment
            </DialogDescription>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground font-medium">Customer Name:</Label>
                  <p className="text-foreground">{selectedSurvey.customer_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-medium">Email:</Label>
                  <p className="text-foreground">{selectedSurvey.customer_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-medium">Phone:</Label>
                  <p className="text-foreground">{selectedSurvey.customer_phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-medium">Survey Type:</Label>
                  {getSurveyTypeBadge(selectedSurvey.survey_type)}
                </div>
                <div>
                  <Label className="text-muted-foreground font-medium">Preferred Date:</Label>
                  <p className="text-foreground">{new Date(selectedSurvey.preferred_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground font-medium">Preferred Time:</Label>
                  <p className="text-foreground">{selectedSurvey.preferred_time}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground font-medium">Property:</Label>
                <p className="text-foreground">{selectedSurvey.property_title}</p>
                <p className="text-muted-foreground text-sm">{selectedSurvey.property_location}</p>
              </div>
              <div>
                <Label className="text-muted-foreground font-medium">Notes:</Label>
                <p className="text-foreground bg-muted p-3 rounded mt-2">
                  {selectedSurvey.message || 'No additional notes provided'}
                </p>
              </div>
              {!selectedSurvey.has_full_access && (
                <div className="bg-chart-3/10 border border-chart-3/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-chart-3">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Privacy Protected</span>
                  </div>
                  <p className="text-chart-3/80 text-sm mt-1">
                    Some customer information is masked for privacy protection.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={updateSurveyMutation.isPending}
            >
              Cancel Survey
            </Button>
            <Button
              onClick={() => handleStatusUpdate('confirmed')}
              disabled={updateSurveyMutation.isPending}
              className="bg-chart-1 hover:bg-chart-1/90 text-primary-foreground"
            >
              Confirm
            </Button>
            <Button
              onClick={() => handleStatusUpdate('completed')}
              disabled={updateSurveyMutation.isPending}
              className="bg-chart-2 hover:bg-chart-2/90 text-primary-foreground"
            >
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertySurveyManagement;
