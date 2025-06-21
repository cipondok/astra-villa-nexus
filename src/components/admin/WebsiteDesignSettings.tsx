
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Type, Image, Settings, Sparkles, Zap, Bot } from "lucide-react";
import ThemeToggleSwitch from "@/components/ThemeToggleSwitch";

const WebsiteDesignSettings = () => {
  const [primaryColor, setPrimaryColor] = useState("#8B5CF6");
  const [secondaryColor, setSecondaryColor] = useState("#06B6D4");
  const [backgroundColor, setBackgroundColor] = useState("#0F172A");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [borderRadius, setBorderRadius] = useState([12]);
  const [spacing, setSpacing] = useState([16]);
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState([16]);
  const [template, setTemplate] = useState("ai-futuristic");
  const [darkMode, setDarkMode] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [glassMorphism, setGlassMorphism] = useState(true);
  const [aiEffects, setAiEffects] = useState(true);

  const colorPresets = [
    { 
      name: "AI Futuristic", 
      primary: "#8B5CF6", 
      secondary: "#06B6D4",
      background: "#0F172A",
      gradient: "from-purple-500 to-blue-500"
    },
    { 
      name: "Cyber Purple", 
      primary: "#A855F7", 
      secondary: "#3B82F6",
      background: "#1E1B4B",
      gradient: "from-purple-600 to-blue-600"
    },
    { 
      name: "Matrix Green", 
      primary: "#10B981", 
      secondary: "#06B6D4",
      background: "#0C1A14",
      gradient: "from-green-500 to-cyan-500"
    },
    { 
      name: "Neural Blue", 
      primary: "#3B82F6", 
      secondary: "#8B5CF6",
      background: "#0F1419",
      gradient: "from-blue-500 to-purple-500"
    },
    { 
      name: "Quantum Pink", 
      primary: "#EC4899", 
      secondary: "#A855F7",
      background: "#1E0F1A",
      gradient: "from-pink-500 to-purple-500"
    }
  ];

  const templates = [
    { 
      id: "ai-futuristic", 
      name: "AI Futuristic", 
      preview: "🤖",
      description: "Dark theme with purple/cyan gradients and AI effects"
    },
    { 
      id: "cyberpunk", 
      name: "Cyberpunk", 
      preview: "⚡",
      description: "Neon colors with glitch effects and holographic elements"
    },
    { 
      id: "neural-network", 
      name: "Neural Network", 
      preview: "🧠",
      description: "Animated connections with neural network visualizations"
    },
    { 
      id: "quantum", 
      name: "Quantum", 
      preview: "🌌",
      description: "Particle effects with quantum-inspired animations"
    },
    { 
      id: "matrix", 
      name: "Matrix", 
      preview: "💚",
      description: "Green matrix rain with code-like backgrounds"
    },
    { 
      id: "holographic", 
      name: "Holographic", 
      preview: "✨",
      description: "Iridescent colors with hologram-style interfaces"
    }
  ];

  const fontOptions = [
    "Inter",
    "SF Pro Display", 
    "JetBrains Mono",
    "Fira Code",
    "Space Mono",
    "Orbitron",
    "Exo 2",
    "Rajdhani"
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
        glassMorphism,
        aiEffects
      }
    };

    // Apply settings to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
    root.style.setProperty('--background-color', backgroundColor);
    root.style.setProperty('--text-color', textColor);

    console.log("Saving AI design settings:", settings);
    // Save to localStorage for persistence
    localStorage.setItem('astra-design-settings', JSON.stringify(settings));
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
    setBackgroundColor(preset.background);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Website Design Studio
            </h2>
            <p className="text-gray-300">Customize your futuristic AI-themed interface</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggleSwitch language="en" />
          <Button 
            onClick={handleSaveSettings} 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Save AI Theme
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="bg-black/40 backdrop-blur-sm border border-white/10">
          <TabsTrigger value="colors" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
            <Palette className="h-4 w-4" />
            AI Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2 text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600">
            <Image className="h-4 w-4" />
            AI Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  AI Color Palette
                </CardTitle>
                <CardDescription className="text-gray-300">Configure your futuristic color scheme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Primary Purple</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border border-purple-500/30 rounded bg-black/40"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#8B5CF6"
                      className="bg-black/40 border-purple-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Secondary Cyan</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border border-cyan-500/30 rounded bg-black/40"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#06B6D4"
                      className="bg-black/40 border-cyan-500/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Background</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-16 h-10 p-1 border border-white/20 rounded bg-black/40"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#0F172A"
                      className="bg-black/40 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                  <p className="text-sm text-white">Preview Gradient</p>
                  <div 
                    className="w-full h-8 rounded mt-2"
                    style={{
                      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">AI Color Presets</CardTitle>
                <CardDescription className="text-gray-300">Pre-configured AI themes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      className="justify-start h-16 bg-black/20 border-white/10 hover:bg-white/5 text-white"
                      onClick={() => applyPreset(preset)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded-full border border-white/20" 
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border border-white/20" 
                            style={{ backgroundColor: preset.secondary }}
                          />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-xs text-gray-400">{preset.gradient}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">AI Typography</CardTitle>
              <CardDescription className="text-gray-300">Futuristic fonts and text styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Font Family</label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="bg-black/40 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-white/20">
                    {fontOptions.map((font) => (
                      <SelectItem key={font} value={font} className="text-white hover:bg-white/10" style={{ fontFamily: font }}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Base Font Size: {fontSize[0]}px</label>
                <Slider
                  value={fontSize}
                  onValueChange={setFontSize}
                  max={24}
                  min={12}
                  step={1}
                  className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-cyan-500"
                />
              </div>

              <div className="p-6 border rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border-purple-500/30" style={{ fontFamily }}>
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Preview Text
                </h3>
                <p className="text-gray-300">
                  This is how your futuristic AI interface will look with the selected typography settings.
                  Experience the future of real estate technology.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">AI Layout Settings</CardTitle>
              <CardDescription className="text-gray-300">Configure spatial and visual elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Border Radius: {borderRadius[0]}px</label>
                <Slider
                  value={borderRadius}
                  onValueChange={setBorderRadius}
                  max={24}
                  min={0}
                  step={2}
                  className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Base Spacing: {spacing[0]}px</label>
                <Slider
                  value={spacing}
                  onValueChange={setSpacing}
                  max={32}
                  min={8}
                  step={2}
                  className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-cyan-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                  <label className="text-sm font-medium text-white">Dark Mode</label>
                  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                  <label className="text-sm font-medium text-white">AI Animations</label>
                  <Switch checked={animations} onCheckedChange={setAnimations} />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                  <label className="text-sm font-medium text-white">Glass Morphism</label>
                  <Switch checked={glassMorphism} onCheckedChange={setGlassMorphism} />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/10">
                  <label className="text-sm font-medium text-white">Neural Effects</label>
                  <Switch checked={aiEffects} onCheckedChange={setAiEffects} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="bg-black/20 backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">AI Website Templates</CardTitle>
              <CardDescription className="text-gray-300">Choose your futuristic design theme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((temp) => (
                  <Button
                    key={temp.id}
                    variant={template === temp.id ? "default" : "outline"}
                    className={`h-32 flex flex-col items-center justify-center p-4 ${
                      template === temp.id 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-black/20 border-white/10 text-white hover:bg-white/5'
                    }`}
                    onClick={() => setTemplate(temp.id)}
                  >
                    <div className="text-3xl mb-2">{temp.preview}</div>
                    <span className="text-sm font-medium">{temp.name}</span>
                    <span className="text-xs text-gray-400 mt-1 text-center">{temp.description}</span>
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
