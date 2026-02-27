
import React, { Suspense, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Center, ContactShadows, Html, useProgress } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Box, Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Sun, Moon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GLBModelViewerProps {
  modelUrl: string;
  title?: string;
  className?: string;
}

// ─── Loader overlay ───────────────────────────────────────────────────────────
function LoaderOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground font-medium tabular-nums">
          Loading {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
}

// ─── GLB Scene ────────────────────────────────────────────────────────────────
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const GLBModelViewer: React.FC<GLBModelViewerProps> = ({
  modelUrl,
  title = "3D Property Model",
  className,
}) => {
  const controlsRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [envPreset, setEnvPreset] = useState<'apartment' | 'sunset' | 'night'>('apartment');
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const resetCamera = () => {
    controlsRef.current?.reset();
  };

  const cycleEnv = () => {
    setEnvPreset((prev) =>
      prev === 'apartment' ? 'sunset' : prev === 'sunset' ? 'night' : 'apartment'
    );
  };

  return (
    <Card
      ref={containerRef}
      className={cn(
        "border border-border bg-card backdrop-blur-xl rounded-xl overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      <CardHeader className="p-2 sm:p-3 pb-1 bg-muted/30">
        <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Box className="h-2.5 w-2.5 text-primary" />
          </div>
          {title}
          <Badge variant="outline" className="ml-auto text-[8px] px-1.5 h-4 border-primary/30 text-primary">
            GLB/GLTF
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* Canvas */}
        <div className={cn("w-full bg-muted/20", isFullscreen ? "h-[calc(100vh-48px)]" : "h-80 sm:h-96")}>
          <Canvas
            camera={{ position: [0, 2, 5], fov: 50 }}
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={<LoaderOverlay />}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
              <Model url={modelUrl} />
              <ContactShadows
                position={[0, -0.5, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={4}
              />
              <Environment preset={envPreset} />
            </Suspense>
            <OrbitControls
              ref={controlsRef}
              enablePan
              enableZoom
              enableRotate
              autoRotate
              autoRotateSpeed={1}
              maxPolarAngle={Math.PI / 1.8}
              minDistance={1}
              maxDistance={20}
            />
          </Canvas>
        </div>

        {/* Controls overlay */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 bg-background/70 backdrop-blur-md hover:bg-background/90 border border-border/50"
              onClick={resetCamera}
              title="Reset camera"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 bg-background/70 backdrop-blur-md hover:bg-background/90 border border-border/50"
              onClick={cycleEnv}
              title="Change lighting"
            >
              {envPreset === 'night' ? (
                <Moon className="h-3 w-3" />
              ) : (
                <Sun className="h-3 w-3" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[9px] text-muted-foreground bg-background/70 backdrop-blur-md px-2 py-1 rounded-md border border-border/50">
              Drag to rotate • Scroll to zoom
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 bg-background/70 backdrop-blur-md hover:bg-background/90 border border-border/50"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GLBModelViewer;
