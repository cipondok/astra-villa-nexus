import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlgorithmConfig {
  searchAlgorithm: {
    relevanceWeights: {
      textMatch: number;
      locationMatch: number;
      priceRelevance: number;
      featureMatch: number;
    };
    maxResults: number;
    enableAI: boolean;
    cacheTimeout: number;
  };
  recommendationEngine: {
    personalizedWeight: number;
    behaviorWeight: number;
    popularityWeight: number;
    maxRecommendations: number;
    enableRealTime: boolean;
  };
  behaviorAnalytics: {
    trackingEnabled: boolean;
    sessionTimeout: number;
    enableAnonymous: boolean;
    dataRetention: number; // days
  };
  modelOptimization: {
    autoOptimization: boolean;
    targetFPS: number;
    maxVertices: number;
    textureQuality: 'low' | 'medium' | 'high';
    enableLOD: boolean;
  };
}

interface Props {
  onSettingsChange: () => void;
}

export function AlgorithmSettings({ onSettingsChange }: Props) {
  const [config, setConfig] = useState<AlgorithmConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'algorithms');

      if (error) throw error;

      // Convert system settings to algorithm config
      const algorithmConfig = convertToConfig(data);
      setConfig(algorithmConfig);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load algorithm settings');
      setConfig(getDefaultConfig());
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!config) return;
    
    setIsSaving(true);
    try {
      // Convert config to system settings format
      const settingsData = convertFromConfig(config);
      
      // Update system settings
      for (const setting of settingsData) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            category: 'algorithms',
            key: setting.key,
            value: setting.value,
            description: setting.description
          });

        if (error) throw error;
      }

      // Apply settings to running algorithms
      await supabase.functions.invoke('algorithm-controller', {
        body: {
          action: 'update_config',
          config: config
        }
      });

      setHasChanges(false);
      toast.success('Algorithm settings updated successfully');
      onSettingsChange();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save algorithm settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setConfig(getDefaultConfig());
    setHasChanges(true);
  };

  const updateConfig = (path: string[], value: any) => {
    if (!config) return;
    
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    setConfig(newConfig);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Algorithm Settings</h2>
          <p className="text-muted-foreground">
            Configure and tune algorithm parameters for optimal performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button onClick={saveSettings} disabled={isSaving || !hasChanges}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Algorithm Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Search Algorithm</CardTitle>
            <CardDescription>Configure property search and ranking parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Relevance Weights</Label>
                <div className="space-y-3">
                  <SliderSetting
                    label="Text Match"
                    value={config.searchAlgorithm.relevanceWeights.textMatch}
                    onChange={(value) => updateConfig(['searchAlgorithm', 'relevanceWeights', 'textMatch'], value)}
                    min={0}
                    max={1}
                    step={0.1}
                    suffix="%"
                  />
                  <SliderSetting
                    label="Location Match"
                    value={config.searchAlgorithm.relevanceWeights.locationMatch}
                    onChange={(value) => updateConfig(['searchAlgorithm', 'relevanceWeights', 'locationMatch'], value)}
                    min={0}
                    max={1}
                    step={0.1}
                    suffix="%"
                  />
                  <SliderSetting
                    label="Price Relevance"
                    value={config.searchAlgorithm.relevanceWeights.priceRelevance}
                    onChange={(value) => updateConfig(['searchAlgorithm', 'relevanceWeights', 'priceRelevance'], value)}
                    min={0}
                    max={1}
                    step={0.1}
                    suffix="%"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxResults">Max Results</Label>
                  <Input
                    id="maxResults"
                    type="number"
                    value={config.searchAlgorithm.maxResults}
                    onChange={(e) => updateConfig(['searchAlgorithm', 'maxResults'], parseInt(e.target.value))}
                    min={10}
                    max={100}
                  />
                </div>
                <div>
                  <Label htmlFor="cacheTimeout">Cache Timeout (min)</Label>
                  <Input
                    id="cacheTimeout"
                    type="number"
                    value={config.searchAlgorithm.cacheTimeout}
                    onChange={(e) => updateConfig(['searchAlgorithm', 'cacheTimeout'], parseInt(e.target.value))}
                    min={1}
                    max={60}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableAI"
                  checked={config.searchAlgorithm.enableAI}
                  onCheckedChange={(checked) => updateConfig(['searchAlgorithm', 'enableAI'], checked)}
                />
                <Label htmlFor="enableAI">Enable AI-Enhanced Search</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Engine Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Engine</CardTitle>
            <CardDescription>Configure personalized recommendation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SliderSetting
              label="Personalized Weight"
              value={config.recommendationEngine.personalizedWeight}
              onChange={(value) => updateConfig(['recommendationEngine', 'personalizedWeight'], value)}
              min={0}
              max={1}
              step={0.1}
              suffix="%"
            />
            <SliderSetting
              label="Behavior Weight"
              value={config.recommendationEngine.behaviorWeight}
              onChange={(value) => updateConfig(['recommendationEngine', 'behaviorWeight'], value)}
              min={0}
              max={1}
              step={0.1}
              suffix="%"
            />
            <SliderSetting
              label="Popularity Weight"
              value={config.recommendationEngine.popularityWeight}
              onChange={(value) => updateConfig(['recommendationEngine', 'popularityWeight'], value)}
              min={0}
              max={1}
              step={0.1}
              suffix="%"
            />
            
            <div>
              <Label htmlFor="maxRecommendations">Max Recommendations</Label>
              <Input
                id="maxRecommendations"
                type="number"
                value={config.recommendationEngine.maxRecommendations}
                onChange={(e) => updateConfig(['recommendationEngine', 'maxRecommendations'], parseInt(e.target.value))}
                min={5}
                max={20}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableRealTime"
                checked={config.recommendationEngine.enableRealTime}
                onCheckedChange={(checked) => updateConfig(['recommendationEngine', 'enableRealTime'], checked)}
              />
              <Label htmlFor="enableRealTime">Enable Real-time Updates</Label>
            </div>
          </CardContent>
        </Card>

        {/* Behavior Analytics Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Behavior Analytics</CardTitle>
            <CardDescription>Configure user behavior tracking and analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="trackingEnabled"
                checked={config.behaviorAnalytics.trackingEnabled}
                onCheckedChange={(checked) => updateConfig(['behaviorAnalytics', 'trackingEnabled'], checked)}
              />
              <Label htmlFor="trackingEnabled">Enable Behavior Tracking</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableAnonymous"
                checked={config.behaviorAnalytics.enableAnonymous}
                onCheckedChange={(checked) => updateConfig(['behaviorAnalytics', 'enableAnonymous'], checked)}
              />
              <Label htmlFor="enableAnonymous">Track Anonymous Users</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (min)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={config.behaviorAnalytics.sessionTimeout}
                  onChange={(e) => updateConfig(['behaviorAnalytics', 'sessionTimeout'], parseInt(e.target.value))}
                  min={5}
                  max={120}
                />
              </div>
              <div>
                <Label htmlFor="dataRetention">Data Retention (days)</Label>
                <Input
                  id="dataRetention"
                  type="number"
                  value={config.behaviorAnalytics.dataRetention}
                  onChange={(e) => updateConfig(['behaviorAnalytics', 'dataRetention'], parseInt(e.target.value))}
                  min={30}
                  max={365}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3D Model Optimization Settings */}
        <Card>
          <CardHeader>
            <CardTitle>3D Model Optimization</CardTitle>
            <CardDescription>Configure 3D rendering and performance optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoOptimization"
                checked={config.modelOptimization.autoOptimization}
                onCheckedChange={(checked) => updateConfig(['modelOptimization', 'autoOptimization'], checked)}
              />
              <Label htmlFor="autoOptimization">Enable Auto-Optimization</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enableLOD"
                checked={config.modelOptimization.enableLOD}
                onCheckedChange={(checked) => updateConfig(['modelOptimization', 'enableLOD'], checked)}
              />
              <Label htmlFor="enableLOD">Enable Level of Detail (LOD)</Label>
            </div>
            
            <SliderSetting
              label="Target FPS"
              value={config.modelOptimization.targetFPS}
              onChange={(value) => updateConfig(['modelOptimization', 'targetFPS'], value)}
              min={30}
              max={120}
              step={10}
              suffix=" FPS"
            />
            
            <div>
              <Label htmlFor="maxVertices">Max Vertices (thousands)</Label>
              <Input
                id="maxVertices"
                type="number"
                value={config.modelOptimization.maxVertices / 1000}
                onChange={(e) => updateConfig(['modelOptimization', 'maxVertices'], parseInt(e.target.value) * 1000)}
                min={10}
                max={200}
              />
            </div>
            
            <div>
              <Label htmlFor="textureQuality">Texture Quality</Label>
              <Select
                value={config.modelOptimization.textureQuality}
                onValueChange={(value) => updateConfig(['modelOptimization', 'textureQuality'], value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (512px)</SelectItem>
                  <SelectItem value="medium">Medium (1024px)</SelectItem>
                  <SelectItem value="high">High (2048px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface SliderSettingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

function SliderSetting({ label, value, onChange, min, max, step, suffix = '' }: SliderSettingProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm text-muted-foreground">
          {(value * (suffix === '%' ? 100 : 1)).toFixed(1)}{suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

function getDefaultConfig(): AlgorithmConfig {
  return {
    searchAlgorithm: {
      relevanceWeights: {
        textMatch: 0.4,
        locationMatch: 0.25,
        priceRelevance: 0.2,
        featureMatch: 0.15
      },
      maxResults: 50,
      enableAI: true,
      cacheTimeout: 5
    },
    recommendationEngine: {
      personalizedWeight: 0.5,
      behaviorWeight: 0.3,
      popularityWeight: 0.2,
      maxRecommendations: 10,
      enableRealTime: true
    },
    behaviorAnalytics: {
      trackingEnabled: true,
      sessionTimeout: 30,
      enableAnonymous: true,
      dataRetention: 90
    },
    modelOptimization: {
      autoOptimization: true,
      targetFPS: 60,
      maxVertices: 50000,
      textureQuality: 'medium',
      enableLOD: true
    }
  };
}

function convertToConfig(settings: any[]): AlgorithmConfig {
  // Convert system settings array to AlgorithmConfig
  // This would map database settings to the config structure
  return getDefaultConfig(); // Simplified for now
}

function convertFromConfig(config: AlgorithmConfig) {
  // Convert AlgorithmConfig to system settings format
  return [
    {
      key: 'search_algorithm',
      value: config.searchAlgorithm,
      description: 'Search algorithm configuration'
    },
    {
      key: 'recommendation_engine',
      value: config.recommendationEngine,
      description: 'Recommendation engine configuration'
    },
    {
      key: 'behavior_analytics',
      value: config.behaviorAnalytics,
      description: 'Behavior analytics configuration'
    },
    {
      key: 'model_optimization',
      value: config.modelOptimization,
      description: '3D model optimization configuration'
    }
  ];
}