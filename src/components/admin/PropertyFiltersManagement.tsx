import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Filter, Plus, Edit, Trash2, Settings, Search } from 'lucide-react';

const PropertyFiltersManagement = () => {
  const [filters, setFilters] = useState([
    { id: '1', name: 'Property Type', type: 'select', options: ['Villa', 'Apartment', 'House'], active: true },
    { id: '2', name: 'Price Range', type: 'range', min: 0, max: 10000000000, active: true },
    { id: '3', name: 'Bedrooms', type: 'number', options: ['1', '2', '3', '4+'], active: true },
    { id: '4', name: 'Location', type: 'select', options: ['Jakarta', 'Surabaya', 'Bandung'], active: true }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Property Filters Management</h2>
          <p className="text-gray-600">Configure search filters and property categorization</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Filters</CardTitle>
            <CardDescription>Manage property search filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{filter.name}</div>
                    <div className="text-sm text-gray-500">Type: {filter.type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={filter.active} />
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filter Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Filter Usage Analytics
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyFiltersManagement;
