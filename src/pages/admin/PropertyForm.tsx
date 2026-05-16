import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/slugify";
import { ArrowLeft, Upload, X } from "lucide-react";

type FormState = {
  title: string;
  slug: string;
  description: string;
  city: string;
  address: string;
  price_idr: number;
  listing_type: "sale" | "rent";
  bedrooms: number;
  bathrooms: number;
  land_sqm: number;
  building_sqm: number;
  status: "draft" | "published" | "sold";
  featured: boolean;
  cover_image: string | null;
  images: string[];
};

const empty: FormState = {
  title: "", slug: "", description: "", city: "", address: "",
  price_idr: 0, listing_type: "sale", bedrooms: 0, bathrooms: 0,
  land_sqm: 0, building_sqm: 0, status: "draft", featured: false,
  cover_image: null, images: [],
};

export default function AdminPropertyForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: existing } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) setForm(existing as any);
  }, [existing]);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitleBlur = () => {
    if (!form.slug && form.title) update("slug", slugify(form.title));
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const path = `${crypto.randomUUID()}.${file.name.split(".").pop() ?? "jpg"}`;
        const { error } = await supabase.storage.from("property-images").upload(path, file, {
          cacheControl: "31536000", contentType: file.type,
        });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("property-images").getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }
      setForm((f) => ({
        ...f,
        images: [...f.images, ...uploaded],
        cover_image: f.cover_image ?? uploaded[0] ?? null,
      }));
      toast({ title: `${uploaded.length} image(s) uploaded` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((i) => i !== url),
      cover_image: f.cover_image === url ? f.images.find((i) => i !== url) ?? null : f.cover_image,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = form.slug || slugify(form.title);
      const payload = { ...form, slug };
      const { error } = isEdit
        ? await supabase.from("properties").update(payload).eq("id", id!)
        : await supabase.from("properties").insert(payload);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      toast({ title: isEdit ? "Property updated" : "Property created" });
      navigate("/admin");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/admin"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
      </Button>
      <h1 className="font-serif text-3xl font-semibold mb-6">{isEdit ? "Edit property" : "New property"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" required value={form.title} onChange={(e) => update("title", e.target.value)} onBlur={handleTitleBlur} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" required value={form.slug} onChange={(e) => update("slug", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={6} value={form.description} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input id="city" required value={form.city} onChange={(e) => update("city", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="price">Price (IDR)</Label>
            <Input id="price" type="number" min={0} value={form.price_idr} onChange={(e) => update("price_idr", Number(e.target.value))} />
          </div>
          <div>
            <Label>Listing type</Label>
            <Select value={form.listing_type} onValueChange={(v: any) => update("listing_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For sale</SelectItem>
                <SelectItem value="rent">For rent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" type="number" min={0} value={form.bedrooms} onChange={(e) => update("bedrooms", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" type="number" min={0} value={form.bathrooms} onChange={(e) => update("bathrooms", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="land">Land area (m²)</Label>
            <Input id="land" type="number" min={0} value={form.land_sqm} onChange={(e) => update("land_sqm", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="building">Building area (m²)</Label>
            <Input id="building" type="number" min={0} value={form.building_sqm} onChange={(e) => update("building_sqm", Number(e.target.value))} />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: any) => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-7">
            <Switch id="featured" checked={form.featured} onCheckedChange={(v) => update("featured", v)} />
            <Label htmlFor="featured">Featured on homepage</Label>
          </div>
        </div>

        {/* Images */}
        <div>
          <Label>Images</Label>
          <div className="mt-2 border border-dashed border-border rounded-xl p-4">
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <label htmlFor="images" className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload images"}
            </label>
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                {form.images.map((url) => (
                  <div key={url} className={`relative aspect-square rounded-lg overflow-hidden border-2 ${form.cover_image === url ? "border-primary" : "border-border"}`}>
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/90 flex items-center justify-center"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => update("cover_image", url)}
                      className="absolute bottom-1 left-1 right-1 text-[10px] py-1 rounded-md bg-background/90"
                    >
                      {form.cover_image === url ? "Cover" : "Set cover"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create property"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
