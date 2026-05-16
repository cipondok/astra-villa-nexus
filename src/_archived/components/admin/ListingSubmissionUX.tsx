import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Upload, Image, MapPin, DollarSign, CheckCircle, Star,
  Eye, Sparkles, FileText, Tag, ArrowUpRight, BarChart3, Zap
} from "lucide-react";

const amenities = ["Swimming Pool", "Gym", "Garden", "Parking", "Security", "Sea View", "Rooftop", "Smart Home", "AC", "Furnished"];

const qualityFactors = [
  { label: "Photos", score: 80, tip: "Add 2 more photos for higher visibility" },
  { label: "Description", score: 60, tip: "Add 50+ more words to improve SEO ranking" },
  { label: "Pricing", score: 90, tip: "Price is competitive for this district" },
  { label: "Amenities", score: 40, tip: "Select at least 5 amenities for better matching" },
  { label: "Location Detail", score: 70, tip: "Add nearby landmarks for better discoverability" },
];

const overallQuality = Math.round(qualityFactors.reduce((s, f) => s + f.score, 0) / qualityFactors.length);

const submissionStats = {
  totalListings: 360, avgQuality: 68, avgPhotos: 6.2,
  publishRate: 85, premiumRate: 22, avgTimeToPublish: "4m 30s",
};

const ListingSubmissionUX: React.FC = () => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Parking", "AC"]);
  const [title, setTitle] = useState("Modern 3BR Villa with Pool — Seminyak");
  const [price, setPrice] = useState("4200000000");

  const toggleAmenity = (a: string) => setSelectedAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Listing Submission UX
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Optimized property listing upload experience</p>
        </div>
        <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
          {submissionStats.publishRate}% Publish Rate
        </Badge>
      </div>

      {/* Submission Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Total Listings", value: submissionStats.totalListings },
          { label: "Avg Quality", value: `${submissionStats.avgQuality}/100` },
          { label: "Avg Photos", value: submissionStats.avgPhotos },
          { label: "Publish Rate", value: `${submissionStats.publishRate}%` },
          { label: "Premium", value: `${submissionStats.premiumRate}%` },
          { label: "Avg Time", value: submissionStats.avgTimeToPublish },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-2 text-center">
              <div className="text-sm font-bold text-foreground">{m.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Form Preview */}
        <div className="md:col-span-2 space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase">Title</span>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Type</span>
                  <div className="flex gap-1 mt-1">
                    {["Villa", "Apartment", "House"].map(t => (
                      <Badge key={t} variant={t === "Villa" ? "default" : "secondary"} className="text-[10px] cursor-pointer">{t}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase">Location</span>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">Seminyak, Bali</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase">Price</span>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                  <Input value={Number(price).toLocaleString("id-ID")} onChange={e => setPrice(e.target.value.replace(/\D/g, ""))} className="pl-8" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="h-3 w-3 text-chart-1" />
                  <span className="text-[10px] text-chart-1">Suggested range: Rp 3.8B – 4.5B for this area</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" /> Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-foreground font-medium">Drag & drop photos here</p>
                <p className="text-[10px] text-muted-foreground mt-1">Upload 5–15 high-quality photos for best results</p>
              </div>
              <div className="flex gap-2 mt-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border/50 flex items-center justify-center cursor-pointer hover:border-primary/30">
                  <span className="text-xs text-muted-foreground">+</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map(a => (
                  <Badge key={a} variant={selectedAmenities.includes(a) ? "default" : "secondary"}
                    onClick={() => toggleAmenity(a)} className="cursor-pointer text-[10px]">{a}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality & Preview Sidebar */}
        <div className="space-y-3">
          {/* Quality Score */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-chart-1" /> Listing Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-primary">{overallQuality}</div>
                <div className="text-[10px] text-muted-foreground">out of 100</div>
              </div>
              {qualityFactors.map((f, i) => (
                <motion.div key={f.label} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-foreground">{f.label}</span>
                    <span className="text-[10px] font-mono text-foreground">{f.score}%</span>
                  </div>
                  <Progress value={f.score} className="h-1 mb-1" />
                  <p className="text-[9px] text-muted-foreground">{f.tip}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" /> Listing Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Card className="border-border/30">
                <div className="h-24 bg-muted rounded-t-lg flex items-center justify-center">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardContent className="p-2.5">
                  <div className="text-xs font-bold text-foreground truncate">{title || "Property Title"}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-2.5 w-2.5" /> Seminyak, Bali
                  </div>
                  <div className="text-xs font-bold text-primary mt-1">
                    Rp {price ? Number(price).toLocaleString("id-ID") : "—"}
                  </div>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-[8px]">3 BR</Badge>
                    <Badge variant="secondary" className="text-[8px]">Pool</Badge>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Boost Prompt */}
          <Card className="border-chart-1/20 bg-chart-1/5">
            <CardContent className="p-3 text-center">
              <Zap className="h-5 w-5 mx-auto text-chart-1 mb-1" />
              <div className="text-xs font-bold text-foreground">Boost Visibility</div>
              <p className="text-[10px] text-muted-foreground mt-1">Premium listings get 3.5x more inquiries</p>
              <Button size="sm" className="mt-2 text-xs h-7 w-full">Upgrade to Premium</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListingSubmissionUX;
