'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Crown, 
  Settings, 
  Palette, 
  Save, 
  RefreshCw, 
  Play,
  Zap,
  Target,
  Lightbulb,
  Sparkles,
  Volume2,
  Wand2,
  Filter,
  Search,
  Eye,
  Copy,
  Download,
  Upload,
  Plus,
  Trash2,
  Star
} from 'lucide-react'
import { AGENT_STYLES, STYLE_CATEGORIES, getCompatibleStyles, getStylesByCategory, getStyleById, type AgentStyle } from '@/data/styles-ia'
import { aiServiceClient } from '@/lib/ai-service-client'

interface LikeJustStyleConfiguration {
  primaryStyle: string
  secondaryStyles: string[]
  intensity: number
  adaptability: number
  contextAwareness: boolean
  autoSwitch: boolean
  forbiddenStyles: string[]
  customPrompts: Record<string, string>
  favorites: string[]
  recentStyles: string[]
}

const DEFAULT_LIKEJUST_CONFIG: LikeJustStyleConfiguration = {
  primaryStyle: 'professionnel',
  secondaryStyles: ['diplomatique', 'analytique'],
  intensity: 7,
  adaptability: 8,
  contextAwareness: true,
  autoSwitch: false,
  forbiddenStyles: ['sarcasmique', 'autoritaire'],
  customPrompts: {},
  favorites: ['professionnel', 'diplomatique', 'analytique'],
  recentStyles: []
}

interface StyleApplication {
  styleId: string
  intensity: number
  context: string
  timestamp: Date
  result: string
}

export default function LikeJustStyleSelector() {
  const [config, setConfig] = useState<LikeJustStyleConfiguration>(DEFAULT_LIKEJUST_CONFIG)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [intensity, setIntensity] = useState(7)
  const [testContext, setTestContext] = useState('')
  const [testResult, setTestResult] = useState('')
  const [isTesting, setIsTesting] = useState(false)
  const [recentApplications, setRecentApplications] = useState<StyleApplication[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadConfiguration()
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(DEFAULT_LIKEJUST_CONFIG)
    setHasChanges(changed)
  }, [config])

  const loadConfiguration = () => {
    try {
      const saved = localStorage.getItem('likejust-style-config')
      if (saved) {
        const parsed = JSON.parse(saved)
        setConfig({ ...DEFAULT_LIKEJUST_CONFIG, ...parsed })
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration LikeJust:', error)
    }
  }

  const saveConfiguration = () => {
    try {
      localStorage.setItem('likejust-style-config', JSON.stringify(config))
      setHasChanges(false)
      
      // Appliquer la configuration en temps réel
      aiServiceClient.updateLikeJustConfig(config)
      console.log('⚡ Configuration LikeJust sauvegardée et appliquée en temps réel')
      
      // Afficher une confirmation
      const confirmation = document.createElement('div')
      confirmation.className = 'fixed top-4 right-4 bg-purple-500 text-black px-4 py-2 rounded-lg z-50'
      confirmation.textContent = '✅ Configuration LikeJust appliquée avec succès'
      document.body.appendChild(confirmation)
      
      setTimeout(() => {
        document.body.removeChild(confirmation)
      }, 3000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error)
    }
  }

  const updateConfig = (updates: Partial<LikeJustStyleConfiguration>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const addToFavorites = (styleId: string) => {
    if (!config.favorites.includes(styleId)) {
      updateConfig({
        favorites: [...config.favorites, styleId]
      })
    }
  }

  const removeFromFavorites = (styleId: string) => {
    updateConfig({
      favorites: config.favorites.filter(id => id !== styleId)
    })
  }

  const toggleSecondaryStyle = (styleId: string) => {
    const isSecondary = config.secondaryStyles.includes(styleId)
    const updatedSecondary = isSecondary
      ? config.secondaryStyles.filter(id => id !== styleId)
      : [...config.secondaryStyles, styleId]
    
    updateConfig({ secondaryStyles: updatedSecondary })
  }

  const toggleForbiddenStyle = (styleId: string) => {
    const isForbidden = config.forbiddenStyles.includes(styleId)
    const updatedForbidden = isForbidden
      ? config.forbiddenStyles.filter(id => id !== styleId)
      : [...config.forbiddenStyles, styleId]
    
    updateConfig({ forbiddenStyles: updatedForbidden })
  }

  const setAsPrimary = (styleId: string) => {
    updateConfig({ 
      primaryStyle: styleId,
      recentStyles: [styleId, ...config.recentStyles.filter(id => id !== styleId)].slice(0, 10)
    })
  }

  const testStyleApplication = async () => {
    if (!testContext.trim()) return

    setIsTesting(true)
    try {
      const primaryStyle = getStyleById(config.primaryStyle)
      const result = await aiServiceClient.testStyleApplication({
        context: testContext,
        primaryStyle: primaryStyle,
        secondaryStyles: config.secondaryStyles.map(getStyleById).filter(Boolean),
        intensity: config.intensity,
        adaptability: config.adaptability
      })

      const application: StyleApplication = {
        styleId: config.primaryStyle,
        intensity: config.intensity,
        context: testContext,
        timestamp: new Date(),
        result: result.response
      }

      setRecentApplications(prev => [application, ...prev.slice(0, 9)])
      setTestResult(result.response)
    } catch (error) {
      console.error('Erreur lors du test de style:', error)
      setTestResult('Erreur lors de l\'application du style')
    } finally {
      setIsTesting(false)
    }
  }

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'likejust-style-config.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importConfiguration = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string)
        setConfig({ ...DEFAULT_LIKEJUST_CONFIG, ...importedConfig })
        setHasChanges(true)
      } catch (error) {
        console.error('Erreur lors de l\'importation de la configuration:', error)
      }
    }
    reader.readAsText(file)
  }

  const resetConfiguration = () => {
    setConfig(DEFAULT_LIKEJUST_CONFIG)
    localStorage.removeItem('likejust-style-config')
    setHasChanges(false)
  }

  const filteredStyles = AGENT_STYLES.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         style.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getStyleStatus = (styleId: string): 'primary' | 'secondary' | 'forbidden' | 'none' => {
    if (config.primaryStyle === styleId) return 'primary'
    if (config.secondaryStyles.includes(styleId)) return 'secondary'
    if (config.forbiddenStyles.includes(styleId)) return 'forbidden'
    return 'none'
  }

  const getStyleBadgeColor = (status: string) => {
    switch (status) {
      case 'primary': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'secondary': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'forbidden': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const primaryStyle = getStyleById(config.primaryStyle)

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Crown className="w-8 h-8 text-purple-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-400">Commandant LikeJust - Sélecteur de Style</h2>
              <p className="text-purple-600">Contrôle ultime des 92 styles d'IA avec application en temps réel</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="px-3 py-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
              {config.favorites.length} favoris
            </Badge>
            {hasChanges && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Non sauvegardé
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4">
          <Button
            onClick={saveConfiguration}
            disabled={!hasChanges}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            Appliquer la Configuration
          </Button>
          <Button
            variant="outline"
            onClick={resetConfiguration}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.contextAwareness}
              onCheckedChange={(checked) => updateConfig({ contextAwareness: checked })}
            />
            <span className="text-sm text-purple-600">Conscience contextuelle</span>
          </div>
        </div>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Style Selection */}
        <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-4">
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher un style..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/40 border-purple-500/30 text-purple-400 placeholder-purple-600"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-black/40 border-purple-500/30 text-purple-400">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-black border-purple-500/30">
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {Object.entries(STYLE_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-purple-400 hover:bg-purple-500/20">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Style List */}
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2">
                {filteredStyles.map((style) => {
                  const status = getStyleStatus(style.id)
                  const isFavorite = config.favorites.includes(style.id)
                  
                  return (
                    <Card
                      key={style.id}
                      className={`p-3 cursor-pointer transition-all duration-300 ${
                        status === 'primary'
                          ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'bg-purple-500/5 border-purple-500/20 hover:bg-purple-500/10'
                      }`}
                      onClick={() => setAsPrimary(style.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getStyleEmoji(style.category)}</span>
                            <div>
                              <div className="font-semibold text-purple-400">{style.name}</div>
                              <div className="text-xs text-purple-600">
                                {style.category} • Intensité {style.intensity}/10
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (isFavorite) {
                                  removeFromFavorites(style.id)
                                } else {
                                  addToFavorites(style.id)
                                }
                              }}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </Button>
                            {status === 'primary' && (
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-xs text-purple-500 line-clamp-2">
                          {style.description}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className={getStyleBadgeColor(status)}>
                            {status === 'primary' ? 'Principal' : 
                             status === 'secondary' ? 'Secondaire' :
                             status === 'forbidden' ? 'Interdit' : 'Disponible'}
                          </Badge>
                          
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSecondaryStyle(style.id)
                              }}
                              className={`text-blue-400 hover:text-blue-300 ${
                                status === 'secondary' ? 'bg-blue-500/20' : ''
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleForbiddenStyle(style.id)
                              }}
                              className={`text-red-400 hover:text-red-300 ${
                                status === 'forbidden' ? 'bg-red-500/20' : ''
                              }`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {/* Right Panel - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Style Overview */}
          <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-purple-400">Style Principal Actif</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl">{getStyleEmoji(primaryStyle?.category)}</span>
                  <div>
                    <div className="font-semibold text-purple-400">{primaryStyle?.name}</div>
                    <div className="text-sm text-purple-600">{primaryStyle?.description}</div>
                  </div>
                </div>
              </div>
              <Badge className="px-3 py-1 bg-purple-500/20 text-purple-400 border-purple-500/30">
                Intensité {config.intensity}/10
              </Badge>
            </div>

            {/* Style Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-purple-300">Intensité du style: {config.intensity}</Label>
                <Slider
                  value={[config.intensity]}
                  onValueChange={([value]) => updateConfig({ intensity: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-purple-500">
                  <span>Subtil</span>
                  <span>Intense</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-purple-300">Adaptabilité: {config.adaptability}</Label>
                <Slider
                  value={[config.adaptability]}
                  onValueChange={([value]) => updateConfig({ adaptability: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-purple-500">
                  <span>Rigide</span>
                  <span>Flexible</span>
                </div>
              </div>
            </div>

            {/* Secondary Styles */}
            <div className="mt-4">
              <Label className="text-purple-300 mb-2 block">Styles secondaires ({config.secondaryStyles.length})</Label>
              <div className="flex flex-wrap gap-2">
                {config.secondaryStyles.map((styleId) => {
                  const style = getStyleById(styleId)
                  return style ? (
                    <Badge
                      key={styleId}
                      className="bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30"
                      onClick={() => toggleSecondaryStyle(styleId)}
                    >
                      {style.name}
                    </Badge>
                  ) : null
                })}
                {config.secondaryStyles.length === 0 && (
                  <span className="text-sm text-purple-500">Aucun style secondaire sélectionné</span>
                )}
              </div>
            </div>
          </Card>

          {/* Configuration Tabs */}
          <Tabs defaultValue="test" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-black/60 border border-purple-500/30">
              <TabsTrigger value="test" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20">
                <Play className="w-4 h-4" />
                Tester
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20">
                <Star className="w-4 h-4" />
                Favoris
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20">
                <Settings className="w-4 h-4" />
                Avancé
              </TabsTrigger>
            </TabsList>

            {/* Test Tab */}
            <TabsContent value="test" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-6">
                <h4 className="text-lg font-bold text-purple-400 mb-4">Tester l'application du style</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-purple-300">Contexte de test</Label>
                    <Textarea
                      value={testContext}
                      onChange={(e) => setTestContext(e.target.value)}
                      placeholder="Entrez un contexte ou une phrase pour tester l'application du style..."
                      className="mt-2 bg-black/40 border-purple-500/30 text-purple-400 placeholder-purple-600"
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    onClick={testStyleApplication}
                    disabled={!testContext.trim() || isTesting}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Test en cours...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Tester le style
                      </>
                    )}
                  </Button>
                  
                  {testResult && (
                    <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <Label className="text-purple-300 mb-2 block">Résultat:</Label>
                      <div className="text-purple-400">{testResult}</div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Applications */}
              {recentApplications.length > 0 && (
                <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-6">
                  <h4 className="text-lg font-bold text-purple-400 mb-4">Applications récentes</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {recentApplications.map((app, index) => (
                        <Card key={index} className="bg-black/40 border-purple-500/20 p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                {getStyleById(app.styleId)?.name}
                              </Badge>
                              <span className="text-xs text-purple-500">
                                {app.timestamp.toLocaleTimeString('fr-FR')}
                              </span>
                            </div>
                            <div className="text-sm text-purple-300">
                              Contexte: {app.context}
                            </div>
                            <div className="text-xs text-purple-400 line-clamp-2">
                              {app.result}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-6">
                <h4 className="text-lg font-bold text-purple-400 mb-4">Styles favoris</h4>
                
                {config.favorites.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.favorites.map((styleId) => {
                      const style = getStyleById(styleId)
                      if (!style) return null
                      
                      return (
                        <Card key={styleId} className="bg-black/40 border-purple-500/20 p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getStyleEmoji(style.category)}</span>
                                <div>
                                  <div className="font-semibold text-purple-400">{style.name}</div>
                                  <div className="text-xs text-purple-600">{style.category}</div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromFavorites(styleId)}
                                className="text-yellow-400 hover:text-yellow-300"
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </Button>
                            </div>
                            
                            <div className="text-xs text-purple-500 line-clamp-2">
                              {style.description}
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setAsPrimary(styleId)}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Définir comme principal
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleSecondaryStyle(styleId)}
                                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                              >
                                Secondaire
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-purple-500 py-8">
                    Aucun style favori. Cliquez sur l'étoile ★ pour ajouter un style aux favoris.
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-purple-500/30 p-6">
                <h4 className="text-lg font-bold text-purple-400 mb-4">Paramètres avancés</h4>
                
                <div className="space-y-6">
                  {/* Auto Switch */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-300">Changement automatique de style</Label>
                      <div className="text-sm text-purple-500">
                        Adaptation intelligente du style selon le contexte
                      </div>
                    </div>
                    <Switch
                      checked={config.autoSwitch}
                      onCheckedChange={(checked) => updateConfig({ autoSwitch: checked })}
                    />
                  </div>

                  {/* Context Awareness */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-purple-300">Conscience contextuelle</Label>
                      <div className="text-sm text-purple-500">
                        Analyse approfondie du contexte pour un style optimal
                      </div>
                    </div>
                    <Switch
                      checked={config.contextAwareness}
                      onCheckedChange={(checked) => updateConfig({ contextAwareness: checked })}
                    />
                  </div>

                  {/* Forbidden Styles */}
                  <div>
                    <Label className="text-purple-300 mb-2 block">Styles interdits ({config.forbiddenStyles.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {config.forbiddenStyles.map((styleId) => {
                        const style = getStyleById(styleId)
                        return style ? (
                          <Badge
                            key={styleId}
                            className="bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer hover:bg-red-500/30"
                            onClick={() => toggleForbiddenStyle(styleId)}
                          >
                            {style.name}
                          </Badge>
                        ) : null
                      })}
                      {config.forbiddenStyles.length === 0 && (
                        <span className="text-sm text-purple-500">Aucun style interdit</span>
                      )}
                    </div>
                  </div>

                  {/* Import/Export */}
                  <div className="space-y-3">
                    <Label className="text-purple-300">Import/Export de la configuration</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={exportConfiguration}
                        variant="outline"
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                      </Button>
                      <div>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importConfiguration}
                          className="hidden"
                          id="import-lexus-config"
                        />
                        <Button
                          onClick={() => document.getElementById('import-lexus-config')?.click()}
                          variant="outline"
                          className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Importer
                        </Button>
                      </div>
                      <Button
                        onClick={resetConfiguration}
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

// Helper function to get emoji for category
function getStyleEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    ton: '🎭',
    style: '🎨',
    genre: '🎪',
    specialite: '⚡'
  }
  return emojiMap[category] || '🎯'
}