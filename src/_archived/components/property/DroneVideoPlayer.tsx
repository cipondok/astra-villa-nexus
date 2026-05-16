
import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  RotateCcw, Video
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DroneVideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

const DroneVideoPlayer = ({ videoUrl, title = "Drone Walkthrough", className }: DroneVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();

  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");
  const isEmbed = isYouTube || isVimeo;

  // Extract YouTube embed URL
  const getEmbedUrl = useCallback(() => {
    if (isYouTube) {
      const match = videoUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0` : videoUrl;
    }
    if (isVimeo) {
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : videoUrl;
    }
    return videoUrl;
  }, [videoUrl, isYouTube, isVimeo]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const restart = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setIsPlaying(true);
  }, []);

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  }, []);

  const seek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimeout.current);
    if (isPlaying) {
      hideTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={cn("border border-border bg-card backdrop-blur-xl rounded-xl overflow-hidden", className)}>
      <CardHeader className="p-2 sm:p-3 pb-1 bg-muted/30">
        <CardTitle className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
          <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
            <Video className="h-2.5 w-2.5 text-primary" />
          </div>
          {title}
          <Badge variant="outline" className="ml-auto text-[8px] px-1.5 h-4 border-primary/30 text-primary">
            🚁 Drone
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isEmbed ? (
          /* YouTube / Vimeo embed */
          <div className="relative aspect-video">
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              title={title}
            />
          </div>
        ) : (
          /* Direct video file */
          <div
            ref={containerRef}
            className="relative aspect-video bg-black group cursor-pointer"
            onMouseMove={showControlsTemporarily}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              muted={isMuted}
              playsInline
              preload="metadata"
              onTimeUpdate={onTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onLoadedMetadata={() => {
                const v = videoRef.current;
                if (v) v.muted = true;
              }}
            />

            {/* Play overlay (before first play) */}
            {!hasStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
                  <Play className="h-7 w-7 text-primary-foreground ml-1" />
                </div>
              </div>
            )}

            {/* Controls bar */}
            <div
              className={cn(
                "absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 transition-opacity duration-300",
                showControls || !isPlaying ? "opacity-100" : "opacity-0"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div
                className="w-full h-1 bg-white/20 rounded-full mb-2 cursor-pointer group/bar"
                onClick={seek}
              >
                <div
                  className="h-full bg-primary rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-primary rounded-full shadow opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={restart}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </Button>
                  {videoRef.current && (
                    <span className="text-[10px] text-white/70 ml-1 tabular-nums">
                      {formatTime(videoRef.current.currentTime)} / {formatTime(videoRef.current.duration || 0)}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DroneVideoPlayer;
