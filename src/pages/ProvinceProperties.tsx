import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Building2, Home, TreePine, Store, Castle } from 'lucide-react';
import { usePropertyCountsByProvince, PROPERTY_TYPE_LABELS, PROPERTY_TYPE_COLORS } from '@/hooks/usePropertyCountsByProvince';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROPERTY_TYPE_ICONS: Record<string, React.ReactNode> = {
  villa: <Castle className="h-4 w-4" />,
  house: <Home className="h-4 w-4" />,
  apartment: <Building2 className="h-4 w-4" />,
  land: <TreePine className="h-4 w-4" />,
  commercial: <Store className="h-4 w-4" />,
  townhouse: <Home className="h-4 w-4" />,
};

const ProvinceProperties = () => {
  const { data: provinceCounts, isLoading } = usePropertyCountsByProvince();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const provinces = provinceCounts ? Object.entries(provinceCounts)
    .map(([province, types]) => ({
      province,
      types,
      total: Object.values(types).reduce((s, c) => s + c, 0),
    }))
    .filter(p => p.province.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.total - a.total) : [];

  const allTypes = Array.from(new Set(provinces.flatMap(p => Object.keys(p.types)))).sort();

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Properties by Province
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse {provinces.length} provinces with {provinces.reduce((s, p) => s + p.total, 0).toLocaleString()} active listings
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search province..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {provinces.map(({ province, types, total }) => (
          <Card
            key={province}
            className="hover:shadow-lg transition-all cursor-pointer border-border hover:border-primary/30"
            onClick={() => navigate(`/properties?location=${encodeURIComponent(province)}`)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  {province}
                </span>
                <Badge variant="secondary" className="text-sm font-bold">
                  {total.toLocaleString()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTypes.map(type => {
                  const count = types[type] || 0;
                  if (count === 0) return null;
                  return (
                    <div
                      key={type}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${PROPERTY_TYPE_COLORS[type] || 'bg-muted text-muted-foreground'}`}
                    >
                      {PROPERTY_TYPE_ICONS[type]}
                      {PROPERTY_TYPE_LABELS[type] || type} ({count})
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {provinces.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No provinces found matching "{search}"
        </div>
      )}
    </div>
  );
};

export default ProvinceProperties;
