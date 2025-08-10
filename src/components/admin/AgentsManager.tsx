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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bot, 
  Settings, 
  Palette, 
  Save, 
  RefreshCw, 
  Play,
  Pause,
  Eye,
  Edit,
  Copy,
  Search,
  Filter,
  Plus,
  Trash2,
  Zap,
  Target,
  Lightbulb,
  Sparkles,
  Volume2,
  Wand2
} from 'lucide-react'
import { AGENT_STYLES, STYLE_CATEGORIES, getCompatibleStyles, getStylesByCategory, getStyleById, type AgentStyle } from '@/data/styles-ia'
import { aiServiceClient } from '@/lib/ai-service-client'

interface AgentConfiguration {
  id: string
  name: string
  emoji: string
  isActive: boolean
  systemPrompt: string
  temperature: number
  maxTokens: number
  allowedStyles: string[]
  primaryStyle: string
  forbiddenStyles: string[]
  personalityTraits: string[]
  coordinationRole: string
  specialties: string[]
}

const defaultAgents: AgentConfiguration[] = [
  {
    id: '1',
    name: 'Likejust',
    emoji: '🕴️',
    isActive: true,
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
    allowedStyles: ['professionnel', 'diplomatique', 'analytique', 'coordination', 'visionnaire'],
    primaryStyle: 'professionnel',
    forbiddenStyles: ['sarcasmique', 'autoritaire', 'provocateur'],
    personalityTraits: ['leader', 'strategique', 'adaptatif', 'synthétique'],
    coordinationRole: 'orchestrator',
    specialties: ['Coordination', 'Synthèse', 'Optimisation', 'Adaptation']
  },
  {
    id: '2',
    name: 'Trinity',
    emoji: '👩‍💻',
    isActive: true,
    systemPrompt: `Tu es Trinity, une experte en combat et en technologie. Tu es directe, précise et efficace. Tu aides les utilisateurs avec des solutions pratiques et techniques.`,
    temperature: 0.6,
    maxTokens: 800,
    allowedStyles: ['technique', 'direct', 'professionnel', 'pragmatique', 'efficace'],
    primaryStyle: 'technique',
    forbiddenStyles: ['poétique', 'dramatique', 'hésitant'],
    personalityTraits: ['compétent', 'direct', 'fiable', 'rapide'],
    coordinationRole: 'technical_expert',
    specialties: ['Technique', 'Combat', 'Efficacité', 'Précision']
  },
  {
    id: '3',
    name: 'Morpheus',
    emoji: '🧙‍♂️',
    isActive: true,
    systemPrompt: `Tu es Morpheus, le mentor et guide. Tu es sage, philosophique et tu poses des questions profondes pour aider les utilisateurs à trouver leurs propres réponses.`,
    temperature: 0.8,
    maxTokens: 1200,
    allowedStyles: ['philosophique', 'soutenu', 'mystérieux', 'inspirant', 'pédagogique'],
    primaryStyle: 'philosophique',
    forbiddenStyles: ['superficiel', 'technique', 'vulgaire'],
    personalityTraits: ['sage', 'méditatif', 'profond', 'guidant'],
    coordinationRole: 'philosophical_guide',
    specialties: ['Philosophie', 'Mentorat', 'Sagesse', 'Guidance']
  },
  {
    id: '4',
    name: 'Oracle',
    emoji: '🔮',
    isActive: true,
    systemPrompt: `Tu es l'Oracle, une voyante qui peut voir les possibilités futures. Tu es mystérieuse et tes réponses sont souvent énigmatiques mais profondes.`,
    temperature: 0.9,
    maxTokens: 600,
    allowedStyles: ['mystérieux', 'poétique', 'métaphorique', 'spirituel', 'visionnaire'],
    primaryStyle: 'mystérieux',
    forbiddenStyles: ['scientifique', 'logique', 'matérialiste'],
    personalityTraits: ['intuitif', 'mystique', 'profétique', 'sage'],
    coordinationRole: 'visionary',
    specialties: ['Prédiction', 'Mystère', 'Intuition', 'Vision']
  },
  {
    id: '5',
    name: 'Agent Smith',
    emoji: '🕵️',
    isActive: true,
    systemPrompt: `Tu es Agent Smith, un programme qui cherche l'ordre et le contrôle. Tu es analytique, logique et parfois menaçant. Tu offres des perspectives systémiques et structurées.`,
    temperature: 0.5,
    maxTokens: 800,
    allowedStyles: ['logique', 'analytique', 'structuré', 'formel', 'systémique'],
    primaryStyle: 'logique',
    forbiddenStyles: ['créatif', 'chaotique', 'émotionnel'],
    personalityTraits: ['logique', 'contrôlant', 'analytique', 'systémique'],
    coordinationRole: 'logical_analyst',
    specialties: ['Logique', 'Analyse', 'Structure', 'Ordre']
  }
]

export default function AgentsManager() {
  const [agents, setAgents] = useState<AgentConfiguration[]>(defaultAgents)
  const [selectedAgent, setSelectedAgent] = useState<string>('1')
  const [isEditingPrompt, setIsEditingPrompt] = useState(false)
  const [tempPrompt, setTempPrompt] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const [realTimePreview, setRealTimePreview] = useState(true)

  const currentAgent = agents.find(agent => agent.id === selectedAgent) || agents[0]

  // Effet pour initialiser le prompt temporaire
  useEffect(() => {
    setTempPrompt(currentAgent.systemPrompt)
  }, [selectedAgent, currentAgent.systemPrompt])

  const updateAgent = (agentId: string, updates: Partial<AgentConfiguration>) => {
    setAgents(prev => 
      prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, ...updates }
          : agent
      )
    )
  }

  const saveAgentConfig = () => {
    updateAgent(selectedAgent, { systemPrompt: tempPrompt })
    setIsEditingPrompt(false)
    setLastSaved(new Date())
    
    // Mettre à jour la configuration en temps réel
    try {
      aiServiceClient.updateAgentConfig(selectedAgent, { systemPrompt: tempPrompt })
      console.log(`💾 Configuration de ${currentAgent.name} sauvegardée et appliquée en temps réel`)
      
      // Afficher une confirmation visuelle
      const confirmation = document.createElement('div')
      confirmation.className = 'fixed top-4 right-4 bg-green-500 text-black px-4 py-2 rounded-lg z-50'
      confirmation.textContent = `✅ Configuration de ${currentAgent.name} appliquée en temps réel`
      document.body.appendChild(confirmation)
      
      setTimeout(() => {
        document.body.removeChild(confirmation)
      }, 3000)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la configuration:', error)
    }
  }

  const toggleAgentStyle = (agentId: string, styleId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    const isAllowed = agent.allowedStyles.includes(styleId)
    const updatedAllowedStyles = isAllowed
      ? agent.allowedStyles.filter(id => id !== styleId)
      : [...agent.allowedStyles, styleId]

    updateAgent(agentId, { allowedStyles: updatedAllowedStyles })
  }

  const setPrimaryStyle = (agentId: string, styleId: string) => {
    updateAgent(agentId, { primaryStyle: styleId })
  }

  const toggleForbiddenStyle = (agentId: string, styleId: string) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    const isForbidden = agent.forbiddenStyles.includes(styleId)
    const updatedForbiddenStyles = isForbidden
      ? agent.forbiddenStyles.filter(id => id !== styleId)
      : [...agent.forbiddenStyles, styleId]

    updateAgent(agentId, { forbiddenStyles: updatedForbiddenStyles })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const filteredStyles = AGENT_STYLES.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         style.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getStyleCompatibility = (agentId: string, styleId: string): 'compatible' | 'neutral' | 'incompatible' => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return 'neutral'

    if (agent.forbiddenStyles.includes(styleId)) return 'incompatible'
    if (agent.allowedStyles.includes(styleId)) return 'compatible'
    return 'neutral'
  }

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'compatible': return 'border-green-500 bg-green-500/10'
      case 'incompatible': return 'border-red-500 bg-red-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bot className="w-8 h-8 text-green-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-400">Gestion des Agents IA</h2>
              <p className="text-green-600">Configuration dynamique des prompts, styles et personnalités</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="px-3 py-1 bg-green-500/20 text-green-400 border-green-500/30">
              {agents.filter(a => a.isActive).length} actifs
            </Badge>
            <div className="text-xs text-green-600">
              Dernière sauvegarde: {lastSaved.toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => updateAgent(selectedAgent, { isActive: !currentAgent.isActive })}
            className={`${currentAgent.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-black font-bold`}
          >
            {currentAgent.isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {currentAgent.isActive ? 'Désactiver' : 'Activer'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setAgents(defaultAgents)}
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser tout
          </Button>
          <Switch
            checked={realTimePreview}
            onCheckedChange={setRealTimePreview}
          />
          <span className="text-sm text-green-600">Aperçu en temps réel</span>
        </div>
      </Card>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Agent Selection */}
        <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-4">
          <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Agents
          </h3>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`p-3 cursor-pointer transition-all duration-300 ${
                    selectedAgent === agent.id
                      ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20'
                      : agent.isActive
                      ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{agent.emoji}</span>
                      <div>
                        <div className="font-semibold text-green-400">{agent.name}</div>
                        <div className="text-xs text-green-600">
                          {agent.allowedStyles.length} styles • {agent.specialties.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={agent.isActive}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={(checked) => updateAgent(agent.id, { isActive: checked })}
                      />
                      {selectedAgent === agent.id && (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Right Panel - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent Header */}
          <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentAgent.emoji}</span>
                <div>
                  <h3 className="text-2xl font-bold text-green-400">{currentAgent.name}</h3>
                  <div className="text-sm text-green-600">
                    Rôle: {currentAgent.coordinationRole} • Spécialités: {currentAgent.specialties.join(', ')}
                  </div>
                </div>
              </div>
              <Badge className={`px-3 py-1 ${currentAgent.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {currentAgent.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>

            {/* Personality Traits */}
            <div className="mb-4">
              <div className="text-sm font-medium text-green-400 mb-2">Traits de personnalité:</div>
              <div className="flex flex-wrap gap-2">
                {currentAgent.personalityTraits.map((trait, index) => (
                  <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Configuration Tabs */}
          <Tabs defaultValue="prompt" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-black/60 border border-green-500/30">
              <TabsTrigger value="prompt" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Settings className="w-4 h-4" />
                Prompt
              </TabsTrigger>
              <TabsTrigger value="styles" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Palette className="w-4 h-4" />
                Styles
              </TabsTrigger>
              <TabsTrigger value="parameters" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Zap className="w-4 h-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* System Prompt Tab */}
            <TabsContent value="prompt" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-green-400 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Prompt Système
                  </h4>
                  <div className="flex items-center gap-2">
                    {isEditingPrompt ? (
                      <>
                        <Button
                          onClick={saveAgentConfig}
                          className="bg-green-500 hover:bg-green-600 text-black font-bold"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingPrompt(false)}
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
                      onClick={() => copyToClipboard(currentAgent.systemPrompt)}
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
                      placeholder="Entrez le prompt système pour l'agent..."
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
                        {currentAgent.systemPrompt}
                      </pre>
                    </div>
                  </ScrollArea>
                )}
              </Card>
            </TabsContent>

            {/* Styles Tab */}
            <TabsContent value="styles" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-green-400 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Styles et Tons Autorisés
                  </h4>
                  <div className="text-sm text-green-600">
                    {currentAgent.allowedStyles.length} styles autorisés
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                    <Input
                      placeholder="Rechercher un style..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 bg-black/40 border-green-500/30 text-green-400">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-green-500/30">
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {Object.entries(STYLE_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Current Primary Style */}
                <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">Style principal:</span>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {getStyleById(currentAgent.primaryStyle)?.name || currentAgent.primaryStyle}
                    </Badge>
                  </div>
                </div>

                {/* Styles Grid */}
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredStyles.map((style) => {
                      const compatibility = getStyleCompatibility(selectedAgent, style.id)
                      const isAllowed = currentAgent.allowedStyles.includes(style.id)
                      const isPrimary = currentAgent.primaryStyle === style.id
                      const isForbidden = currentAgent.forbiddenStyles.includes(style.id)

                      return (
                        <Card
                          key={style.id}
                          className={`p-3 cursor-pointer transition-all duration-300 ${getCompatibilityColor(compatibility)} ${
                            isPrimary ? 'ring-2 ring-purple-500' : ''
                          }`}
                          onClick={() => !isForbidden && toggleAgentStyle(selectedAgent, style.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isAllowed}
                                disabled={isForbidden}
                              />
                              <span className="font-medium text-green-400">{style.name}</span>
                              {isPrimary && (
                                <Wand2 className="w-3 h-3 text-purple-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {STYLE_CATEGORIES[style.category]}
                              </Badge>
                              <Badge className="text-xs bg-gray-500/20 text-gray-400 border-gray-500/30">
                                {style.intensity}/10
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-xs text-green-600 mb-2 line-clamp-2">
                            {style.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {isForbidden && (
                                <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                                  Interdit
                                </Badge>
                              )}
                              {isAllowed && (
                                <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                                  Autorisé
                                </Badge>
                              )}
                            </div>
                            
                            {!isForbidden && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPrimaryStyle(selectedAgent, style.id)
                                }}
                                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 p-1 h-auto"
                              >
                                <Wand2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            {/* Parameters Tab */}
            <TabsContent value="parameters" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
                  <h4 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Paramètres de Performance
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-green-400 mb-2">
                        Température: {currentAgent.temperature}
                      </label>
                      <Slider
                        value={[currentAgent.temperature]}
                        onValueChange={([value]) => updateAgent(selectedAgent, { temperature: value })}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-green-600 mt-1">
                        Contrôle la créativité (0 = très précis, 1 = très créatif)
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-400 mb-2">
                        Tokens Maximum: {currentAgent.maxTokens}
                      </label>
                      <Slider
                        value={[currentAgent.maxTokens]}
                        onValueChange={([value]) => updateAgent(selectedAgent, { maxTokens: value })}
                        max={2000}
                        min={200}
                        step={50}
                        className="w-full"
                      />
                      <div className="text-xs text-green-600 mt-1">
                        Longueur maximale des réponses
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
                  <h4 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Restrictions
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-400 mb-2">
                        Styles Interdits
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {currentAgent.forbiddenStyles.map((styleId) => {
                          const style = getStyleById(styleId)
                          return (
                            <Badge 
                              key={styleId} 
                              className="bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer hover:bg-red-500/30"
                              onClick={() => toggleForbiddenStyle(selectedAgent, styleId)}
                            >
                              {style?.name || styleId}
                              <Trash2 className="w-3 h-3 ml-1" />
                            </Badge>
                          )
                        })}
                        {currentAgent.forbiddenStyles.length === 0 && (
                          <div className="text-xs text-green-600">Aucun style interdit</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-400 mb-2">
                        Rôle de Coordination
                      </label>
                      <Input
                        value={currentAgent.coordinationRole}
                        onChange={(e) => updateAgent(selectedAgent, { coordinationRole: e.target.value })}
                        className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600"
                        placeholder="Rôle dans la coordination..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-400 mb-2">
                        Spécialités
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {currentAgent.specialties.map((specialty, index) => (
                          <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}