import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Globe, 
  Database,
  Merge,
  Info
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Official 38 Indonesian Provinces
const OFFICIAL_PROVINCES = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau',
  'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung',
  'DKI Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah', 'DI Yogyakarta',
  'Jawa Timur', 'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan', 'Papua Barat Daya'
];

interface ProvinceData {
  normalized_name: string;
  original_name: string;
  province_code: string;
  location_count: number;
  city_count: number;
}

interface LocationRow {
  province_name: string;
  province_code: string;
  city_name: string;
}

const IndonesianProvinceAnalysis = () => {
  const queryClient = useQueryClient();

  // Fetch province analysis data
  const { data: provinceData = [], isLoading, error } = useQuery({
    queryKey: ['province-analysis'],
    queryFn: async (): Promise<ProvinceData[]> => {
      const { data: locationData, error: fetchError } = await supabase
        .from('locations')
        .select('province_name, province_code, city_name');
      
      if (fetchError) throw fetchError;
      if (!locationData) return [];
      
      // Process the data manually to group by province
      const groupedData = (locationData as LocationRow[]).reduce((acc: Record<string, any>, row: LocationRow) => {
        const normalized = row.province_name.toUpperCase().trim();
        const key = `${normalized}-${row.province_code}`;
        
        if (!acc[key]) {
          acc[key] = {
            normalized_name: normalized,
            original_name: row.province_name,
            province_code: row.province_code,
            location_count: 0,
            city_count: 0,
            cities: new Set<string>()
          };
        }
        
        acc[key].location_count++;
        acc[key].cities.add(row.city_name);
        
        return acc;
      }, {});
      
      return Object.values(groupedData).map((item: any) => ({
        normalized_name: item.normalized_name,
        original_name: item.original_name,
        province_code: item.province_code,
        location_count: item.location_count,
        city_count: item.cities.size
      })) as ProvinceData[];
    }
  });

  // Group provinces by normalized name to find duplicates
  const duplicateGroups = provinceData.reduce((acc: Record<string, ProvinceData[]>, province: ProvinceData) => {
    const normalized = province.normalized_name;
    if (!acc[normalized]) {
      acc[normalized] = [];
    }
    acc[normalized].push(province);
    return acc;
  }, {});

  const duplicates = Object.entries(duplicateGroups).filter(([_, group]) => group.length > 1);
  const uniqueProvinces = Object.keys(duplicateGroups);
  const missingProvinces = OFFICIAL_PROVINCES.filter(official => 
    !uniqueProvinces.some(existing => 
      existing === official.toUpperCase() || 
      existing.includes(official.toUpperCase().replace(/\s+/g, ' '))
    )
  );

  // Clean up duplicates mutation
  const cleanupMutation = useMutation({
    mutationFn: async (duplicateGroup: ProvinceData[]) => {
      // Keep the entry with most locations, standardize the name
      const primary = duplicateGroup.reduce((prev, current) => 
        current.location_count > prev.location_count ? current : prev
      );
      
      const standardName = primary.original_name;
      const otherEntries = duplicateGroup.filter(p => p.original_name !== standardName);
      
      // Update all locations with non-standard names to use the standard name
      for (const entry of otherEntries) {
        const { error } = await supabase
          .from('locations')
          .update({ province_name: standardName })
          .eq('province_name', entry.original_name);
        
        if (error) throw error;
      }
      
      return { updated: otherEntries.length, standardName };
    },
    onSuccess: (result) => {
      toast.success(`Standardized ${result.updated} entries to "${result.standardName}"`);
      queryClient.invalidateQueries({ queryKey: ['province-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error) => {
      toast.error(`Failed to cleanup duplicates: ${error.message}`);
    }
  });

  const handleCleanupDuplicates = (group: ProvinceData[]) => {
    cleanupMutation.mutate(group);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading province analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-red-600">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Error loading province data: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Indonesian Province Analysis
          </CardTitle>
          <CardDescription>
            Analysis of 38 official Indonesian provinces vs database content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">38</div>
              <div className="text-sm text-muted-foreground">Official Provinces</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{uniqueProvinces.length}</div>
              <div className="text-sm text-muted-foreground">Found in Database</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{duplicates.length}</div>
              <div className="text-sm text-muted-foreground">Duplicate Groups</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{missingProvinces.length}</div>
              <div className="text-sm text-muted-foreground">Missing Provinces</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="duplicates">Duplicates ({duplicates.length})</TabsTrigger>
          <TabsTrigger value="missing">Missing ({missingProvinces.length})</TabsTrigger>
          <TabsTrigger value="complete">All Provinces</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Quality Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Provinces Found</span>
                  </div>
                  <Badge variant="default">{uniqueProvinces.length}/38</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Need Standardization</span>
                  </div>
                  <Badge variant="secondary">{duplicates.length} groups</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Missing Provinces</span>
                  </div>
                  <Badge variant="destructive">{missingProvinces.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={duplicates.length === 0}
                >
                  <Merge className="h-4 w-4 mr-2" />
                  Standardize All Duplicates ({duplicates.length})
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  disabled={missingProvinces.length === 0}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Import Missing Provinces ({missingProvinces.length})
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="duplicates">
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Province Names</CardTitle>
              <CardDescription>
                Provinces with multiple name variations that need standardization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {duplicates.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-muted-foreground">No duplicates found! All province names are standardized.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {duplicates.map(([normalized, group]) => (
                    <div key={normalized} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{normalized}</h4>
                        <Button
                          size="sm"
                          onClick={() => handleCleanupDuplicates(group)}
                          disabled={cleanupMutation.isPending}
                        >
                          <Merge className="h-3 w-3 mr-1" />
                          Standardize
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.map((province: ProvinceData) => (
                          <div key={province.original_name} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="text-sm">{province.original_name}</span>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {province.location_count} locations
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {province.city_count} cities
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missing">
          <Card>
            <CardHeader>
              <CardTitle>Missing Provinces</CardTitle>
              <CardDescription>
                Official Indonesian provinces not found in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {missingProvinces.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <p className="text-muted-foreground">All provinces are present in the database!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {missingProvinces.map((province) => (
                    <div key={province} className="p-3 border rounded-lg bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">{province}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        No location data found
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complete">
          <Card>
            <CardHeader>
              <CardTitle>All 38 Indonesian Provinces</CardTitle>
              <CardDescription>
                Complete list with database status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {OFFICIAL_PROVINCES.map((province, index) => {
                  const found = uniqueProvinces.find(existing => 
                    existing === province.toUpperCase() || 
                    existing.includes(province.toUpperCase().replace(/\s+/g, ' '))
                  );
                  const isPresent = !!found;
                  
                  return (
                    <div 
                      key={province} 
                      className={`p-3 border rounded-lg ${
                        isPresent 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{index + 1}
                        </Badge>
                        {isPresent ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm">{province}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isPresent ? 'Data available' : 'Missing from database'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(duplicates.length > 0 || missingProvinces.length > 0) && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Data Quality Issues Detected:</strong> {duplicates.length} duplicate groups and {missingProvinces.length} missing provinces found. 
            Use the cleanup tools above to standardize your location data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default IndonesianProvinceAnalysis;
