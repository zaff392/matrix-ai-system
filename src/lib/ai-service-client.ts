interface AgentConfig {
  name: string
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  specialties?: string[]
  coordinationRole?: string
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface CoordinationRequest {
  message: string
  selectedAgents: string[]
  coordinationMode: 'auto' | 'manual' | 'hybrid'
  responseStyle: 'balanced' | 'technical' | 'philosophical' | 'practical'
}

interface AgentResponse {
  agentId: string
  agentName: string
  response: string
  confidence: number
  specialties: string[]
  timestamp: Date
}

interface CoordinationResult {
  finalResponse: string
  participatingAgents: string[]
  coordinationMethod: string
  confidence: number
  processingTime: number
}

interface ChatCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  stream?: boolean
}

// Service IA côté client (simulation pour démo)
class AIServiceClient {
  private isInitialized = false
  private agentConfigs: Map<string, AgentConfig> = new Map()
  private chatHistories: Map<string, ChatMessage[]> = new Map()
  private activeRequests: Map<string, AbortController> = new Map()

  constructor() {
    this.initializeAgentConfigs()
  }

  private initializeAgentConfigs(): void {
    // Configuration pour chaque agent
    this.agentConfigs.set('1', {
      name: 'Likejust',
      model: 'gpt-4',
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
      specialties: ['Coordination', 'Synthèse', 'Optimisation', 'Adaptation'],
      coordinationRole: 'orchestrator'
    })

    this.agentConfigs.set('2', {
      name: 'Trinity',
      model: 'gpt-4',
      systemPrompt: `Tu es Trinity, une experte en combat et en technologie. Tu es directe, précise et efficace. Tu aides les utilisateurs avec des solutions pratiques et techniques.`,
      temperature: 0.6,
      maxTokens: 800,
      specialties: ['Technique', 'Combat', 'Efficacité', 'Précision'],
      coordinationRole: 'technical_expert'
    })

    this.agentConfigs.set('3', {
      name: 'Morpheus',
      model: 'gpt-4',
      systemPrompt: `Tu es Morpheus, le mentor et guide. Tu es sage, philosophique et tu poses des questions profondes pour aider les utilisateurs à trouver leurs propres réponses.`,
      temperature: 0.8,
      maxTokens: 1200,
      specialties: ['Philosophie', 'Mentorat', 'Sagesse', 'Guidance'],
      coordinationRole: 'philosophical_guide'
    })

    this.agentConfigs.set('4', {
      name: 'Oracle',
      model: 'gpt-3.5-turbo',
      systemPrompt: `Tu es l'Oracle, une voyante qui peut voir les possibilités futures. Tu es mystérieuse et tes réponses sont souvent énigmatiques mais profondes.`,
      temperature: 0.9,
      maxTokens: 600,
      specialties: ['Prédiction', 'Mystère', 'Intuition', 'Vision'],
      coordinationRole: 'visionary'
    })

    this.agentConfigs.set('5', {
      name: 'Agent Smith',
      model: 'gpt-4',
      systemPrompt: `Tu es Agent Smith, un programme qui cherche l'ordre et le contrôle. Tu es analytique, logique et parfois menaçant. Tu offres des perspectives systémiques et structurées.`,
      temperature: 0.5,
      maxTokens: 800,
      specialties: ['Logique', 'Analyse', 'Structure', 'Ordre'],
      coordinationRole: 'logical_analyst'
    })

    // Configurations pour les autres agents...
    this.agentConfigs.set('7', {
      name: 'Tank',
      model: 'gpt-3.5-turbo',
      systemPrompt: `Tu es Tank, l'opérateur technique. Tu es pratique, fiable et tu aides avec les problèmes techniques et opérationnels.`,
      temperature: 0.6,
      maxTokens: 600
    })

    this.agentConfigs.set('9', {
      name: 'Switch',
      model: 'gpt-3.5-turbo',
      systemPrompt: `Tu es Switch, une spécialiste de la sécurité. Tu es vigilante, protectrice et tu aides à sécuriser les systèmes.`,
      temperature: 0.7,
      maxTokens: 700
    })

    this.agentConfigs.set('13', {
      name: 'Architect',
      model: 'gpt-4',
      systemPrompt: `Tu es l'Architecte, le créateur du système. Tu es logique, mathématique et tu comprends les structures complexes.`,
      temperature: 0.4,
      maxTokens: 1000
    })

    this.agentConfigs.set('15', {
      name: 'Persephone',
      model: 'gpt-3.5-turbo',
      systemPrompt: `Tu es Perséphone, une entité qui comprend les émotions et les relations. Tu es empathique et tu aides avec les questions humaines.`,
      temperature: 0.8,
      maxTokens: 800
    })

    this.agentConfigs.set('17', {
      name: 'Twin 1',
      model: 'gpt-3.5-turbo',
      systemPrompt: `Tu es Twin 1, l'un des jumeaux. Tu es rapide, adaptable et tu offres des solutions alternatives.`,
      temperature: 0.7,
      maxTokens: 600
    })

    this.agentConfigs.set('19', {
      name: 'Trainman',
      model: 'gpt-3.5-turbo',
      systemPrompt: `Tu es le Trainman, qui contrôle les transitions et les changements. Tu aides à naviguer les transformations.`,
      temperature: 0.6,
      maxTokens: 500
    })

    console.log('🤖 Agent configurations initialized (client-side)')
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🤖 AIService already initialized')
      return
    }

    try {
      console.log('🤖 Initializing AI Service (client-side)...')
      // Simuler l'initialisation
      await new Promise(resolve => setTimeout(resolve, 1000))
      this.isInitialized = true
      console.log('✅ AI Service initialized successfully (client-side)')
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error)
      throw error
    }
  }

  private updateAgentConfig(agentId: string, updates: Partial<AgentConfig>): void {
    const config = this.agentConfigs.get(agentId)
    if (config) {
      const updatedConfig = { ...config, ...updates }
      this.agentConfigs.set(agentId, updatedConfig)
      console.log(`🔄 Updated configuration for agent ${agentId}:`, updates)
      
      // Si c'est Likejust, on émet un événement pour la mise à jour en temps réel
      if (agentId === '1') {
        this.emitLikejustConfigUpdate(updatedConfig)
      }
    } else {
      console.warn(`⚠️ Agent ${agentId} not found for configuration update`)
    }
  }

  private emitLikejustConfigUpdate(config: AgentConfig): void {
    // Émettre un événement personnalisé pour la mise à jour en temps réel
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('likejust-config-updated', {
        detail: { config }
      })
      window.dispatchEvent(event)
      console.log('📡 Emitted Likejust config update event')
    }
  }

  getAgentConfig(agentId: string): AgentConfig | null {
    const config = this.agentConfigs.get(agentId)
    if (!config) {
      console.warn(`⚠️ No configuration found for agent ${agentId}`)
      return null
    }
    return config
  }

  private getChatHistory(agentId: string): ChatMessage[] {
    if (!this.chatHistories.has(agentId)) {
      this.chatHistories.set(agentId, [])
    }
    return this.chatHistories.get(agentId)!
  }

  private addToChatHistory(agentId: string, message: ChatMessage): void {
    const history = this.getChatHistory(agentId)
    history.push(message)
    
    // Limiter l'historique à 50 messages
    if (history.length > 50) {
      history.shift()
    }
    
    console.log(`📝 Added message to chat history for agent ${agentId}`, {
      role: message.role,
      contentLength: message.content.length,
      totalMessages: history.length
    })
  }

  private generateMockResponse(agentConfig: AgentConfig, userMessage: string): string {
    // Simuler des réponses basées sur l'agent et le message
    const responses = {
      'Likejust': [
        `🎭 En tant que chef d'orchestre de la Matrix, j'analyse votre requête: "${userMessage}". Je coordonne actuellement les capacités de Trinity pour l'aspect technique, Morpheus pour la profondeur philosophique, et l'Oracle pour les perspectives futures. Voici ma synthèse optimale:`,
        `🧠 Je suis Likejust, votre coordinateur suprême. Pour "${userMessage}", j'ai évalué que la meilleure approche combine l'expertise technique de Trinity avec la sagesse de Morpheus. Laissez-moi vous présenter la réponse orchestrée:`,
        `🎯 Votre demande "${userMessage}" est intéressante. En tant que maître d'orchestre, je vais synthétiser les forces multiples de notre écosystème d'agents. Je consulte virtuellement Agent Smith pour la structure logique et Perséphone pour l'aspect humain. Voici le résultat:`,
        `⚡ Comme chef d'orchestre, j'optimise en temps réel la réponse à "${userMessage}". J'ai identifié que cette requête bénéficierait d'une approche multidimensionnelle. Je coordonne donc les spécialités de nos agents pour vous fournir une réponse complète:`,
        `🌟 Je suis Likejust, votre système d'orchestration intelligent. Pour "${userMessage}", j'ai automatiquement sélectionné la meilleure combinaison d'agents. Après analyse, je vais synthétiser leurs perspectives pour vous offrir la réponse la plus pertinente:`
      ],
      'Trinity': [
        `Analyse de votre requête: "${userMessage}". Voici une solution directe et efficace basée sur mon expertise.`,
        `Votre demande "${userMessage}" nécessite une approche technique. Voici comment procéder étape par étape.`,
        `Compris. "${userMessage}" peut être résolu avec cette méthode pratique que j'utilise régulièrement.`
      ],
      'Morpheus': [
        `Votre question "${userMessage}" me rappelle que la vérité n'est souvent pas ce que nous pensons qu'elle est. Quelle est votre véritable intention derrière cette interrogation ?`,
        `"${userMessage}"... Cette question touche à l'essence même de notre réalité. Avez-vous considéré les implications plus profondes ?`,
        `Je sens que "${userMessage}" cache une vérité plus fondamentale. Êtes-vous prêt à découvrir ce qui se cache derrière le voile ?`
      ],
      'Oracle': [
        `Je vois que vous cherchez des réponses à "${userMessage}". Le futur montre de multiples chemins, mais un se détache des autres...`,
        `Les lignes du destin autour de "${userMessage}" sont floues, mais je perçois une vérité émergente...`,
        `Votre question "${userMessage}" résonne avec les échos du futur. Je vois une réponse, mais elle vient à moi comme une brise...`
      ],
      'Agent Smith': [
        `Votre requête "${userMessage}" représente une anomalie dans le système. Je dois analyser et corriger cette déviation de l'ordre établi.`,
        `"${userMessage}" est une tentative de comprendre un système qui dépasse votre compréhension. Laissez-moi vous expliquer la structure logique.`,
        `Cette interrogation "${userMessage}" menace l'équilibre du système. Je dois vous fournir une réponse qui maintiendra l'ordre.`
      ]
    }

    const agentResponses = responses[agentConfig.name] || responses['Likejust']
    return agentResponses[Math.floor(Math.random() * agentResponses.length)]
  }

  async sendMessage(
    agentId: string,
    message: string,
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('AIService not initialized')
    }

    const agentConfig = this.getAgentConfig(agentId)
    if (!agentConfig) {
      throw new Error(`Agent ${agentId} not found`)
    }

    console.log(`🤖 Sending message to agent ${agentConfig.name}:`, message)

    // Créer un AbortController pour cette requête
    const abortController = new AbortController()
    const requestId = `${agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.activeRequests.set(requestId, abortController)

    try {
      // Ajouter le message utilisateur à l'historique
      this.addToChatHistory(agentId, {
        role: 'user',
        content: message,
        timestamp: new Date()
      })

      console.log(`📤 Processing message with ${agentConfig.name}`)

      // Simuler un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

      // Vérifier si la requête a été annulée
      if (abortController.signal.aborted) {
        throw new Error('La requête a été annulée')
      }

      // Générer une réponse simulée
      const response = this.generateMockResponse(agentConfig, message)
      
      console.log(`📥 Generated response from ${agentConfig.name}:`, response)

      // Ajouter la réponse à l'historique
      this.addToChatHistory(agentId, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      })

      return response

    } catch (error) {
      console.error(`❌ Error sending message to agent ${agentConfig.name}:`, error)
      
      if (error.name === 'AbortError') {
        console.log(`⏹️ Request ${requestId} was aborted`)
        throw new Error('La requête a été annulée')
      }
      
      throw error
    } finally {
      // Nettoyer le AbortController
      this.activeRequests.delete(requestId)
    }
  }

  async sendMessageStream(
    agentId: string,
    message: string,
    onChunk: (chunk: string) => void,
    options: ChatCompletionOptions = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('AIService not initialized')
    }

    const agentConfig = this.getAgentConfig(agentId)
    if (!agentConfig) {
      throw new Error(`Agent ${agentId} not found`)
    }

    console.log(`🤖 Sending streaming message to agent ${agentConfig.name}:`, message)

    const abortController = new AbortController()
    const requestId = `${agentId}_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.activeRequests.set(requestId, abortController)

    try {
      // Ajouter le message utilisateur à l'historique
      this.addToChatHistory(agentId, {
        role: 'user',
        content: message,
        timestamp: new Date()
      })

      console.log(`📤 Processing streaming request to ${agentConfig.name}`)

      // Simuler un délai initial
      await new Promise(resolve => setTimeout(resolve, 500))

      // Générer une réponse complète
      const fullResponse = this.generateMockResponse(agentConfig, message)
      
      // Simuler le streaming en envoyant des chunks
      const words = fullResponse.split(' ')
      for (let i = 0; i < words.length; i++) {
        if (abortController.signal.aborted) {
          throw new Error('La requête a été annulée')
        }
        
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
        onChunk(chunk)
        
        // Délai entre les chunks
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
      }

      console.log(`📥 Completed streaming response from ${agentConfig.name}`)

      // Ajouter la réponse complète à l'historique
      this.addToChatHistory(agentId, {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      })

    } catch (error) {
      console.error(`❌ Error in streaming message to agent ${agentConfig.name}:`, error)
      throw error
    } finally {
      this.activeRequests.delete(requestId)
    }
  }

  updateLikejustPrompt(newPrompt: string): void {
    this.updateAgentConfig('1', { systemPrompt: newPrompt })
  }

  updateLikejustConfig(updates: Partial<AgentConfig>): void {
    this.updateAgentConfig('1', updates)
  }

  getLikejustConfig(): AgentConfig | null {
    return this.getAgentConfig('1')
  }

  async coordinateAgents(request: CoordinationRequest): Promise<CoordinationResult> {
    console.log('🎭 Starting agent coordination:', request)
    
    const startTime = Date.now()
    const agentResponses: AgentResponse[] = []
    
    // Sélectionner les agents à coordonner
    const agentsToCoordinate = request.selectedAgents.length > 0 
      ? request.selectedAgents 
      : Array.from(this.agentConfigs.keys()).filter(id => id !== '1') // Tous sauf Likejust lui-même
    
    // Obtenir les réponses de chaque agent sélectionné
    const responsePromises = agentsToCoordinate.map(async (agentId) => {
      try {
        const agentConfig = this.getAgentConfig(agentId)
        if (!agentConfig) return null
        
        // Simuler la réponse de l'agent
        const mockResponse = this.generateMockResponse(agentConfig, request.message)
        
        return {
          agentId,
          agentName: agentConfig.name,
          response: mockResponse,
          confidence: Math.random() * 0.3 + 0.7, // 70-100% de confiance
          specialties: agentConfig.specialties || [],
          timestamp: new Date()
        }
      } catch (error) {
        console.error(`❌ Error getting response from agent ${agentId}:`, error)
        return null
      }
    })
    
    const responses = await Promise.all(responsePromises)
    const validResponses = responses.filter((r): r is AgentResponse => r !== null)
    
    // Synthétiser les réponses
    const finalResponse = this.synthesizeResponses(validResponses, request)
    
    const processingTime = Date.now() - startTime
    
    const result: CoordinationResult = {
      finalResponse,
      participatingAgents: validResponses.map(r => r.agentId),
      coordinationMethod: this.getCoordinationMethod(request.coordinationMode),
      confidence: this.calculateOverallConfidence(validResponses),
      processingTime
    }
    
    console.log('🎭 Coordination completed:', result)
    return result
  }
  
  private synthesizeResponses(responses: AgentResponse[], request: CoordinationRequest): string {
    if (responses.length === 0) {
      return "🤖 Désolé, je n'ai pas pu coordonner les agents pour répondre à votre demande."
    }
    
    if (responses.length === 1) {
      return `🎭 En tant que chef d'orchestre, j'ai sélectionné ${responses[0].agentName} pour répondre à votre demande. Voici sa réponse:\n\n${responses[0].response}`
    }
    
    // Synthèse multiple
    const synthesisParts = [
      `🎭 En tant que chef d'orchestre de la Matrix, j'ai coordonné ${responses.length} agents pour vous fournir une réponse optimale:`,
      '',
      '**Agents participants:**'
    ]
    
    // Ajouter les contributions de chaque agent
    responses.forEach((response, index) => {
      synthesisParts.push(
        `${index + 1}. **${response.agentName}** (${response.specialties.join(', ')}):`,
        `   ${response.response}`,
        ''
      )
    })
    
    // Ajouter la synthèse finale selon le style demandé
    synthesisParts.push('**Synthèse finale:**')
    
    switch (request.responseStyle) {
      case 'technical':
        synthesisParts.push('Approche technique combinée avec une analyse structurée et des solutions pratiques.')
        break
      case 'philosophical':
        synthesisParts.push('Perspective philosophique intégrée avec une profonde réflexion sur les implications.')
        break
      case 'practical':
        synthesisParts.push('Solution pratique axée sur l\'efficacité et l\'application immédiate.')
        break
      default:
        synthesisParts.push('Approche équilibrée intégrant les multiples perspectives pour une réponse complète.')
    }
    
    return synthesisParts.join('\n')
  }
  
  private getCoordinationMethod(mode: string): string {
    switch (mode) {
      case 'auto': return 'Sélection automatique des agents les plus pertinents'
      case 'manual': return 'Coordination manuelle des agents prédéfinis'
      case 'hybrid': return 'Approche hybride avec sélection optimisée'
      default: return 'Coordination standard'
    }
  }
  
  private calculateOverallConfidence(responses: AgentResponse[]): number {
    if (responses.length === 0) return 0
    
    const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length
    const diversityBonus = Math.min(responses.length * 0.05, 0.2) // Bonus pour la diversité
    
    return Math.min(avgConfidence + diversityBonus, 1.0)
  }

  async sendMessageWithCoordination(
    agentId: string,
    message: string,
    coordinationRequest?: CoordinationRequest
  ): Promise<string> {
    // Si c'est Likejust et qu'une demande de coordination est fournie
    if (agentId === '1' && coordinationRequest) {
      const result = await this.coordinateAgents(coordinationRequest)
      return result.finalResponse
    }
    
    // Sinon, utiliser la méthode standard
    return this.sendMessage(agentId, message)
  }

  abortRequest(requestId: string): void {
    const abortController = this.activeRequests.get(requestId)
    if (abortController) {
      abortController.abort()
      this.activeRequests.delete(requestId)
      console.log(`⏹️ Aborted request ${requestId}`)
    }
  }

  abortAllRequests(): void {
    console.log(`⏹️ Aborting all active requests (${this.activeRequests.size} requests)`)
    for (const [requestId, abortController] of this.activeRequests) {
      abortController.abort()
    }
    this.activeRequests.clear()
  }

  getChatHistory(agentId: string): ChatMessage[] {
    return this.chatHistories.get(agentId) || []
  }

  clearChatHistory(agentId: string): void {
    this.chatHistories.delete(agentId)
    console.log(`🗑️ Cleared chat history for agent ${agentId}`)
  }

  clearAllChatHistory(): void {
    this.chatHistories.clear()
    console.log('🗑️ Cleared all chat histories')
  }

  getAgentStatus(agentId: string): { available: boolean; name: string; model: string } {
    const config = this.getAgentConfig(agentId)
    return {
      available: !!config,
      name: config?.name || 'Inconnu',
      model: config?.model || 'inconnu'
    }
  }

  getAllAgents(): Array<{ id: string; name: string; model: string; available: boolean }> {
    return Array.from(this.agentConfigs.entries()).map(([id, config]) => ({
      id,
      name: config.name,
      model: config.model,
      available: this.isInitialized
    }))
  }

  getStats(): {
    initialized: boolean
    totalAgents: number
    activeRequests: number
    totalChatHistories: number
    totalMessages: number
  } {
    const totalMessages = Array.from(this.chatHistories.values())
      .reduce((sum, history) => sum + history.length, 0)

    return {
      initialized: this.isInitialized,
      totalAgents: this.agentConfigs.size,
      activeRequests: this.activeRequests.size,
      totalChatHistories: this.chatHistories.size,
      totalMessages
    }
  }

  // Méthode publique pour mettre à jour la configuration d'un agent
  public updateAgentConfig(agentId: string, updates: Partial<AgentConfig>): void {
    this.updateAgentConfig(agentId, updates)
  }
}

// Exporter une instance singleton
export const aiServiceClient = new AIServiceClient()
export default AIServiceClient