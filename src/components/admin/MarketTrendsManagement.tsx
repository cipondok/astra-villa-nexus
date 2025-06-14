
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAlert } from "@/contexts/AlertContext";
import { format } from 'date-fns';
import { Trash2 } from "lucide-react";

const MarketTrendsManagement = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useAlert();
    const [newTrend, setNewTrend] = useState({
        trend_type: 'interest_rate',
        value: 'dropped',
        description: '',
        location: '',
        property_type: ''
    });

    const { data: trends, isLoading } = useQuery({
        queryKey: ['market_trends'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('market_trends')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const addTrendMutation = useMutation({
        mutationFn: async (trendData: any) => {
            const { error } = await supabase.from('market_trends').insert(trendData);
            if (error) throw error;
        },
        onSuccess: () => {
            showSuccess("Market Trend Added", "The new market trend has been saved.");
            queryClient.invalidateQueries({ queryKey: ['market_trends'] });
            setNewTrend({ trend_type: 'interest_rate', value: 'dropped', description: '', location: '', property_type: '' });
        },
        onError: (error: any) => {
            showError("Error Adding Trend", error.message);
        },
    });
    
    const deleteTrendMutation = useMutation({
        mutationFn: async (trendId: string) => {
            const { error } = await supabase.from('market_trends').delete().eq('id', trendId);
            if (error) throw error;
        },
        onSuccess: () => {
            showSuccess("Market Trend Deleted");
            queryClient.invalidateQueries({ queryKey: ['market_trends'] });
        },
        onError: (error: any) => {
            showError("Error Deleting Trend", error.message);
        },
    });

    const handleAddTrend = () => {
        if (!newTrend.trend_type || !newTrend.value || !newTrend.description) {
            showError("Missing Fields", "Please fill in type, value, and description.");
            return;
        }
        const trendDataToSubmit = {
            ...newTrend,
            location: newTrend.location || null,
            property_type: newTrend.property_type || null,
        }
        addTrendMutation.mutate(trendDataToSubmit);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Market Trend</CardTitle>
                    <CardDescription>
                        Add a new market trend to trigger automatic revival of dormant listings. The AI will check daily.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="trend-type">Trend Type</Label>
                            <Input id="trend-type" value={newTrend.trend_type} onChange={(e) => setNewTrend({ ...newTrend, trend_type: e.target.value })} placeholder="e.g., interest_rate" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trend-value">Value</Label>
                            <Input id="trend-value" value={newTrend.value} onChange={(e) => setNewTrend({ ...newTrend, value: e.target.value })} placeholder="e.g., dropped" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="trend-property-type">Property Type (Optional)</Label>
                            <Input id="trend-property-type" value={newTrend.property_type} onChange={(e) => setNewTrend({ ...newTrend, property_type: e.target.value })} placeholder="e.g., villa" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="trend-location">Location (Optional)</Label>
                            <Input id="trend-location" value={newTrend.location} onChange={(e) => setNewTrend({ ...newTrend, location: e.target.value })} placeholder="e.g., Bali" />
                        </div>
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                            <Label htmlFor="trend-description">Description</Label>
                            <Textarea id="trend-description" value={newTrend.description} onChange={(e) => setNewTrend({ ...newTrend, description: e.target.value })} placeholder="e.g., Interest rates dropped by 0.5%" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleAddTrend} disabled={addTrendMutation.isPending}>
                            {addTrendMutation.isPending ? 'Adding...' : 'Add Trend'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Market Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">Description</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Property Type</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7} className="text-center">Loading trends...</TableCell></TableRow>
                            ) : trends && trends.length > 0 ? (
                                trends.map((trend) => (
                                    <TableRow key={trend.id}>
                                        <TableCell className="font-medium">{trend.description}</TableCell>
                                        <TableCell>{trend.trend_type}</TableCell>
                                        <TableCell>{trend.value}</TableCell>
                                        <TableCell>{trend.location || 'N/A'}</TableCell>
                                        <TableCell>{trend.property_type || 'N/A'}</TableCell>
                                        <TableCell>{format(new Date(trend.created_at), 'PP')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => deleteTrendMutation.mutate(trend.id)} disabled={deleteTrendMutation.isPending}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={7} className="text-center">No market trends found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default MarketTrendsManagement;
