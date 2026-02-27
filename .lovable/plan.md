

## Next: File Upload Support for 3D/VR Media Assets

Currently, the property form only accepts **URLs** for VR/3D content. The next step is to add **direct file upload** support using Supabase Storage so owners can upload their media directly.

### What will be built

1. **Supabase Storage bucket** `vr-media` for 360 images, GLB/GLTF models, drone videos, and AI staging images with appropriate size limits and MIME types

2. **`VRMediaUploader` component** — a reusable upload widget with:
   - Drag-and-drop zone with file type detection
   - Four upload sections: 360 Panoramas (JPG/PNG, multi-file), GLB/GLTF Models, Drone Videos (MP4/WebM), AI Staging Images
   - Upload progress indicator using `browser-image-compression` for images
   - Preview thumbnails for uploaded files
   - Delete capability for uploaded files

3. **Integration into `RoleBasedPropertyForm`** — replace the plain URL inputs in the "Teknologi & 3D/VR Marketplace" section with a combined approach: upload OR paste URL, with uploads auto-populating the URL fields

4. **RLS policies** on the `vr-media` bucket:
   - Authenticated users can upload to their own folder (`user_id/`)
   - Public read access for serving media to all viewers

### Technical details

**Storage bucket migration:**
```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('vr-media', 'vr-media', true, 524288000, -- 500MB for videos
  ARRAY['image/jpeg','image/png','image/webp','model/gltf-binary','model/gltf+json',
        'application/octet-stream','video/mp4','video/webm','video/quicktime']);
```

**File organization:** `vr-media/{user_id}/{property_id}/{type}/{filename}`
- Types: `panoramas/`, `models/`, `drone-videos/`, `staging/`

**New component:** `src/components/property/VRMediaUploader.tsx`
- Uses `supabase.storage.from('vr-media').upload()` 
- Returns public URLs via `getPublicUrl()`
- Emits URLs back to parent form via callback

**Form changes:** `RoleBasedPropertyForm.tsx` — add `VRMediaUploader` above the existing URL inputs with a "or paste URL manually" toggle

### Files to create/modify
- **Create**: `supabase/migrations/..._create_vr_media_bucket.sql`
- **Create**: `src/components/property/VRMediaUploader.tsx`
- **Modify**: `src/components/property/RoleBasedPropertyForm.tsx`

