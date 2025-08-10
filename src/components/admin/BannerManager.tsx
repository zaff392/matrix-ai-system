'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Settings, 
  Save, 
  Eye, 
  EyeOff, 
  Upload, 
  Download, 
  Trash2, 
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Type,
  Palette,
  Zap,
  Play,
  Pause
} from 'lucide-react'
import LedBanner from '@/components/led-banner/LedBanner'
import { LedBannerStorage, LedBannerConfig } from '@/lib/led-banner-storage'

interface BannerMessage {
  id: string
  text: string
  color: string
  active: boolean
  createdAt: Date
}

interface BannerImage {
  id: string
  name: string
  url: string
  active: boolean
  createdAt: Date
}

interface ExtendedBannerConfig extends LedBannerConfig {
  messages: BannerMessage[]
  images: BannerImage[]
  showImages: boolean
  imageInterval: number
  randomOrder: boolean
}

const DEFAULT_EXTENDED_CONFIG: ExtendedBannerConfig = {
  enabled: true,
  text: 'BIENVENUE DANS LA MATRIX - SYSTEME IA ACTIF',
  color: '#00ff00',
  fontFamily: 'monospace',
  style: 'fixed',
  speed: 2,
  messages: [],
  images: [],
  showImages: false,
  imageInterval: 5000,
  randomOrder: false
}

const COLOR_OPTIONS = [
  { value: '#00ff00', label: 'Vert Matrix', color: '#00ff00' },
  { value: '#ff0000', label: 'Rouge', color: '#ff0000' },
  { value: '#0000ff', label: 'Bleu', color: '#0000ff' },
  { value: '#ffff00', label: 'Jaune', color: '#ffff00' },
  { value: '#ff00ff', label: 'Magenta', color: '#ff00ff' },
  { value: '#00ffff', label: 'Cyan', color: '#00ffff' },
  { value: '#ffffff', label: 'Blanc', color: '#ffffff' },
  { value: '#ffa500', label: 'Orange', color: '#ffa500' },
  { value: '#ff1493', label: 'Rose', color: '#ff1493' },
  { value: '#9400d3', label: 'Violet', color: '#9400d3' }
]

const FONT_OPTIONS = [
  { value: 'monospace', label: 'Monospace (Matrix)' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Impact', label: 'Impact' }
]

const PRESET_MESSAGES = [
  "BIENVENUE DANS LA MATRIX",
  "SYSTEME IA ACTIF",
  "CONNEXION ETABLIE",
  "AGENTS EN VEILLE",
  "MATRIX ONLINE",
  "ENTREZ VOTRE MESSAGE",
  "CHOISISSEZ VOTRE AGENT",
  "IA EN FONCTIONNEMENT",
  "SYSTEME OPERATIONNEL",
  "BIENVENUE VISITEUR"
]

export default function BannerManager() {
  const [config, setConfig] = useState<ExtendedBannerConfig>(DEFAULT_EXTENDED_CONFIG)
  const [hasChanges, setHasChanges] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [newMessage, setNewMessage] = useState('')
  const [newMessageColor, setNewMessageColor] = useState('#00ff00')

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(DEFAULT_EXTENDED_CONFIG)
    setHasChanges(changed)
  }, [config])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && config.messages.length > 0) {
      interval = setInterval(() => {
        setCurrentMessageIndex(prev => {
          if (config.randomOrder) {
            return Math.floor(Math.random() * config.messages.length)
          }
          return (prev + 1) % config.messages.length
        })
      }, config.imageInterval)
    }
    return () => clearInterval(interval)
  }, [isPlaying, config.messages, config.imageInterval, config.randomOrder])

  const loadConfig = () => {
    try {
      const savedConfig = LedBannerStorage.getConfig()
      const extendedConfig: ExtendedBannerConfig = {
        ...DEFAULT_EXTENDED_CONFIG,
        ...savedConfig,
        messages: [],
        images: [],
        showImages: false,
        imageInterval: 5000,
        randomOrder: false
      }
      setConfig(extendedConfig)
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
    }
  }

  const saveConfig = () => {
    try {
      const basicConfig: LedBannerConfig = {
        enabled: config.enabled,
        text: config.text,
        color: config.color,
        fontFamily: config.fontFamily,
        style: config.style,
        speed: config.speed
      }
      LedBannerStorage.saveConfig(basicConfig)
      setHasChanges(false)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error)
    }
  }

  const updateConfig = (updates: Partial<ExtendedBannerConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const addMessage = () => {
    if (!newMessage.trim()) return
    
    const message: BannerMessage = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      color: newMessageColor,
      active: true,
      createdAt: new Date()
    }
    
    updateConfig({
      messages: [...config.messages, message]
    })
    setNewMessage('')
  }

  const deleteMessage = (id: string) => {
    updateConfig({
      messages: config.messages.filter(msg => msg.id !== id)
    })
  }

  const toggleMessageActive = (id: string) => {
    updateConfig({
      messages: config.messages.map(msg => 
        msg.id === id ? { ...msg, active: !msg.active } : msg
      )
    })
  }

  const activateMessage = (id: string) => {
    const message = config.messages.find(msg => msg.id === id)
    if (message) {
      updateConfig({
        text: message.text,
        color: message.color
      })
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const image: BannerImage = {
        id: Date.now().toString(),
        name: file.name,
        url: e.target?.result as string,
        active: true,
        createdAt: new Date()
      }
      
      updateConfig({
        images: [...config.images, image]
      })
    }
    reader.readAsDataURL(file)
  }

  const deleteImage = (id: string) => {
    updateConfig({
      images: config.images.filter(img => img.id !== id)
    })
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'matrix-banner-config.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string)
        setConfig({ ...DEFAULT_EXTENDED_CONFIG, ...importedConfig })
        setHasChanges(true)
      } catch (error) {
        console.error('Erreur lors de l\'importation de la configuration:', error)
      }
    }
    reader.readAsText(file)
  }

  const resetConfig = () => {
    setConfig(DEFAULT_EXTENDED_CONFIG)
    LedBannerStorage.resetConfig()
    setHasChanges(false)
  }

  const activeMessages = config.messages.filter(msg => msg.active)
  const currentText = isPlaying && activeMessages.length > 0 
    ? activeMessages[currentMessageIndex]?.text || config.text
    : config.text

  const currentColor = isPlaying && activeMessages.length > 0 
    ? activeMessages[currentMessageIndex]?.color || config.color
    : config.color

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
        <CardHeader className="border-b border-green-500/30">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Settings className="w-5 h-5" />
              Gestion Complète de la Bannière Matrix
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${
                config.enabled 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {config.enabled ? 'Actif' : 'Inactif'}
              </Badge>
              {hasChanges && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Non sauvegardé
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Aperçu en temps réel */}
      <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
        <CardHeader className="border-b border-green-500/30">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Eye className="w-5 h-5" />
            Aperçu en Temps Réel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant={isPlaying ? "default" : "outline"}
                className={isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                disabled={activeMessages.length === 0}
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Lecture'}
              </Button>
              <div className="text-sm text-green-500">
                {activeMessages.length > 0 ? (
                  <span>{activeMessages.length} message(s) disponible(s)</span>
                ) : (
                  <span>Aucun message dans la playlist</span>
                )}
              </div>
            </div>
            <LedBanner
              text={currentText}
              enabled={config.enabled}
              color={currentColor}
              fontFamily={config.fontFamily}
              style={config.style}
              speed={config.speed}
            />
          </div>
        </CardContent>
      </Card>

      {/* Onglets de configuration */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/60 border border-green-500/30">
          <TabsTrigger value="basic" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <Settings className="w-4 h-4" />
            Basique
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <Type className="w-4 h-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <ImageIcon className="w-4 h-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <Zap className="w-4 h-4" />
            Avancé
          </TabsTrigger>
        </TabsList>

        {/* Onglet Basique */}
        <TabsContent value="basic" className="space-y-6">
          <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
            <CardHeader className="border-b border-green-500/30">
              <CardTitle className="text-green-400">Paramètres de Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Activation */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {config.enabled ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-red-500" />
                  )}
                  <Label className="text-green-300">
                    Bannière {config.enabled ? 'activée' : 'désactivée'}
                  </Label>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => updateConfig({ enabled: checked })}
                />
              </div>

              {/* Message principal */}
              <div className="space-y-3">
                <Label className="text-green-300">Message principal</Label>
                <Input
                  value={config.text}
                  onChange={(e) => updateConfig({ text: e.target.value })}
                  placeholder="Entrez votre message..."
                  className="bg-black/50 border-green-500/50 text-green-300 placeholder:text-green-600"
                  maxLength={200}
                />
                <div className="flex flex-wrap gap-2">
                  {PRESET_MESSAGES.map((message, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => updateConfig({ text: message })}
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
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => updateConfig({ color: color.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        config.color === color.value
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
                <Select value={config.fontFamily} onValueChange={(value) => updateConfig({ fontFamily: value })}>
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

              {/* Style et Vitesse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-green-300">Style d'affichage</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateConfig({ style: 'fixed' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        config.style === 'fixed'
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
                        config.style === 'blinking'
                          ? 'border-green-500 shadow-[0_0_10px_rgba(0,255,0,0.5)] bg-green-500/10'
                          : 'border-green-500/30 hover:border-green-500/60 bg-black/50'
                      }`}
                    >
                      <div className="text-green-300 font-medium mb-2">Clignotant</div>
                      <div className="text-xs text-green-500">Le texte clignote</div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-green-300">
                    Vitesse de défilement: {config.speed}px/frame
                  </Label>
                  <Slider
                    value={[config.speed]}
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Messages */}
        <TabsContent value="messages" className="space-y-6">
          <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
            <CardHeader className="border-b border-green-500/30">
              <CardTitle className="text-green-400">Gestion des Messages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Ajouter un message */}
              <div className="space-y-4">
                <Label className="text-green-300">Ajouter un nouveau message</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Entrez votre message..."
                    className="bg-black/50 border-green-500/50 text-green-300 placeholder:text-green-600"
                  />
                  <Select value={newMessageColor} onValueChange={setNewMessageColor}>
                    <SelectTrigger className="bg-black/50 border-green-500/50 text-green-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-green-500/50">
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem
                          key={color.value}
                          value={color.value}
                          className="text-green-300 hover:bg-green-500/20"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color.color }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={addMessage}
                    disabled={!newMessage.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Liste des messages */}
              <div className="space-y-3">
                <Label className="text-green-300">Messages enregistrés ({config.messages.length})</Label>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {config.messages.map((message) => (
                      <Card key={message.id} className="bg-black/40 border-green-500/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: message.color }}
                              />
                              <span className="text-green-300 font-medium">{message.text}</span>
                              <Badge 
                                className={`${
                                  message.active 
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }`}
                              >
                                {message.active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <div className="text-xs text-green-500">
                              Créé le {message.createdAt.toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => activateMessage(message.id)}
                              variant="outline"
                              size="sm"
                              className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                            >
                              <Type className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => toggleMessageActive(message.id)}
                              variant="outline"
                              size="sm"
                              className={message.active ? "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20" : "border-green-500/50 text-green-400 hover:bg-green-500/20"}
                            >
                              {message.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </Button>
                            <Button
                              onClick={() => deleteMessage(message.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {config.messages.length === 0 && (
                      <div className="text-center text-green-500 py-8">
                        Aucun message enregistré
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Images */}
        <TabsContent value="images" className="space-y-6">
          <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
            <CardHeader className="border-b border-green-500/30">
              <CardTitle className="text-green-400">Gestion des Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Activation des images */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-green-500" />
                  <Label className="text-green-300">
                    Afficher les images dans la bannière
                  </Label>
                </div>
                <Switch
                  checked={config.showImages}
                  onCheckedChange={(checked) => updateConfig({ showImages: checked })}
                />
              </div>

              {/* Upload d'image */}
              <div className="space-y-4">
                <Label className="text-green-300">Ajouter une nouvelle image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      onClick={() => document.getElementById('image-upload')?.click()}
                      variant="outline"
                      className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir une image
                    </Button>
                  </div>
                  <div className="text-sm text-green-500">
                    Formats supportés: JPG, PNG, GIF, WebP<br />
                    Taille maximale: 5MB
                  </div>
                </div>
              </div>

              {/* Liste des images */}
              <div className="space-y-3">
                <Label className="text-green-300">Images téléchargées ({config.images.length})</Label>
                <ScrollArea className="h-96">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.images.map((image) => (
                      <Card key={image.id} className="bg-black/40 border-green-500/20 p-4">
                        <div className="space-y-3">
                          <div className="relative">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-32 object-cover rounded-lg border border-green-500/30"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge 
                                className={`${
                                  image.active 
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }`}
                              >
                                {image.active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-green-300 font-medium truncate">
                              {image.name}
                            </div>
                            <div className="text-xs text-green-500">
                              Téléchargé le {image.createdAt.toLocaleDateString('fr-FR')}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => {
                                  updateConfig({
                                    images: config.images.map(img => 
                                      img.id === image.id 
                                        ? { ...img, active: !img.active }
                                        : img
                                    )
                                  })
                                }}
                                variant="outline"
                                size="sm"
                                className={`flex-1 ${
                                  image.active 
                                    ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20' 
                                    : 'border-green-500/50 text-green-400 hover:bg-green-500/20'
                                }`}
                              >
                                {image.active ? 'Désactiver' : 'Activer'}
                              </Button>
                              <Button
                                onClick={() => deleteImage(image.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {config.images.length === 0 && (
                    <div className="text-center text-green-500 py-8">
                      Aucune image téléchargée
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Paramètres d'affichage des images */}
              {config.images.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-green-300">Paramètres d'affichage</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-green-300">
                        Intervalle de rotation: {config.imageInterval / 1000}s
                      </Label>
                      <Slider
                        value={[config.imageInterval]}
                        onValueChange={([value]) => updateConfig({ imageInterval: value })}
                        min={1000}
                        max={10000}
                        step={1000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-green-500">
                        <span>1s</span>
                        <span>10s</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-green-300">Ordre aléatoire</Label>
                        <Switch
                          checked={config.randomOrder}
                          onCheckedChange={(checked) => updateConfig({ randomOrder: checked })}
                        />
                      </div>
                      <div className="text-xs text-green-500">
                        {config.randomOrder 
                          ? "Les images s'afficheront dans un ordre aléatoire"
                          : "Les images s'afficheront dans l'ordre de téléchargement"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Avancé */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
            <CardHeader className="border-b border-green-500/30">
              <CardTitle className="text-green-400">Paramètres Avancés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Playlist */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-green-300">Lecture en boucle</Label>
                  <Switch
                    checked={isPlaying}
                    onCheckedChange={setIsPlaying}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-green-300">Ordre aléatoire</Label>
                  <Switch
                    checked={config.randomOrder}
                    onCheckedChange={(checked) => updateConfig({ randomOrder: checked })}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-green-300">
                    Intervalle entre les messages: {config.imageInterval / 1000}s
                  </Label>
                  <Slider
                    value={[config.imageInterval]}
                    onValueChange={([value]) => updateConfig({ imageInterval: value })}
                    min={1000}
                    max={10000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-green-500">
                    <span>1s</span>
                    <span>10s</span>
                  </div>
                </div>
              </div>

              {/* Import/Export */}
              <div className="space-y-4">
                <Label className="text-green-300">Import/Export de la configuration</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={exportConfig}
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importConfig}
                      className="hidden"
                      id="import-config"
                    />
                    <Button
                      onClick={() => document.getElementById('import-config')?.click()}
                      variant="outline"
                      className="w-full border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importer
                    </Button>
                  </div>
                  <Button
                    onClick={resetConfig}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Boutons de sauvegarde */}
      <Card className="border-green-500/30 bg-black/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-500">
              {hasChanges ? "Des modifications n'ont pas été sauvegardées" : "Toutes les modifications sont sauvegardées"}
            </div>
            <Button
              onClick={saveConfig}
              disabled={!hasChanges}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder la configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}