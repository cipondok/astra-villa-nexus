import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Search } from "lucide-react";
import SEOSettingsHub from "@/components/admin/settings/SEOSettingsHub";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import SitemapRegenerator from "@/components/admin/settings/SitemapRegenerator";
import SitemapSchedule from "@/components/admin/settings/SitemapSchedule";

export default function SEOSettings() {
  const { settings, loading, saveSettings, handleInputChange } = useSystemSettings();

  return (
    <div className="space-y-4 p-4">
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Search className="h-4 w-4 text-primary" />
            SEO Settings
          </CardTitle>
          <Button
            size="sm"
            onClick={saveSettings}
            disabled={loading}
            className="h-8 gap-1.5 text-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-xs text-muted-foreground">
            Manage default SEO fields including site title, meta description, canonical URL,
            Open Graph tags, schema markup, analytics, and verification codes.
          </p>
        </CardContent>
      </Card>

      <SEOSettingsHub
        settings={settings}
        loading={loading}
        onInputChange={handleInputChange}
        onSave={saveSettings}
      />

      <SitemapSchedule />
      <SitemapRegenerator />
    </div>
  );
}
