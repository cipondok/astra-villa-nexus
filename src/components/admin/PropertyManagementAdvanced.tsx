
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Eye, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  Flag,
  Image,
  FileText
} from 'lucide-react';

const PropertyManagementAdvanced = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock property data
  const properties = [
    {
      id: '1',
      title: 'Modern Villa in Kemang',
      type: 'Villa',
      listingType: 'Sale',
      price: 2500000000,
      location: 'Kemang, Jakarta Selatan',
      status: 'approved',
      owner: 'John Doe',
      agent: 'Sarah Wilson',
      submittedDate: '2024-01-10',
      views: 245,
      inquiries: 12,
      images: 15,
      description: 'Beautiful modern villa with pool...',
      bedrooms: 4,
      bathrooms: 3,
      area: 250
    },
    {
      id: '2',
      title: 'Cozy Apartment in Senayan',
      type: 'Apartment',
      listingType: 'Rent',
      price: 15000000,
      location: 'Senayan, Jakarta Pusat',
      status: 'pending',
      owner: 'Jane Smith',
      agent: null,
      submittedDate: '2024-01-12',
      views: 0,
      inquiries: 0,
      images: 8,
      description: 'Modern apartment in prime location...',
      bedrooms: 2,
      bathrooms: 2,
      area: 85
    },
    {
      id: '3',
      title: 'Commercial Space in Sudirman',
      type: 'Commercial',
      listingType: 'Rent',
      price: 50000000,
      location: 'Sudirman, Jakarta Pusat',
      status: 'flagged',
      owner: 'Bob Johnson',
      agent: 'Mike Brown',
      submittedDate: '2024-01-08',
      views: 89,
      inquiries: 3,
      images: 12,
      description: 'Prime commercial space...',
      bedrooms: 0,
      bathrooms: 2,
      area: 150
    }
  ];

  const flaggedProperties = [
    {
      id: '1',
      propertyTitle: 'Suspicious Villa Listing',
      reason: 'Unusually low price',
      reportedBy: 'System AI',
      severity: 'high',
      date: '2024-01-15'
    },
    {
      id: '2', 
      propertyTitle: 'Duplicate Images Detected',
      reason: 'Images used in multiple listings',
      reportedBy: 'User Report',
      severity: 'medium',
      date: '2024-01-14'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'flagged':
        return <Badge className="bg-red-100 text-red-800">Flagged</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatPrice = (price: number, type: string) => {
    if (type === 'Rent') {
      return `Rp ${(price / 1000000).toFixed(1)}M/month`;
    }
    return `Rp ${(price / 1000000000).toFixed(1)}B`;
  };

  const handleApproveProperty = (propertyId: string) => {
    console.log('Approving property:', propertyId);
    // Implement approval logic
  };

  const handleRejectProperty = (propertyId: string) => {
    console.log('Rejecting property:', propertyId);
    // Implement rejection logic
  };

  const handleFlagProperty = (propertyId: string) => {
    console.log('Flagging property:', propertyId);
    // Implement flagging logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Property Management</h2>
          <p className="text-gray-600">Comprehensive property listing control and monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Building2 className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold">567</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">15.2K</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Value</p>
                <p className="text-2xl font-bold">1.8B</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">All Properties</TabsTrigger>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Properties</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* All Properties */}
        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Listings</CardTitle>
                  <CardDescription>Manage all property listings in the system</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Image className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{property.title}</div>
                            <div className="text-sm text-gray-500">
                              {property.bedrooms}BR • {property.bathrooms}BA • {property.area}m²
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{property.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatPrice(property.price, property.listingType)}
                          </div>
                          <div className="text-sm text-gray-500">{property.listingType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{property.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(property.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{property.views} views</div>
                          <div className="text-gray-500">{property.inquiries} inquiries</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          {property.status === 'pending' ? (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveProperty(property.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleRejectProperty(property.id)}
                              >
                                <XCircle className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleFlagProperty(property.id)}
                            >
                              <Flag className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Review */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Properties Pending Review</CardTitle>
              <CardDescription>Properties awaiting approval or rejection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.filter(p => p.status === 'pending').map((property) => (
                  <div key={property.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-gray-500">{property.location}</div>
                          <div className="text-sm text-gray-500">
                            Submitted: {property.submittedDate} by {property.owner}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{property.images} images</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Properties */}
        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Properties</CardTitle>
              <CardDescription>Properties requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedProperties.map((flag) => (
                  <div key={flag.id} className="p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <div className="font-medium">{flag.propertyTitle}</div>
                          <div className="text-sm text-gray-600">{flag.reason}</div>
                          <div className="text-xs text-gray-500">
                            Reported by: {flag.reportedBy} • {flag.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getSeverityBadge(flag.severity)}
                        <Button size="sm">Investigate</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Performance Chart Placeholder
                  <br />
                  (Views, Inquiries, Conversion Rate)
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Market Trends Chart Placeholder
                  <br />
                  (Price Trends, Popular Areas)
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {properties.slice(0, 5).map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.views} views</div>
                      </div>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Location Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Location Analytics Placeholder
                  <br />
                  (Popular areas, Price by location)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyManagementAdvanced;
