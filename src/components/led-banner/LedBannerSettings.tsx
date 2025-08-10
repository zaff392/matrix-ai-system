'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Settings, Save, Eye, EyeOff } from 'lucide-react'

interface LedBannerConfig {
  enabled: boolean
  text: string
  color: string
  fontFamily: string
  style: 'fixed' | 'blinking'
  speed: number
}

interface LedBannerSettingsProps {
  config: LedBannerConfig
  onConfigChange: (config: LedBannerConfig) => void
  onSave?: (config: LedBannerConfig) => void
}

const FONT_OPTIONS = [
  { value: 'monospace', label: 'Monospace (Matrix)' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' }
]

const COLOR_OPTIONS = [
  { value: '#00ff00', label: 'Vert Matrix', color: '#00ff00' },
  { value: '#ff0000', label: 'Rouge', color: '#ff0000' },
  { value: '#0000ff', label: 'Bleu', color: '#0000ff' },
  { value: '#ffff00', label: 'Jaune', color: '#ffff00' },
  { value: '#ff00ff', label: 'Magenta', color: '#ff00ff' },
  { value: '#00ffff', label: 'Cyan', color: '#00ffff' },
  { value: '#ffffff', label: 'Blanc', color: '#ffffff' },
  { value: '#ffa500', label: 'Orange', color: '#ffa500' }
]

const PRESET_MESSAGES = [
  "BIENVENUE DANS LA MATRIX",
  "SYSTEME IA ACTIF",
  "CONNEXION ETABLIE",
  "AGENTS EN VEILLE",
  "MATRIX ONLINE",
  "ENTREZ VOTRE MESSAGE"
]

export default function LedBannerSettings({ config, onConfigChange, onSave }: LedBannerSettingsProps) {
  const [localConfig, setLocalConfig] = useState<LedBannerConfig>(config)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const changed = JSON.stringify(localConfig) !== JSON.stringify(config)
    setHasChanges(changed)
  }, [localConfig, config])

  const updateConfig = (updates: Partial<LedBannerConfig>) => {
    const newConfig = { ...localConfig, ...updates }
    setLocalConfig(newConfig)
    onConfigChange(newConfig)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(localConfig)
    }
    setHasChanges(false)
  }

  const handlePresetMessage = (message: string) => {
    updateConfig({ text: message })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto border-green-500/30 bg-black/80 backdrop-blur-sm">
      <CardHeader className="border-b border-green-500/30">
        <CardTitle className="flex items-center gap-2 text-green-400">
          <Settings className="w-5 h-5" />
          Paramètres de la Bannière LED
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        {/* Activation/Désactivation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {localConfig.enabled ? (
              <Eye className="w-4 h-4 text-green-500" />
            ) : (
              <EyeOff className="w-4 h-4 text-red-500" />
            )}
            <Label htmlFor="banner-enabled" className="text-green-300">
              Bannière LED {localConfig.enabled ? 'activée' : 'désactivée'}
            </Label>
          </div>
          <Switch
            id="banner-enabled"
            checked={localConfig.enabled}
            onCheckedChange={(checked) => updateConfig({ enabled: checked })}
          />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <Label className="text-green-300">Message défilant</Label>
          <Input
            value={localConfig.text}
            onChange={(e) => updateConfig({ text: e.target.value })}
            placeholder="Entrez votre message..."
            className="bg-black/50 border-green-500/50 text-green-300 placeholder:text-green-600"
            maxLength={100}
          />
          
          {/* Messages prédéfinis */}
          <div className="flex flex-wrap gap-2">
            {PRESET_MESSAGES.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetMessage(message)}
                className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/20"
              >
                {message}
              </Button>
            ))}
          </div>
        </div>

        {/* Couleur */}
        <div className="space-y-3">
          <Label className="text-green-300">Couleur du texte</Label>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.value}
                onClick={() => updateConfig({ color: color.value })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  localConfig.color === color.value
                    ? 'border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)]'
                    : 'border-green-500/30 hover:border-green-500/60'
                }`}
                style={{ backgroundColor: color.color + '20' }}
              >
                <div 
                  className="w-full h-4 rounded mb-1"
                  style={{ backgroundColor: color.color }}
                />
                <span className="text-xs text-green-300">{color.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Police */}
        <div className="space-y-3">
          <Label className="text-green-300">Police de caractères</Label>
          <Select value={localConfig.fontFamily} onValueChange={(value) => updateConfig({ fontFamily: value })}>
            <SelectTrigger className="bg-black/50 border-green-500/50 text-green-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-green-500/50">
              {FONT_OPTIONS.map((font) => (
                <SelectItem
                  key={font.value}
                  value={font.value}
                  className="text-green-300 hover:bg-green-500/20"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Style */}
        <div className="space-y-3">
          <Label className="text-green-300">Style d'affichage</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateConfig({ style: 'fixed' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                localConfig.style === 'fixed'
                  ? 'border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)] bg-green-500/10'
                  : 'border-green-500/30 hover:border-green-500/60 bg-black/50'
              }`}
            >
              <div className="text-green-300 font-medium mb-2">Fixe</div>
              <div className="text-xs text-green-500">Le texte reste toujours visible</div>
            </button>
            
            <button
              onClick={() => updateConfig({ style: 'blinking' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                localConfig.style === 'blinking'
                  ? 'border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)] bg-green-500/10'
                  : 'border-green-500/30 hover:border-green-500/60 bg-black/50'
              }`}
            >
              <div className="text-green-300 font-medium mb-2">Clignotant</div>
              <div className="text-xs text-green-500">Le texte clignote</div>
            </button>
          </div>
        </div>

        {/* Vitesse */}
        <div className="space-y-3">
          <Label className="text-green-300">
            Vitesse de défilement: {localConfig.speed}px/frame
          </Label>
          <Slider
            value={[localConfig.speed]}
            onValueChange={([value]) => updateConfig({ speed: value })}
            min={0.5}
            max={5}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-green-500">
            <span>Lent</span>
            <span>Rapide</span>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        {hasChanges && (
          <Button
            onClick={handleSave}
            className="w-full bg-green-600 hover:bg-green-700 text-white border-green-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder les paramètres
          </Button>
        )}

        {/* Aperçu */}
        <div className="space-y-3">
          <Label className="text-green-300">Aperçu</Label>
          <div className="p-4 bg-black/50 rounded-lg border border-green-500/30">
            <div className="text-xs text-green-500 mb-2">Aperçu en temps réel:</div>
            <div className="h-8 relative overflow-hidden bg-black border border-green-500 rounded">
              <div 
                className="absolute whitespace-nowrap font-mono font-bold text-lg drop-shadow-[0_0_8px_currentColor]"
                style={{ 
                  color: localConfig.color,
                  fontFamily: localConfig.fontFamily,
                  opacity: localConfig.style === 'blinking' ? 0.7 : 1
                }}
              >
                {localConfig.text || "Votre message apparaîtra ici"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}