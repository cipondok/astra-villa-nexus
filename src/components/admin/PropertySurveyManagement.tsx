
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

  // Fetch survey bookings using the secure function
  const { data: surveys, isLoading, error } = useSurveyBookings();
  
  // Show error message if access is denied
  if (error) {
    showError("Access Denied", "You don't have permission to view survey bookings or the feature is loading.");
  }

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
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getSurveyTypeBadge = (type: string) => {
    const colors = {
      viewing: "bg-blue-500",
      inspection: "bg-purple-500",
      valuation: "bg-green-500"
    };
    return <Badge className={colors[type] || colors.viewing}>{type?.toUpperCase()}</Badge>;
  };

  const filteredSurveys = surveys?.filter(survey =>
    survey.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.property_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.property_location?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Show access level indicator
  const hasRestrictedAccess = surveys?.some(survey => !survey.has_full_access);

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      {hasRestrictedAccess && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Security Notice</span>
            </div>
            <p className="text-yellow-300 text-sm mt-1">
              Some customer information is masked for privacy protection. You only see full details for properties you own/manage.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            Property Survey Booking System
            {hasRestrictedAccess && <Shield className="h-4 w-4 text-yellow-400" />}
          </CardTitle>
          <CardDescription className="text-gray-300">
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
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">Pending</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => s.status === 'pending').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Confirmed</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => s.status === 'confirmed').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Completed</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => s.status === 'completed').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Today</span>
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {surveys?.filter(s => new Date(s.preferred_date).toDateString() === new Date().toDateString()).length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Surveys Table */}
            <div className="border border-white/20 rounded-lg bg-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Property</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Date & Time</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                        Loading surveys...
                      </TableCell>
                    </TableRow>
                  ) : filteredSurveys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                        No survey bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSurveys.map((survey) => (
                      <TableRow key={survey.id} className="border-white/20">
                         <TableCell className="text-white">
                           <div className="text-sm">
                             <div className="font-medium flex items-center gap-2">
                               <User className="h-3 w-3" />
                               {survey.customer_name}
                               {!survey.has_full_access && <Shield className="h-3 w-3 text-yellow-400" />}
                             </div>
                             <div className="text-gray-400">{survey.customer_email}</div>
                             <div className="text-gray-400">{survey.customer_phone}</div>
                           </div>
                         </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="text-sm">
                            <div className="font-medium">{survey.property_title}</div>
                            <div className="text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {survey.property_location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSurveyTypeBadge(survey.survey_type)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(survey.preferred_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
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
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
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
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Survey Booking Details</DialogTitle>
            <DialogDescription className="text-gray-300">
              Review and manage property survey appointment
            </DialogDescription>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-300 font-medium">Customer Name:</Label>
                  <p className="text-white">{selectedSurvey.customer_name}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Email:</Label>
                  <p className="text-white">{selectedSurvey.customer_email}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Phone:</Label>
                  <p className="text-white">{selectedSurvey.customer_phone}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Survey Type:</Label>
                  {getSurveyTypeBadge(selectedSurvey.survey_type)}
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Preferred Date:</Label>
                  <p className="text-white">{new Date(selectedSurvey.preferred_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-300 font-medium">Preferred Time:</Label>
                  <p className="text-white">{selectedSurvey.preferred_time}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-300 font-medium">Property:</Label>
                <p className="text-white">{selectedSurvey.property_title}</p>
                <p className="text-gray-400 text-sm">{selectedSurvey.property_location}</p>
              </div>
              <div>
                <Label className="text-gray-300 font-medium">Notes:</Label>
                <p className="text-white bg-gray-800 p-3 rounded mt-2">
                  {selectedSurvey.message || 'No additional notes provided'}
                </p>
              </div>
              {!selectedSurvey.has_full_access && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Privacy Protected</span>
                  </div>
                  <p className="text-yellow-300 text-sm mt-1">
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
              className="border-gray-600 text-gray-300"
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
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('completed')}
              disabled={updateSurveyMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
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
