import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Ruler, Plus, Trash2, Move, MousePointer2, Calculator,
  RotateCcw, Download, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeasurementPoint {
  id: string;
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  startPoint: MeasurementPoint;
  endPoint: MeasurementPoint;
  distancePixels: number;
  distanceMeters: number;
  label?: string;
}

interface DistanceMeasurementToolProps {
  imageUrl: string;
  propertyArea?: number;
  isFullscreen?: boolean;
}

const DistanceMeasurementTool: React.FC<DistanceMeasurementToolProps> = ({
  imageUrl,
  propertyArea,
  isFullscreen = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentPoints, setCurrentPoints] = useState<MeasurementPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(100); // pixels per meter
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationDistance, setCalibrationDistance] = useState('1');
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const calculateDistance = (p1: MeasurementPoint, p2: MeasurementPoint): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPoint: MeasurementPoint = { id: generateId(), x, y };

    if (calibrationMode) {
      setCurrentPoints((prev) => {
        if (prev.length === 0) {
          return [newPoint];
        } else {
          const distancePixels = calculateDistance(prev[0], newPoint);
          const newScale = distancePixels / parseFloat(calibrationDistance);
          setScale(newScale);
          setCalibrationMode(false);
          toast.success(`Scale calibrated: ${newScale.toFixed(1)} pixels/meter`);
          return [];
        }
      });
      return;
    }

    if (!isDrawing) {
      setCurrentPoints([newPoint]);
      setIsDrawing(true);
    } else {
      const startPoint = currentPoints[0];
      const distancePixels = calculateDistance(startPoint, newPoint);
      const distanceMeters = distancePixels / scale;

      const newMeasurement: Measurement = {
        id: generateId(),
        startPoint,
        endPoint: newPoint,
        distancePixels,
        distanceMeters,
      };

      setMeasurements((prev) => [...prev, newMeasurement]);
      setCurrentPoints([]);
      setIsDrawing(false);
    }
  }, [isDrawing, currentPoints, scale, calibrationMode, calibrationDistance]);

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
    if (selectedMeasurement === id) {
      setSelectedMeasurement(null);
    }
  };

  const handleClearAll = () => {
    setMeasurements([]);
    setCurrentPoints([]);
    setIsDrawing(false);
    setSelectedMeasurement(null);
  };

  const handleExport = () => {
    const data = {
      measurements: measurements.map((m) => ({
        label: m.label || `Measurement ${measurements.indexOf(m) + 1}`,
        distance: `${m.distanceMeters.toFixed(2)}m`,
        startPoint: { x: m.startPoint.x, y: m.startPoint.y },
        endPoint: { x: m.endPoint.x, y: m.endPoint.y },
      })),
      scale: `${scale.toFixed(1)} pixels/meter`,
      totalDistance: measurements.reduce((acc, m) => acc + m.distanceMeters, 0).toFixed(2) + 'm',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'measurements.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Measurements exported!');
  };

  const totalDistance = measurements.reduce((acc, m) => acc + m.distanceMeters, 0);

  return (
    <div className={cn(
      "grid gap-3 sm:gap-4 p-3 sm:p-4",
      isFullscreen ? "lg:grid-cols-3 h-screen overflow-auto" : "lg:grid-cols-3"
    )}>
      {/* Measurement Canvas */}
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-muted border border-border lg:col-span-2",
        isFullscreen ? "h-[600px]" : "h-[300px] sm:h-[400px]"
      )}>
        <div
          ref={containerRef}
          className={cn(
            "relative w-full h-full",
            isDrawing || calibrationMode ? "cursor-crosshair" : "cursor-default"
          )}
          onClick={handleImageClick}
        >
          <img
            src={imageUrl}
            alt="Room to measure"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />

          {/* Render completed measurements */}
          {measurements.map((measurement, index) => {
            const midX = (measurement.startPoint.x + measurement.endPoint.x) / 2;
            const midY = (measurement.startPoint.y + measurement.endPoint.y) / 2;
            const angle = Math.atan2(
              measurement.endPoint.y - measurement.startPoint.y,
              measurement.endPoint.x - measurement.startPoint.x
            ) * (180 / Math.PI);

            return (
              <React.Fragment key={measurement.id}>
                {/* Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line
                    x1={`${measurement.startPoint.x}%`}
                    y1={`${measurement.startPoint.y}%`}
                    x2={`${measurement.endPoint.x}%`}
                    y2={`${measurement.endPoint.y}%`}
                    stroke={selectedMeasurement === measurement.id ? '#3b82f6' : '#ef4444'}
                    strokeWidth="2"
                    strokeDasharray={selectedMeasurement === measurement.id ? 'none' : '5,5'}
                  />
                </svg>

                {/* Start point */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${measurement.startPoint.x}%`, top: `${measurement.startPoint.y}%` }}
                />

                {/* End point */}
                <div
                  className="absolute w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${measurement.endPoint.x}%`, top: `${measurement.endPoint.y}%` }}
                />

                {/* Distance label */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ left: `${midX}%`, top: `${midY}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMeasurement(measurement.id);
                  }}
                >
                  <Badge
                    variant={selectedMeasurement === measurement.id ? 'default' : 'secondary'}
                    className="text-sm font-mono shadow-lg"
                  >
                    {measurement.distanceMeters.toFixed(2)}m
                  </Badge>
                </div>
              </React.Fragment>
            );
          })}

          {/* Current drawing point */}
          {currentPoints.length > 0 && (
            <>
              <div
                className="absolute w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg animate-pulse -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${currentPoints[0].x}%`, top: `${currentPoints[0].y}%` }}
              />
              <div
                className="absolute text-xs text-white bg-blue-500 px-2 py-1 rounded -translate-x-1/2"
                style={{ left: `${currentPoints[0].x}%`, top: `${currentPoints[0].y + 3}%` }}
              >
                Click to set end point
              </div>
            </>
          )}

          {/* Calibration mode indicator */}
          {calibrationMode && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <Badge variant="destructive" className="animate-pulse">
                <Ruler className="h-3 w-3 mr-1" />
                Calibration Mode - Click two points of known distance ({calibrationDistance}m)
              </Badge>
            </div>
          )}

          {/* Instructions */}
          {!isDrawing && !calibrationMode && measurements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-card/95 border border-border rounded-xl p-4 sm:p-6 text-center max-w-xs shadow-lg">
                <MousePointer2 className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 text-primary" />
                <p className="text-xs sm:text-sm text-foreground">Click to start measuring</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Set start and end points</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls Panel */}
      <Card className="h-fit border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base text-foreground">
            <Ruler className="h-4 w-4 text-primary" />
            Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Calibration */}
          <div className="space-y-2 p-2 sm:p-3 bg-muted rounded-lg">
            <Label className="text-[10px] sm:text-xs font-medium flex items-center gap-1 text-foreground">
              <Info className="h-3 w-3" />
              Calibration
            </Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={calibrationDistance}
                onChange={(e) => setCalibrationDistance(e.target.value)}
                className="w-16 sm:w-20 h-7 sm:h-8 text-xs sm:text-sm border-border"
                placeholder="1"
              />
              <span className="text-xs sm:text-sm text-muted-foreground self-center">meters</span>
            </div>
            <Button
              variant={calibrationMode ? 'destructive' : 'outline'}
              size="sm"
              className="w-full h-8 text-xs border-border"
              onClick={() => {
                setCalibrationMode(!calibrationMode);
                setCurrentPoints([]);
                setIsDrawing(false);
              }}
            >
              {calibrationMode ? 'Cancel Calibration' : 'Calibrate Scale'}
            </Button>
            <p className="text-[10px] text-muted-foreground">
              Current: {scale.toFixed(1)} px/m
            </p>
          </div>

          {/* Measurements List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Measurements ({measurements.length})</Label>
              {measurements.length > 0 && (
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={handleClearAll}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="max-h-[200px] overflow-auto space-y-1">
              {measurements.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No measurements yet
                </p>
              ) : (
                measurements.map((m, index) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                      selectedMeasurement === m.id ? "bg-primary/10" : "bg-muted hover:bg-muted/80"
                    )}
                    onClick={() => setSelectedMeasurement(m.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-mono">{m.distanceMeters.toFixed(2)}m</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMeasurement(m.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          {measurements.length > 0 && (
            <div className="p-3 bg-primary/10 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Distance</span>
                <span className="text-lg font-bold font-mono">{totalDistance.toFixed(2)}m</span>
              </div>
              {propertyArea && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Property Area</span>
                  <span>{propertyArea} m²</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleExport} disabled={measurements.length === 0}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleClearAll}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistanceMeasurementTool;
