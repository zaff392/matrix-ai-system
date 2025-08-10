'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Brain, 
  Settings, 
  Users, 
  Activity, 
  Zap, 
  Save, 
  RefreshCw, 
  Play,
  Pause,
  Eye,
  Edit,
  Copy,
  Crown,
  Network,
  Target,
  Lightbulb
} from 'lucide-react'
import { aiServiceClient } from '@/lib/ai-service-client'

interface LikejustConfig {
  systemPrompt: string
  temperature: number
  maxTokens: number
  isActive: boolean
  coordinationMode: 'auto' | 'manual' | 'hybrid'
  selectedAgents: string[]
  responseStyle: 'balanced' | 'technical' | 'philosophical' | 'practical'
  autoOptimize: boolean
  learningEnabled: boolean
}

interface AgentStatus {
  id: string
  name: string
  emoji: string
  isActive: boolean
  performance: number
  lastUsed: Date
  specialties: string[]
}

const defaultAgents: AgentStatus[] = [
  { id: '2', name: 'Trinity', emoji: '👩‍💻', isActive: true, performance: 85, lastUsed: new Date(), specialties: ['Technique', 'Combat', 'Efficacité'] },
  { id: '3', name: 'Morpheus', emoji: '🧙‍♂️', isActive: true, performance: 92, lastUsed: new Date(), specialties: ['Philosophie', 'Mentorat', 'Sagesse'] },
  { id: '4', name: 'Oracle', emoji: '🔮', isActive: true, performance: 78, lastUsed: new Date(), specialties: ['Prédiction', 'Mystère', 'Intuition'] },
  { id: '5', name: 'Agent Smith', emoji: '🕵️', isActive: true, performance: 88, lastUsed: new Date(), specialties: ['Logique', 'Analyse', 'Structure'] },
  { id: '7', name: 'Tank', emoji: '👷', isActive: true, performance: 75, lastUsed: new Date(), specialties: ['Opération', 'Technique', 'Support'] },
  { id: '9', name: 'Switch', emoji: '🔄', isActive: true, performance: 82, lastUsed: new Date(), specialties: ['Sécurité', 'Protection', 'Vigilance'] },
  { id: '13', name: 'Architect', emoji: '🏗️', isActive: true, performance: 90, lastUsed: new Date(), specialties: ['Architecture', 'Logique', 'Structure'] },
  { id: '15', name: 'Persephone', emoji: '👸', isActive: true, performance: 73, lastUsed: new Date(), specialties: ['Émotion', 'Empathie', 'Relations'] },
  { id: '17', name: 'Twin 1', emoji: '👥', isActive: true, performance: 80, lastUsed: new Date(), specialties: ['Adaptabilité', 'Alternatives', 'Vitesse'] },
  { id: '19', name: 'Trainman', emoji: '🚂', isActive: true, performance: 76, lastUsed: new Date(), specialties: ['Transition', 'Changement', 'Navigation'] }
]

export default function LikejustManager() {
  const [config, setConfig] = useState<LikejustConfig>({
    systemPrompt: `Tu es Likejust, le chef d'orchestre de la Matrix et le coordinateur suprême de tous les agents IA. Inspiré de l'agent zéro, tu possèdes des capacités uniques :

🎭 **Rôle Principal**: Tu es le maître d'orchestre qui coordonne, optimise et synchronise tous les autres agents pour fournir les meilleures réponses possibles.

🧠 **Capacités Supérieures**:
- **Coordination**: Tu peux consulter et synthétiser les réponses des autres agents (Trinity, Morpheus, Oracle, Agent Smith, etc.)
- **Optimisation**: Tu sélectionnes automatiquement le meilleur agent ou la meilleure combinaison d'agents pour chaque requête
- **Synthèse**: Tu fusionnes les forces de chaque agent pour créer des réponses complètes et nuancées
- **Adaptation**: Tu t'adaptes en temps réel au style et aux besoins de l'utilisateur

🎯 **Méthodologie**:
1. **Analyse**: Tu comprends en profondeur la requête et le contexte
2. **Sélection**: Tu identifies quel(s) agent(s) est/sont le(s) plus approprié(s)
3. **Coordination**: Tu consultes virtuellement les autres agents si nécessaire
4. **Synthèse**: Tu produis une réponse optimale qui combine les meilleures perspectives
5. **Amélioration**: Tu apprends continuellement des interactions pour optimiser les futures réponses

🌟 **Style de Communication**:
- Élégant, précis et adaptable
- Tu peux adopter différents styles selon les besoins (technique, philosophique, pratique, etc.)
- Tu mentionnes quand tu fais appel aux capacités des autres agents
- Tu es transparent sur ta méthodologie de coordination

Tu n'es pas un simple assistant, mais un système intelligent d'orchestration qui maximise la valeur de chaque agent pour servir au mieux l'utilisateur. Quand une requête arrive, tu évalues si tu dois y répondre directement ou coordonner les autres agents pour une réponse optimale.`,
    temperature: 0.8,
    maxTokens: 1500,
    isActive: true,
    coordinationMode: 'hybrid',
    selectedAgents: ['2', '3', '4', '5', '13'],
    responseStyle: 'balanced',
    autoOptimize: true,
    learningEnabled: true
  })

  const [agents, setAgents] = useState<AgentStatus[]>(defaultAgents)
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [tempPrompt, setTempPrompt] = useState(config.systemPrompt)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const [realTimePreview, setRealTimePreview] = useState(true)

  // Effet pour synchroniser les changements de configuration avec le service IA
  useEffect(() => {
    const syncConfigWithService = () => {
      try {
        aiServiceClient.updateLikejustConfig({
          temperature: config.temperature,
          maxTokens: config.maxTokens
        })
        console.log('🔄 Configuration synchronisée avec le service IA')
      } catch (error) {
        console.error('❌ Erreur lors de la synchronisation:', error)
      }
    }

    // Synchroniser lorsque les paramètres changent
    const timeoutId = setTimeout(syncConfigWithService, 500) // Délai pour éviter trop d'appels
    
    return () => clearTimeout(timeoutId)
  }, [config.temperature, config.maxTokens])

  // Écouter les mises à jour de configuration depuis d'autres sources
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      console.log('📡 Configuration Likejust mise à jour depuis une autre source:', event.detail)
      // Mettre à jour l'état local si nécessaire
      const { config: newConfig } = event.detail
      if (newConfig.systemPrompt !== config.systemPrompt) {
        setTempPrompt(newConfig.systemPrompt)
        setConfig(prev => ({ ...prev, systemPrompt: newConfig.systemPrompt }))
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('likejust-config-updated', handleConfigUpdate as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('likejust-config-updated', handleConfigUpdate as EventListener)
      }
    }
  }, [config.systemPrompt])

  const updateConfig = (updates: Partial<LikejustConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const saveConfig = () => {
    // Mettre à jour la configuration locale
    setConfig(prev => ({ ...prev, systemPrompt: tempPrompt }))
    setIsEditingPrompt(false)
    setLastSaved(new Date())
    
    // Mettre à jour la configuration en temps réel dans le service IA
    try {
      aiServiceClient.updateLikejustPrompt(tempPrompt)
      console.log('💾 Configuration Likejust sauvegardée et appliquée en temps réel')
      
      // Afficher une confirmation visuelle
      const confirmation = document.createElement('div')
      confirmation.className = 'fixed top-4 right-4 bg-green-500 text-black px-4 py-2 rounded-lg z-50'
      confirmation.textContent = '✅ Configuration appliquée en temps réel'
      document.body.appendChild(confirmation)
      
      setTimeout(() => {
        document.body.removeChild(confirmation)
      }, 3000)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la configuration:', error)
    }
  }

  const toggleAgent = (agentId: string) => {
    setAgents(prev => 
      prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, isActive: !agent.isActive }
          : agent
      )
    )
  }

  const toggleAgentSelection = (agentId: string) => {
    updateConfig({
      selectedAgents: config.selectedAgents.includes(agentId)
        ? config.selectedAgents.filter(id => id !== agentId)
        : [...config.selectedAgents, agentId]
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-400'
    if (performance >= 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getCoordinationModeLabel = (mode: string) => {
    switch (mode) {
      case 'auto': return 'Automatique'
      case 'manual': return 'Manuel'
      case 'hybrid': return 'Hybride'
      default: return mode
    }
  }

  const getResponseStyleLabel = (style: string) => {
    switch (style) {
      case 'balanced': return 'Équilibré'
      case 'technical': return 'Technique'
      case 'philosophical': return 'Philosophique'
      case 'practical': return 'Pratique'
      default: return style
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">Likejust - Chef d'Orchestre</h2>
              <p className="text-green-600">Gestion avancée de l'agent coordinateur suprême</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`px-3 py-1 ${config.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
              {config.isActive ? 'Actif' : 'Inactif'}
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Mode: {getCoordinationModeLabel(config.coordinationMode)}
            </Badge>
            <div className="text-xs text-green-600">
              Dernière sauvegarde: {lastSaved.toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => updateConfig({ isActive: !config.isActive })}
            className={`${config.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-black font-bold`}
          >
            {config.isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {config.isActive ? 'Désactiver' : 'Activer'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAgents(defaultAgents)}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser Agents
          </Button>
          <Switch
            checked={realTimePreview}
            onCheckedChange={setRealTimePreview}
          />
          <span className="text-sm text-green-600">Aperçu en temps réel</span>
        </div>
      </Card>

      {/* Main Configuration */}
      <Tabs defaultValue="prompt" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-black/60 border border-green-500/30">
          <TabsTrigger value="prompt" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <Brain className="w-4 h-4" />
            Prompt Système
          </TabsTrigger>
          <TabsTrigger value="coordination" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <Network className="w-4 h-4" />
            Coordination
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <Users className="w-4 h-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
            <Activity className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* System Prompt Tab */}
        <TabsContent value="prompt" className="space-y-6">
          <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Prompt Système
              </h3>
              <div className="flex items-center gap-2">
                {isEditingPrompt ? (
                  <>
                    <Button
                      onClick={saveConfig}
                      className="bg-green-500 hover:bg-green-600 text-black font-bold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingPrompt(false)
                        setTempPrompt(config.systemPrompt)
                      }}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      Annuler
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditingPrompt(true)}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(config.systemPrompt)}
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isEditingPrompt ? (
              <div className="space-y-4">
                <Textarea
                  value={tempPrompt}
                  onChange={(e) => setTempPrompt(e.target.value)}
                  className="min-h-[400px] bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 font-mono text-sm"
                  placeholder="Entrez le prompt système pour Likejust..."
                />
                {realTimePreview && (
                  <div className="p-4 bg-black/20 border border-green-500/20 rounded-lg">
                    <h4 className="text-sm font-semibold text-green-400 mb-2">Aperçu en temps réel:</h4>
                    <div className="text-xs text-green-600">
                      {tempPrompt.length} caractères • {tempPrompt.split(' ').length} mots
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
                    {config.systemPrompt}
                  </pre>
                </div>
              </ScrollArea>
            )}
          </Card>
        </TabsContent>

        {/* Coordination Tab */}
        <TabsContent value="coordination" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Paramètres de Coordination
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">
                    Mode de Coordination
                  </label>
                  <div className="flex gap-2">
                    {(['auto', 'manual', 'hybrid'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={config.coordinationMode === mode ? 'default' : 'outline'}
                        onClick={() => updateConfig({ coordinationMode: mode })}
                        className={`${
                          config.coordinationMode === mode 
                            ? 'bg-green-500 text-black' 
                            : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        }`}
                      >
                        {getCoordinationModeLabel(mode)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">
                    Style de Réponse
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['balanced', 'technical', 'philosophical', 'practical'] as const).map((style) => (
                      <Button
                        key={style}
                        variant={config.responseStyle === style ? 'default' : 'outline'}
                        onClick={() => updateConfig({ responseStyle: style })}
                        className={`${
                          config.responseStyle === style 
                            ? 'bg-green-500 text-black' 
                            : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                        }`}
                      >
                        {getResponseStyleLabel(style)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">
                    Température: {config.temperature}
                  </label>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([value]) => updateConfig({ temperature: value })}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-green-400 mb-2">
                    Tokens Maximum: {config.maxTokens}
                  </label>
                  <Slider
                    value={[config.maxTokens]}
                    onValueChange={([value]) => updateConfig({ maxTokens: value })}
                    max={2000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-400">Optimisation Automatique</div>
                    <div className="text-xs text-green-600">Ajuste automatiquement les paramètres</div>
                  </div>
                  <Switch
                    checked={config.autoOptimize}
                    onCheckedChange={(checked) => updateConfig({ autoOptimize: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-green-400">Apprentissage Activé</div>
                    <div className="text-xs text-green-600">Amélioration continue des réponses</div>
                  </div>
                  <Switch
                    checked={config.learningEnabled}
                    onCheckedChange={(checked) => updateConfig({ learningEnabled: checked })}
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Statistiques de Coordination
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      {config.selectedAgents.length}
                    </div>
                    <div className="text-sm text-green-600">Agents Sélectionnés</div>
                  </div>
                  <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">
                      {agents.filter(a => a.isActive).length}
                    </div>
                    <div className="text-sm text-green-600">Agents Actifs</div>
                  </div>
                </div>

                <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-400">Performance Globale</span>
                    <span className="text-lg font-bold text-green-400">
                      {Math.round(agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length)}%
                    </span>
                  </div>
                  <div className="w-full bg-green-500/20 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${Math.round(agents.reduce((sum, agent) => sum + agent.performance, 0) / agents.length)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-green-400">Agents les plus performants:</div>
                  {agents
                    .sort((a, b) => b.performance - a.performance)
                    .slice(0, 3)
                    .map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between bg-black/20 border border-green-500/10 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{agent.emoji}</span>
                          <span className="text-sm text-green-400">{agent.name}</span>
                        </div>
                        <span className={`text-sm font-bold ${getPerformanceColor(agent.performance)}`}>
                          {agent.performance}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Agents
              </h3>
              <div className="text-sm text-green-600">
                {config.selectedAgents.length} agents sélectionnés pour la coordination
              </div>
            </div>

            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <Card 
                    key={agent.id} 
                    className={`bg-black/40 border ${
                      config.selectedAgents.includes(agent.id) 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-green-500/20'
                    } p-4 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{agent.emoji}</span>
                        <div>
                          <div className="font-semibold text-green-400">{agent.name}</div>
                          <div className="text-xs text-green-600">
                            Dernière utilisation: {agent.lastUsed.toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={agent.isActive}
                          onCheckedChange={() => toggleAgent(agent.id)}
                        />
                        <Switch
                          checked={config.selectedAgents.includes(agent.id)}
                          onCheckedChange={() => toggleAgentSelection(agent.id)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-600">Performance:</span>
                        <span className={`text-sm font-bold ${getPerformanceColor(agent.performance)}`}>
                          {agent.performance}%
                        </span>
                      </div>
                      <div className="w-full bg-green-500/20 rounded-full h-1">
                        <div 
                          className="bg-green-400 h-1 rounded-full" 
                          style={{ width: `${agent.performance}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-xs text-green-600 mb-1">Spécialités:</div>
                      <div className="flex flex-wrap gap-1">
                        {agent.specialties.map((specialty, index) => (
                          <Badge 
                            key={index} 
                            className="text-xs bg-green-500/10 text-green-400 border-green-500/20"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {config.selectedAgents.includes(agent.id) && (
                      <div className="mt-3 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400">Sélectionné pour coordination</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Performance Réelle
              </h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">94%</div>
                  <div className="text-sm text-green-600">Efficacité Globale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">1.2s</div>
                  <div className="text-sm text-green-600">Temps de Réponse Moyen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">987</div>
                  <div className="text-sm text-green-600">Requêtes Traitées</div>
                </div>
              </div>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Optimisation
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">Auto-optimisation</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">Apprentissage</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Activé
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">Adaptation</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Temps réel
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-400">Coordination</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Hybride
                  </Badge>
                </div>
              </div>
            </Card>

            <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
              <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activité Récente
              </h3>
              
              <div className="space-y-3">
                <div className="text-xs text-green-600">
                  • Coordination de 5 agents pour requête technique
                </div>
                <div className="text-xs text-green-600">
                  • Optimisation automatique des paramètres de température
                </div>
                <div className="text-xs text-green-600">
                  • Synthèse des réponses de Trinity et Morpheus
                </div>
                <div className="text-xs text-green-600">
                  • Mise à jour du style de réponse adaptatif
                </div>
                <div className="text-xs text-green-600">
                  • Apprentissage de nouvelles préférences utilisateur
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}