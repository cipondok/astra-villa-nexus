import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FilterOption } from '@/hooks/usePropertyFilters';
import { Textarea } from '@/components/ui/textarea';

interface FilterDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<FilterOption, 'id'>) => void;
  filter?: FilterOption | null;
}

export const FilterDialog = ({ open, onClose, filter, onSave }: FilterDialogProps) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<Omit<FilterOption, 'id'>>({
    defaultValues: {
      filter_name: '',
      filter_category: 'facilities',
      filter_type: 'checkbox',
      listing_type: 'rent',
      is_active: true,
      display_order: 0,
      filter_options: [],
    },
  });

  const filterType = watch('filter_type');
  const filterCategory = watch('filter_category');

  useEffect(() => {
    if (filter) {
      reset({
        filter_name: filter.filter_name,
        filter_category: filter.filter_category,
        filter_type: filter.filter_type,
        listing_type: filter.listing_type,
        is_active: filter.is_active,
        display_order: filter.display_order || 0,
        filter_options: filter.filter_options || [],
      });
    } else {
      reset({
        filter_name: '',
        filter_category: 'facilities',
        filter_type: 'checkbox',
        listing_type: 'rent',
        is_active: true,
        display_order: 0,
        filter_options: [],
      });
    }
  }, [filter, reset]);

  const onSubmit = (data: Omit<FilterOption, 'id'>) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{filter ? 'Edit Filter' : 'Add New Filter'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter_name">Filter Name</Label>
              <Input
                id="filter_name"
                {...register('filter_name', { required: true })}
                placeholder="e.g., Free WiFi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter_category">Category</Label>
              <Select
                value={filterCategory}
                onValueChange={(value) => setValue('filter_category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facilities">Facilities</SelectItem>
                  <SelectItem value="search">Search Filters</SelectItem>
                  <SelectItem value="specifications">Specifications</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter_type">Filter Type</Label>
              <Select
                value={filterType}
                onValueChange={(value) => setValue('filter_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="input">Input</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="listing_type">Listing Type</Label>
              <Select
                value={watch('listing_type')}
                onValueChange={(value: 'sale' | 'rent') => setValue('listing_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 flex items-center gap-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          {(filterType === 'select' || filterType === 'checkbox') && (
            <div className="space-y-2">
              <Label htmlFor="filter_options">Options (comma-separated)</Label>
              <Textarea
                id="filter_options"
                placeholder="Option 1, Option 2, Option 3"
                onChange={(e) => {
                  const options = e.target.value.split(',').map(opt => opt.trim()).filter(Boolean);
                  setValue('filter_options', options);
                }}
                defaultValue={filter?.filter_options?.join(', ') || ''}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {filter ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
