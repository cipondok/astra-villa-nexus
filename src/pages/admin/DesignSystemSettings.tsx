import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDesignSystem } from "@/stores/designSystemStore";
import { toast } from "@/hooks/use-toast";
import { Palette, Type, Layout, Bell, Square, Zap, RotateCcw } from "lucide-react";

const DesignSystemSettings = () => {
  const { config, updateConfig, resetConfig } = useDesignSystem();
  const [activeTab, setActiveTab] = useState("typography");

  const handleSave = () => {
    toast.success({
      title: "Settings Saved",
      description: "Design system settings have been updated successfully.",
    });
  };

  const handleReset = () => {
    resetConfig();
    toast.info({
      title: "Settings Reset",
      description: "Design system has been reset to default values.",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Design System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure global styles, components, and UI behavior
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="spacing">
            <Layout className="h-4 w-4 mr-2" />
            Spacing
          </TabsTrigger>
          <TabsTrigger value="borders">
            <Square className="h-4 w-4 mr-2" />
            Borders
          </TabsTrigger>
          <TabsTrigger value="toasts">
            <Bell className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="modals">
            <Palette className="h-4 w-4 mr-2" />
            Popups
          </TabsTrigger>
          <TabsTrigger value="animations">
            <Zap className="h-4 w-4 mr-2" />
            Animations
          </TabsTrigger>
        </TabsList>

        {/* Typography Settings */}
        <TabsContent value="typography" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Font Families</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="heading-font">Heading Font</Label>
                <Input
                  id="heading-font"
                  value={config.fontFamily.heading}
                  onChange={(e) =>
                    updateConfig({
                      fontFamily: { ...config.fontFamily, heading: e.target.value },
                    })
                  }
                  placeholder="Playfair Display, serif"
                />
              </div>
              <div>
                <Label htmlFor="body-font">Body Font</Label>
                <Input
                  id="body-font"
                  value={config.fontFamily.body}
                  onChange={(e) =>
                    updateConfig({
                      fontFamily: { ...config.fontFamily, body: e.target.value },
                    })
                  }
                  placeholder="Inter, sans-serif"
                />
              </div>
              <div>
                <Label htmlFor="mono-font">Monospace Font</Label>
                <Input
                  id="mono-font"
                  value={config.fontFamily.mono}
                  onChange={(e) =>
                    updateConfig({
                      fontFamily: { ...config.fontFamily, mono: e.target.value },
                    })
                  }
                  placeholder="SF Mono, Consolas, monospace"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Font Sizes</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(config.fontSize).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={`font-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`font-${key}`}
                    value={value}
                    onChange={(e) =>
                      updateConfig({
                        fontSize: { ...config.fontSize, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Spacing Settings */}
        <TabsContent value="spacing" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
            <div className="space-y-4">
              {Object.entries(config.spacing).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={`spacing-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`spacing-${key}`}
                    value={value}
                    onChange={(e) =>
                      updateConfig({
                        spacing: { ...config.spacing, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Border Settings */}
        <TabsContent value="borders" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Border Radius</h3>
            <div className="space-y-4">
              {Object.entries(config.borderRadius).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={`radius-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`radius-${key}`}
                    value={value}
                    onChange={(e) =>
                      updateConfig({
                        borderRadius: { ...config.borderRadius, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Shadows</h3>
            <div className="space-y-4">
              {Object.entries(config.shadows).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={`shadow-${key}`}>{key.toUpperCase()}</Label>
                  <Input
                    id={`shadow-${key}`}
                    value={value}
                    onChange={(e) =>
                      updateConfig({
                        shadows: { ...config.shadows, [key]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Toast/Message Settings */}
        <TabsContent value="toasts" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Toast Notifications</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="toast-position">Position</Label>
                <Select
                  value={config.toastSettings.position}
                  onValueChange={(value: any) =>
                    updateConfig({
                      toastSettings: { ...config.toastSettings, position: value },
                    })
                  }
                >
                  <SelectTrigger id="toast-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-center">Top Center</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-center">Bottom Center</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="toast-duration">Duration (ms)</Label>
                <Input
                  id="toast-duration"
                  type="number"
                  value={config.toastSettings.duration}
                  onChange={(e) =>
                    updateConfig({
                      toastSettings: {
                        ...config.toastSettings,
                        duration: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="toast-max">Max Visible Toasts</Label>
                <Input
                  id="toast-max"
                  type="number"
                  value={config.toastSettings.maxVisible}
                  onChange={(e) =>
                    updateConfig({
                      toastSettings: {
                        ...config.toastSettings,
                        maxVisible: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="toast-progress">Show Progress Bar</Label>
                <Switch
                  id="toast-progress"
                  checked={config.toastSettings.showProgress}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      toastSettings: { ...config.toastSettings, showProgress: checked },
                    })
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() =>
                  toast.success({
                    title: "Success Message",
                    description: "This is a success notification.",
                  })
                }
              >
                Test Success Toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.error({
                    title: "Error Message",
                    description: "This is an error notification.",
                  })
                }
              >
                Test Error Toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.warning({
                    title: "Warning Message",
                    description: "This is a warning notification.",
                  })
                }
              >
                Test Warning Toast
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast.info({
                    title: "Info Message",
                    description: "This is an info notification.",
                  })
                }
              >
                Test Info Toast
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Modal/Popup Settings */}
        <TabsContent value="modals" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Popup & Modal Behavior</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="modal-animation">Animation Style</Label>
                <Select
                  value={config.modalSettings.animation}
                  onValueChange={(value: any) =>
                    updateConfig({
                      modalSettings: { ...config.modalSettings, animation: value },
                    })
                  }
                >
                  <SelectTrigger id="modal-animation">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="scale">Scale</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="modal-backdrop">Backdrop Blur</Label>
                <Switch
                  id="modal-backdrop"
                  checked={config.modalSettings.backdropBlur}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      modalSettings: { ...config.modalSettings, backdropBlur: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="modal-outside">Close on Outside Click</Label>
                <Switch
                  id="modal-outside"
                  checked={config.modalSettings.closeOnOutsideClick}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      modalSettings: {
                        ...config.modalSettings,
                        closeOnOutsideClick: checked,
                      },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="modal-close">Show Close Button</Label>
                <Switch
                  id="modal-close"
                  checked={config.modalSettings.showCloseButton}
                  onCheckedChange={(checked) =>
                    updateConfig({
                      modalSettings: { ...config.modalSettings, showCloseButton: checked },
                    })
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Animation Settings */}
        <TabsContent value="animations" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Animation Durations</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="anim-fast">Fast (ms)</Label>
                <Input
                  id="anim-fast"
                  value={config.animations.duration.fast}
                  onChange={(e) =>
                    updateConfig({
                      animations: {
                        ...config.animations,
                        duration: { ...config.animations.duration, fast: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="anim-normal">Normal (ms)</Label>
                <Input
                  id="anim-normal"
                  value={config.animations.duration.normal}
                  onChange={(e) =>
                    updateConfig({
                      animations: {
                        ...config.animations,
                        duration: { ...config.animations.duration, normal: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="anim-slow">Slow (ms)</Label>
                <Input
                  id="anim-slow"
                  value={config.animations.duration.slow}
                  onChange={(e) =>
                    updateConfig({
                      animations: {
                        ...config.animations,
                        duration: { ...config.animations.duration, slow: e.target.value },
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="anim-easing">Easing Function</Label>
                <Input
                  id="anim-easing"
                  value={config.animations.easing}
                  onChange={(e) =>
                    updateConfig({
                      animations: { ...config.animations, easing: e.target.value },
                    })
                  }
                  placeholder="cubic-bezier(0.4, 0, 0.2, 1)"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignSystemSettings;
