import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { usePropertyFilters, FilterOption } from '@/hooks/usePropertyFilters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const CentralizedFilterManager = () => {
  const { filters, loading, addFilter, updateFilter, deleteFilter } = usePropertyFilters();
  const [editingFilter, setEditingFilter] = useState<FilterOption | null>(null);
  const [newFilter, setNewFilter] = useState({
    filter_name: '',
    filter_category: '',
    filter_type: 'select',
    filter_options: [] as string[],
    listing_type: 'sale' as 'sale' | 'rent',
    is_active: true,
    display_order: 0,
  });
  const [isAddingFilter, setIsAddingFilter] = useState(false);

  const categories = [
    'search',
    'location', 
    'price',
    'specifications',
    'investment',
    'rental_terms',
    'facilities'
  ];

  const filterTypes = [
    { value: 'select', label: 'Dropdown Select' },
    { value: 'range', label: 'Range Slider' },
    { value: 'checkbox', label: 'Multiple Choice' },
    { value: 'radio', label: 'Single Choice' },
    { value: 'slider', label: 'Number Slider' }
  ];

  const handleAddFilter = async () => {
    if (!newFilter.filter_name || !newFilter.filter_category) return;
    
    try {
      await addFilter(newFilter);
      setNewFilter({
        filter_name: '',
        filter_category: '',
        filter_type: 'select',
        filter_options: [],
        listing_type: 'sale',
        is_active: true,
        display_order: 0,
      });
      setIsAddingFilter(false);
    } catch (error) {
      console.error('Failed to add filter:', error);
    }
  };

  const handleUpdateFilter = async () => {
    if (!editingFilter) return;
    
    try {
      await updateFilter(editingFilter.id, editingFilter);
      setEditingFilter(null);
    } catch (error) {
      console.error('Failed to update filter:', error);
    }
  };

  const handleDeleteFilter = async (id: string) => {
    if (confirm('Are you sure you want to delete this filter?')) {
      try {
        await deleteFilter(id);
      } catch (error) {
        console.error('Failed to delete filter:', error);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading filters...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Centralized Filter Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage all property search filters in one place. Changes will automatically update across all search panels.
              </p>
            </div>
            <Dialog open={isAddingFilter} onOpenChange={setIsAddingFilter}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Filter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Filter</DialogTitle>
                  <DialogDescription>
                    Create a new filter option that will be available across all search panels.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Select 
                      value={newFilter.filter_category} 
                      onValueChange={(value) => setNewFilter({...newFilter, filter_category: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ').toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newFilter.filter_name}
                      onChange={(e) => setNewFilter({...newFilter, filter_name: e.target.value})}
                      className="col-span-3"
                      placeholder="Filter name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <Select 
                      value={newFilter.filter_type} 
                      onValueChange={(value) => setNewFilter({...newFilter, filter_type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="listing" className="text-right">
                      Listing Type
                    </Label>
                    <Select 
                      value={newFilter.listing_type} 
                      onValueChange={(value: 'sale' | 'rent') => setNewFilter({...newFilter, listing_type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingFilter(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFilter}>
                    Add Filter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filters.map((category) => (
              <Card key={category.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize">
                    {category.name.replace('_', ' ')} 
                    <Badge variant="secondary" className="ml-2">
                      {category.options.length} options
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {category.options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between p-3 border rounded-lg">
                        {editingFilter?.id === option.id ? (
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <Input
                              value={editingFilter.filter_name}
                              onChange={(e) => setEditingFilter({...editingFilter, filter_name: e.target.value})}
                              placeholder="Filter Name"
                            />
                            <Select
                              value={editingFilter.filter_type}
                              onValueChange={(value) => setEditingFilter({...editingFilter, filter_type: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {filterTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={editingFilter.is_active}
                                onCheckedChange={(checked) => setEditingFilter({...editingFilter, is_active: checked})}
                              />
                              <Button size="sm" onClick={handleUpdateFilter}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingFilter(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <div className="font-medium">{option.filter_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Type: {option.filter_type} | Listing: {option.listing_type}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={option.is_active ? "default" : "secondary"}>
                                {option.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <Button size="sm" variant="outline" onClick={() => setEditingFilter(option)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteFilter(option.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CentralizedFilterManager;