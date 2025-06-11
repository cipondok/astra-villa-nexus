import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Type, Image, Settings } from "lucide-react";
import ThemeToggleSwitch from "@/components/ThemeToggleSwitch";

const WebsiteDesignSettings = () => {
  const [primaryColor, setPrimaryColor] = useState("#007AFF");
  const [secondaryColor, setSecondaryColor] = useState("#FF6B35");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#1A1A1A");
  const [borderRadius, setBorderRadius] = useState([12]);
  const [spacing, setSpacing] = useState([16]);
  const [fontFamily, setFontFamily] = useState("SF Pro Display");
  const [fontSize, setFontSize] = useState([16]);
  const [template, setTemplate] = useState("modern");
  const [darkMode, setDarkMode] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [glassMorphism, setGlassMorphism] = useState(true);

  const colorPresets = [
    { name: "Blue Ocean", primary: "#007AFF", secondary: "#FF6B35" },
    { name: "Purple Sunset", primary: "#8B5CF6", secondary: "#F59E0B" },
    { name: "Green Forest", primary: "#10B981", secondary: "#EF4444" },
    { name: "Rose Gold", primary: "#F43F5E", secondary: "#F59E0B" },
    { name: "Dark Professional", primary: "#1F2937", secondary: "#3B82F6" }
  ];

  const templates = [
    { id: "modern", name: "Modern Glass", preview: "🏢" },
    { id: "classic", name: "Classic Professional", preview: "🏛️" },
    { id: "minimal", name: "Minimal Clean", preview: "⚪" },
    { id: "vibrant", name: "Vibrant Creative", preview: "🌈" },
    { id: "dark", name: "Dark Elegant", preview: "🌑" }
  ];

  const fontOptions = [
    "SF Pro Display",
    "Inter",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins"
  ];

  const handleSaveSettings = () => {
    const settings = {
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        background: backgroundColor,
        text: textColor
      },
      typography: {
        fontFamily,
        fontSize: fontSize[0]
      },
      layout: {
        borderRadius: borderRadius[0],
        spacing: spacing[0]
      },
      theme: {
        template,
        darkMode,
        animations,
        glassMorphism
      }
    };

    console.log("Saving design settings:", settings);
    // Here you would save to your backend/database
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 glass-ios rounded-2xl border border-border/30">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Website Design Settings</h2>
          <p className="text-muted-foreground">Customize your website's appearance and theme</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggleSwitch language="en" />
          <Button onClick={handleSaveSettings} className="btn-primary-ios">
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="glass-ios border border-border/30">
          <TabsTrigger value="colors" className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 text-muted-foreground data-[state=active]:text-foreground">
            <Image className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="card-ios">
              <CardHeader>
                <CardTitle className="text-foreground">Color Palette</CardTitle>
                <CardDescription className="text-muted-foreground">Choose your brand colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded glass-ios"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#007AFF"
                      className="glass-ios text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#FF6B35"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Background Color</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-ios">
              <CardHeader>
                <CardTitle className="text-foreground">Color Presets</CardTitle>
                <CardDescription className="text-muted-foreground">Quick color combinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="justify-start h-12 btn-secondary-ios text-foreground"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setSecondaryColor(preset.secondary);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <span>{preset.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
              <CardDescription>Customize fonts and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Font Family</label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Base Font Size: {fontSize[0]}px</label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={24}
                  min={12}
                  step={1}
                />
              </div>

              <div className="p-4 border rounded-lg" style={{ fontFamily }}>
                <h3 className="text-xl font-bold mb-2">Preview Text</h3>
                <p className="text-muted-foreground">
                  This is how your website text will look with the selected typography settings.
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
              <CardDescription>Adjust spacing and visual elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Border Radius: {borderRadius[0]}px</label>
                <Slider
                  value={borderRadius}
                  onValueChange={setBorderRadius}
                  max={24}
                  min={0}
                  step={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Base Spacing: {spacing[0]}px</label>
                <Slider
                  value={spacing}
                  onValueChange={setSpacing}
                  max={32}
                  min={8}
                  step={2}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Dark Mode</label>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enable Animations</label>
                  <Switch checked={animations} onCheckedChange={setAnimations} />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Glass Morphism Effect</label>
                  <Switch checked={glassMorphism} onCheckedChange={setGlassMorphism} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Website Templates</CardTitle>
              <CardDescription>Choose a pre-designed template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((temp) => (
                  <Button
                    key={temp.id}
                    variant={template === temp.id ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center"
                    onClick={() => setTemplate(temp.id)}
                  >
                    <div className="text-2xl mb-2">{temp.preview}</div>
                    <span className="text-sm">{temp.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteDesignSettings;
