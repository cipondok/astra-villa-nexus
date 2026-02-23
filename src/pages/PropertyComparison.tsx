import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePropertyComparison } from '@/contexts/PropertyComparisonContext';
import { ArrowLeft, X, Eye, Trash2, Check, Minus } from 'lucide-react';
import { formatIDR } from '@/utils/formatters';

const PropertyComparison = () => {
  const navigate = useNavigate();
  const comparison = usePropertyComparison();

  if (!comparison || comparison.selectedProperties.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold mb-4">No Properties to Compare</h1>
            <p className="text-muted-foreground mb-8">
              Add properties to your comparison list to see detailed side-by-side analysis
            </p>
            <Button onClick={() => navigate('/dijual')}>Browse Properties</Button>
          </div>
        </div>
      </div>
    );
  }

  const { selectedProperties, removeFromComparison, clearComparison } = comparison;

  const getImageUrl = (property: any) => {
    if (property.images?.length) return property.images[0];
    if (property.image_urls?.length) return property.image_urls[0];
    return '/placeholder.svg';
  };

  const prices = selectedProperties.map(p => p.price);
  const areas = selectedProperties.map(p => p.area_sqm || 0).filter(a => a > 0);
  const minPrice = Math.min(...prices);
  const maxArea = areas.length ? Math.max(...areas) : 0;

  const pricePerSqm = (p: typeof selectedProperties[0]) =>
    p.area_sqm && p.area_sqm > 0 ? p.price / p.area_sqm : null;

  const allPricePerSqm = selectedProperties
    .map(pricePerSqm)
    .filter((v): v is number => v !== null);
  const minPricePerSqm = allPricePerSqm.length ? Math.min(...allPricePerSqm) : null;

  const has3DTour = (p: typeof selectedProperties[0]) =>
    !!(p.three_d_model_url || p.virtual_tour_url);

  type SpecRow = {
    label: string;
    render: (p: typeof selectedProperties[0]) => React.ReactNode;
  };

  const specs: SpecRow[] = [
    {
      label: 'Price',
      render: (p) => {
        const isLowest = p.price === minPrice && prices.length > 1;
        return (
          <div className="space-y-1">
            <span className={`font-bold ${isLowest ? 'text-primary' : ''}`}>
              {formatIDR(p.price)}
            </span>
            {p.listing_type === 'rent' && <span className="text-xs text-muted-foreground">/month</span>}
            {isLowest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Lowest</Badge>}
          </div>
        );
      },
    },
    {
      label: 'Location',
      render: (p) => <span>{p.city || p.state || p.location}</span>,
    },
    {
      label: 'Property Type',
      render: (p) => <span className="capitalize">{p.property_type || '—'}</span>,
    },
    {
      label: 'Listing Type',
      render: (p) => (
        <Badge variant={p.listing_type === 'sale' ? 'default' : 'secondary'}>
          {p.listing_type === 'sale' ? 'For Sale' : p.listing_type === 'rent' ? 'For Rent' : 'Lease'}
        </Badge>
      ),
    },
    {
      label: 'Bedrooms',
      render: (p) => <span>{p.bedrooms ?? '—'}</span>,
    },
    {
      label: 'Bathrooms',
      render: (p) => <span>{p.bathrooms ?? '—'}</span>,
    },
    {
      label: 'Area',
      render: (p) => {
        if (!p.area_sqm) return <span>—</span>;
        const isLargest = p.area_sqm === maxArea && areas.length > 1;
        return (
          <div className="space-y-1">
            <span className={isLargest ? 'font-bold text-primary' : ''}>{p.area_sqm} m²</span>
            {isLargest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Largest</Badge>}
          </div>
        );
      },
    },
    {
      label: 'Price / m²',
      render: (p) => {
        const v = pricePerSqm(p);
        if (v === null) return <span>—</span>;
        const isBest = v === minPricePerSqm && allPricePerSqm.length > 1;
        return (
          <div className="space-y-1">
            <span className={isBest ? 'font-bold text-primary' : ''}>{formatIDR(Math.round(v))}</span>
            {isBest && <Badge variant="outline" className="ml-1 text-xs text-primary border-primary">Best</Badge>}
          </div>
        );
      },
    },
    {
      label: '3D Tour',
      render: (p) =>
        has3DTour(p) ? (
          <Badge className="bg-primary/10 text-primary border-primary/20">Available</Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  // Common amenities to compare
  const amenityKeys = [
    { key: 'swimming_pool', label: 'Swimming Pool' },
    { key: 'pool', label: 'Swimming Pool' },
    { key: 'garage', label: 'Garage' },
    { key: 'garden', label: 'Garden' },
    { key: 'parking', label: 'Parking' },
    { key: 'security', label: 'Security' },
    { key: 'gym', label: 'Gym / Fitness' },
    { key: 'air_conditioning', label: 'Air Conditioning' },
    { key: 'ac', label: 'Air Conditioning' },
    { key: 'furnished', label: 'Furnished' },
    { key: 'balcony', label: 'Balcony' },
    { key: 'terrace', label: 'Terrace' },
    { key: 'elevator', label: 'Elevator' },
    { key: 'cctv', label: 'CCTV' },
    { key: 'playground', label: 'Playground' },
    { key: 'clubhouse', label: 'Clubhouse' },
    { key: 'rooftop', label: 'Rooftop' },
    { key: 'water_heater', label: 'Water Heater' },
    { key: 'internet', label: 'Internet' },
    { key: 'laundry', label: 'Laundry' },
  ];

  // Collect all amenity keys present in any property, dedup by label
  const getFeatureValue = (p: typeof selectedProperties[0], key: string) => {
    const features = p.property_features;
    if (!features) return undefined;
    return features[key];
  };

  const seenLabels = new Set<string>();
  const activeAmenities = amenityKeys.filter(({ key, label }) => {
    if (seenLabels.has(label)) return false;
    const hasAny = selectedProperties.some(p => {
      const val = getFeatureValue(p, key);
      return val !== undefined && val !== null && val !== false && val !== '' && val !== 0;
    });
    if (hasAny) seenLabels.add(label);
    return hasAny;
  });

  // Also find extra feature keys not in our predefined list
  const predefinedKeys = new Set(amenityKeys.map(a => a.key));
  const extraKeys = new Set<string>();
  selectedProperties.forEach(p => {
    if (p.property_features) {
      Object.keys(p.property_features).forEach(key => {
        if (!predefinedKeys.has(key) && !['bedrooms', 'bathrooms', 'area_sqm', 'parking_spaces'].includes(key)) {
          const val = p.property_features![key];
          if (val !== undefined && val !== null && val !== false && val !== '' && val !== 0) {
            extraKeys.add(key);
          }
        }
      });
    }
  });

  const renderAmenityValue = (value: any) => {
    if (value === undefined || value === null || value === false || value === '' || value === 0) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
    if (value === true) {
      return <Check className="h-4 w-4 text-primary" />;
    }
    return <span className="text-sm">{String(value)}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Property Comparison</h1>
              <p className="text-muted-foreground">
                Comparing {selectedProperties.length} properties side by side
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={clearComparison}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        {/* Comparison Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px] sticky left-0 bg-background z-10">Spec</TableHead>
                    {selectedProperties.map((p) => (
                      <TableHead key={p.id} className="min-w-[200px]">
                        <div className="space-y-2">
                          <div className="relative">
                            <img
                              src={getImageUrl(p)}
                              alt={p.title}
                              className="w-full h-28 object-cover rounded-lg"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background rounded-full"
                              onClick={() => removeFromComparison(p.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <h3 className="font-semibold text-sm line-clamp-2">{p.title}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => navigate(`/properties/${p.id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specs.map((spec) => (
                    <TableRow key={spec.label}>
                      <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">
                        {spec.label}
                      </TableCell>
                      {selectedProperties.map((p) => (
                        <TableCell key={p.id}>{spec.render(p)}</TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* Amenities Section Header */}
                  {(activeAmenities.length > 0 || extraKeys.size > 0) && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={selectedProperties.length + 1} className="font-semibold text-foreground sticky left-0 bg-muted/30 z-10">
                        Amenities & Features
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Predefined Amenities */}
                  {activeAmenities.map(({ key, label }) => (
                    <TableRow key={`amenity-${key}`}>
                      <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10">
                        {label}
                      </TableCell>
                      {selectedProperties.map((p) => (
                        <TableCell key={p.id}>
                          {renderAmenityValue(getFeatureValue(p, key))}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                  {/* Extra Amenities */}
                  {Array.from(extraKeys).map((key) => (
                    <TableRow key={`extra-${key}`}>
                      <TableCell className="font-medium text-muted-foreground sticky left-0 bg-background z-10 capitalize">
                        {key.replace(/_/g, ' ')}
                      </TableCell>
                      {selectedProperties.map((p) => (
                        <TableCell key={p.id}>
                          {renderAmenityValue(p.property_features?.[key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {selectedProperties.length > 1 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Price Range</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatIDR(Math.min(...prices))} — {formatIDR(Math.max(...prices))}
                  </p>
                </div>
                {areas.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Area Range</h4>
                    <p className="text-sm text-muted-foreground">
                      {Math.min(...areas)} m² — {Math.max(...areas)} m²
                    </p>
                  </div>
                )}
                {allPricePerSqm.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Best Value (Price/m²)</h4>
                    <p className="text-sm text-primary font-medium">
                      {selectedProperties.find(p => pricePerSqm(p) === minPricePerSqm)?.title?.slice(0, 30)}…
                    </p>
                    <p className="text-xs text-muted-foreground">{formatIDR(Math.round(minPricePerSqm!))}/m²</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertyComparison;
