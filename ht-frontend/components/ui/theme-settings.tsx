"use client"

import * as React from "react"
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Contrast, 
  Zap, 
  ZapOff, 
  RotateCcw,
  Download,
  Upload,
  Settings
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useEnhancedTheme, exportThemeConfig, importThemeConfig } from "@/lib/theme"

export function ThemeSettings() {
  const { theme, setTheme } = useTheme()
  const {
    themeConfig,
    toggleHighContrast,
    toggleReducedMotion,
    isHighContrast,
    isReducedMotion,
    applyTheme,
    resetTheme,
  } = useEnhancedTheme()

  const [borderRadius, setBorderRadius] = React.useState(themeConfig.borderRadius)

  const handleBorderRadiusChange = (value: number[]) => {
    const newRadius = value[0]
    setBorderRadius(newRadius)
    applyTheme({ borderRadius: newRadius })
  }

  const handleExportTheme = () => {
    const config = exportThemeConfig(themeConfig)
    const blob = new Blob([config], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'health-tracker-theme.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const config = importThemeConfig(content)
      if (config) {
        applyTheme(config)
        setBorderRadius(config.borderRadius)
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Theme Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Settings
          </DialogTitle>
          <DialogDescription>
            Customize your HealthTracker experience with theme and accessibility options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Mode</CardTitle>
              <CardDescription>
                Choose your preferred color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  onClick={() => setTheme("light")}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <Sun className="h-6 w-6" />
                  <span>Light</span>
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  onClick={() => setTheme("dark")}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <Moon className="h-6 w-6" />
                  <span>Dark</span>
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  onClick={() => setTheme("system")}
                  className="flex flex-col gap-2 h-auto p-4"
                >
                  <Monitor className="h-6 w-6" />
                  <span>System</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accessibility</CardTitle>
              <CardDescription>
                Adjust settings for better accessibility and comfort
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Contrast className="h-5 w-5" />
                  <div>
                    <Label htmlFor="high-contrast" className="text-sm font-medium">
                      High Contrast
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                </div>
                <Switch
                  id="high-contrast"
                  checked={isHighContrast}
                  onCheckedChange={toggleHighContrast}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isReducedMotion ? (
                    <ZapOff className="h-5 w-5" />
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                  <div>
                    <Label htmlFor="reduced-motion" className="text-sm font-medium">
                      Reduce Motion
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={isReducedMotion}
                  onCheckedChange={toggleReducedMotion}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customization</CardTitle>
              <CardDescription>
                Fine-tune the appearance of interface elements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="border-radius" className="text-sm font-medium">
                  Border Radius: {borderRadius}px
                </Label>
                <Slider
                  id="border-radius"
                  min={0}
                  max={20}
                  step={1}
                  value={[borderRadius]}
                  onValueChange={handleBorderRadiusChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sharp (0px)</span>
                  <span>Rounded (20px)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Theme Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  Mode: {theme || 'system'}
                </Badge>
                {isHighContrast && (
                  <Badge variant="outline">High Contrast</Badge>
                )}
                {isReducedMotion && (
                  <Badge variant="outline">Reduced Motion</Badge>
                )}
                <Badge variant="outline">
                  Radius: {borderRadius}px
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Theme Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Management</CardTitle>
              <CardDescription>
                Save, load, or reset your theme configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTheme}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Theme
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('theme-import')?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import Theme
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetTheme}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </Button>
              </div>
              
              <input
                id="theme-import"
                type="file"
                accept=".json"
                onChange={handleImportTheme}
                className="hidden"
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}