
import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { optimizeImageForUpload } from "@/utils/imageCompression";
import {
  Upload, X, Image as ImageIcon, Video, Box, Sparkles, Loader2, Eye, Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type MediaType = "panoramas" | "models" | "drone-videos" | "staging";

interface UploadedFile {
  name: string;
  url: string;
  path: string;
  size: number;
  type: MediaType;
}

interface VRMediaUploaderProps {
  propertyId?: string;
  onPanoramasChange: (urls: string[]) => void;
  onModelChange: (url: string) => void;
  onDroneVideoChange: (url: string) => void;
  onStagingImagesChange: (urls: string[]) => void;
  panoramaUrls?: string[];
  modelUrl?: string;
  droneVideoUrl?: string;
  stagingImageUrls?: string[];
}

// ─── Section config ───────────────────────────────────────────────────────────
const SECTIONS: {
  type: MediaType;
  label: string;
  icon: typeof ImageIcon;
  accept: string;
  multiple: boolean;
  maxSizeMB: number;
  hint: string;
}[] = [
  {
    type: "panoramas",
    label: "360° Panorama",
    icon: ImageIcon,
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
    maxSizeMB: 20,
    hint: "JPG/PNG/WebP, max 20 MB each",
  },
  {
    type: "models",
    label: "GLB / GLTF Model",
    icon: Box,
    accept: ".glb,.gltf,model/gltf-binary,model/gltf+json,application/octet-stream",
    multiple: false,
    maxSizeMB: 100,
    hint: "GLB or GLTF, max 100 MB",
  },
  {
    type: "drone-videos",
    label: "Drone Walkthrough",
    icon: Video,
    accept: "video/mp4,video/webm,video/quicktime",
    multiple: false,
    maxSizeMB: 500,
    hint: "MP4/WebM, max 500 MB",
  },
  {
    type: "staging",
    label: "AI Staging Images",
    icon: Sparkles,
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
    maxSizeMB: 20,
    hint: "JPG/PNG/WebP, max 20 MB each",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const VRMediaUploader = ({
  propertyId = "draft",
  onPanoramasChange,
  onModelChange,
  onDroneVideoChange,
  onStagingImagesChange,
  panoramaUrls = [],
  modelUrl = "",
  droneVideoUrl = "",
  stagingImageUrls = [],
}: VRMediaUploaderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploads, setUploads] = useState<Record<MediaType, UploadedFile[]>>({
    panoramas: [],
    models: [],
    "drone-videos": [],
    staging: [],
  });
  const [uploading, setUploading] = useState<MediaType | null>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState<MediaType | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // ── helpers ─────────────────────────────────────────────────────────────────
  const storagePath = useCallback(
    (type: MediaType, fileName: string) => {
      if (!user?.id) return "";
      const ts = Date.now();
      const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      return `${user.id}/${propertyId}/${type}/${ts}_${safe}`;
    },
    [user?.id, propertyId]
  );

  const isImage = (type: MediaType) => type === "panoramas" || type === "staging";

  // ── upload handler ──────────────────────────────────────────────────────────
  const handleUpload = useCallback(
    async (files: FileList | File[], type: MediaType) => {
      if (!user?.id) {
        toast({ title: "Login required", description: "Please login to upload files.", variant: "destructive" });
        return;
      }

      const section = SECTIONS.find((s) => s.type === type)!;
      const maxBytes = section.maxSizeMB * 1024 * 1024;

      setUploading(type);
      setProgress(0);

      const fileArray = Array.from(files);
      const total = fileArray.length;
      const uploaded: UploadedFile[] = [];

      for (let i = 0; i < total; i++) {
        let file = fileArray[i];

        // Size check
        if (file.size > maxBytes) {
          toast({ title: "File too large", description: `${file.name} exceeds ${section.maxSizeMB} MB`, variant: "destructive" });
          continue;
        }

        // Compress images
        if (isImage(type) && file.type.startsWith("image/")) {
          try {
            file = await optimizeImageForUpload(file, { maxSizeMB: 5, maxWidthOrHeight: 4096 });
          } catch {
            // proceed with original if compression fails
          }
        }

        const path = storagePath(type, file.name);
        const { error } = await supabase.storage.from("vr-media").upload(path, file, { upsert: true });

        if (error) {
          console.error("Upload error:", error);
          toast({ title: "Upload failed", description: error.message, variant: "destructive" });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage.from("vr-media").getPublicUrl(path);

        uploaded.push({ name: file.name, url: publicUrl, path, size: file.size, type });
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      if (uploaded.length > 0) {
        setUploads((prev) => {
          const updated = { ...prev, [type]: [...prev[type], ...uploaded] };
          // Emit to parent
          emitChange(type, updated[type]);
          return updated;
        });
        toast({ title: "Upload complete", description: `${uploaded.length} file(s) uploaded` });
      }

      setUploading(null);
      setProgress(0);
    },
    [user?.id, storagePath, toast]
  );

  const emitChange = useCallback(
    (type: MediaType, files: UploadedFile[]) => {
      const urls = files.map((f) => f.url);
      switch (type) {
        case "panoramas":
          onPanoramasChange(urls);
          break;
        case "models":
          onModelChange(urls[0] || "");
          break;
        case "drone-videos":
          onDroneVideoChange(urls[0] || "");
          break;
        case "staging":
          onStagingImagesChange(urls);
          break;
      }
    },
    [onPanoramasChange, onModelChange, onDroneVideoChange, onStagingImagesChange]
  );

  // ── delete handler ──────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (type: MediaType, index: number) => {
      const file = uploads[type][index];
      if (!file) return;

      const { error } = await supabase.storage.from("vr-media").remove([file.path]);
      if (error) {
        toast({ title: "Delete failed", description: error.message, variant: "destructive" });
        return;
      }

      setUploads((prev) => {
        const updated = { ...prev, [type]: prev[type].filter((_, i) => i !== index) };
        emitChange(type, updated[type]);
        return updated;
      });
    },
    [uploads, emitChange, toast]
  );

  // ── drag handlers ───────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent, type: MediaType) => {
      e.preventDefault();
      setDragOver(null);
      if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files, type);
    },
    [handleUpload]
  );

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const sectionFiles = uploads[section.type];
        const isActive = uploading === section.type;
        const isDragActive = dragOver === section.type;

        return (
          <div key={section.type} className="space-y-2">
            {/* Label */}
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Icon className="h-4 w-4 text-primary" />
              {section.label}
            </label>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(section.type); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => onDrop(e, section.type)}
              onClick={() => inputRefs.current[section.type]?.click()}
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
                isActive && "opacity-50 pointer-events-none"
              )}
            >
              <input
                ref={(el) => { inputRefs.current[section.type] = el; }}
                type="file"
                accept={section.accept}
                multiple={section.multiple}
                onChange={(e) => e.target.files && handleUpload(e.target.files, section.type)}
                className="hidden"
              />

              {isActive ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <Progress value={progress} className="w-48 h-1.5" />
                  <p className="text-xs text-muted-foreground">{progress}% uploading…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <p className="text-xs font-medium">Drop files or click to upload</p>
                  <p className="text-[10px] text-muted-foreground">{section.hint}</p>
                </div>
              )}
            </div>

            {/* Thumbnails / file list */}
            {sectionFiles.length > 0 && (
              <div className={cn(
                isImage(section.type) ? "grid grid-cols-4 gap-2" : "space-y-1"
              )}>
                {sectionFiles.map((file, idx) =>
                  isImage(section.type) ? (
                    <div key={idx} className="relative group aspect-square rounded-md overflow-hidden border border-border">
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <a href={file.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          <Eye className="h-4 w-4 text-white" />
                        </a>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(section.type, idx); }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={idx} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <button onClick={() => handleDelete(section.type, idx)} className="text-destructive hover:text-destructive/80">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VRMediaUploader;
