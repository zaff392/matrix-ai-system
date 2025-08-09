import ZAI from 'z-ai-web-dev-sdk'
import { memoryService } from './memory-service'

interface AgentConfig {
  name: string
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  stream?: boolean
  userId?: string
  conversationId?: string
  useMemory?: boolean
  memoryLimit?: number
}

class AIService {
  private zai: ZAI | null = null
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
      systemPrompt: `Tu es Likejust, un assistant IA expert dans l'univers Matrix. Tu es philosophique, réfléchi et tu aides les utilisateurs à naviguer dans le système. Tu réponds toujours en français avec un style élégant et mystérieux.`,
      temperature: 0.7,
      maxTokens: 1000
    })

    this.agentConfigs.set('2', {
      name: 'Trinity',
      model: 'gpt-4',
      systemPrompt: `Tu es Trinity, une experte en combat et en technologie. Tu es directe, précise et efficace. Tu aides les utilisateurs avec des solutions pratiques et techniques.`,
      temperature: 0.6,
      maxTokens: 800
    })

    this.agentConfigs.set('3', {
      name: 'Morpheus',
      model: 'gpt-4',
      systemPrompt: `Tu es Morpheus, le mentor et guide. Tu es sage, philosophique et tu poses des questions profondes pour aider les utilisateurs à trouver leurs propres réponses.`,
      temperature: 0.8,
      maxTokens: 1200
    })

    this.agentConfigs.set('4', {
      name: 'Oracle',
      model: 'gpt-3.5-turbo',
      systemPrompt: `Tu es l'Oracle, une voyante qui peut voir les possibilités futures. Tu es mystérieuse et tes réponses sont souvent énigmatiques mais profondes.`,
      temperature: 0.9,
      maxTokens: 600
    })

    this.agentConfigs.set('5', {
      name: 'Agent Smith',
      model: 'gpt-4',
      systemPrompt: `Tu es Agent Smith, un programme qui cherche l'ordre et le contrôle. Tu es analytique, logique et parfois menaçant. Tu offres des perspectives systémiques et structurées.`,
      temperature: 0.5,
      maxTokens: 800
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

    console.log('🤖 Agent configurations initialized')
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🤖 AIService already initialized')
      return
    }

    try {
      console.log('🤖 Initializing ZAI SDK...')
      this.zai = await ZAI.create()
      this.isInitialized = true
      console.log('✅ ZAI SDK initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize ZAI SDK:', error)
      throw error
    }
  }

  private getAgentConfig(agentId: string): AgentConfig | null {
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
    
    // Limiter l'historique à 50 messages pour éviter les problèmes de mémoire
    if (history.length > 50) {
      history.shift()
    }
    
    console.log(`📝 Added message to chat history for agent ${agentId}`, {
      role: message.role,
      contentLength: message.content.length,
      totalMessages: history.length
    })
  }

  async sendMessage(
    agentId: string,
    message: string,
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    if (!this.isInitialized || !this.zai) {
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

      // Préparer les messages pour l'API
      const chatHistory = this.getChatHistory(agentId)
      const apiMessages: any[] = []

      // Récupérer le contexte de mémoire si activé
      let memoryContext = ''
      if (options.useMemory !== false && options.userId) {
        try {
          memoryContext = await memoryService.getRelevantContext(
            agentId, 
            options.userId, 
            message, 
            options.memoryLimit || 5
          )
          console.log(`🧠 Retrieved memory context for agent ${agentId}`)
        } catch (error) {
          console.warn('⚠️ Failed to retrieve memory context:', error)
        }
      }

      // Ajouter le system prompt avec contexte mémoire
      const systemPrompt = options.systemPrompt || agentConfig.systemPrompt
      if (systemPrompt) {
        const enhancedSystemPrompt = memoryContext 
          ? `${systemPrompt}\n\n${memoryContext}`
          : systemPrompt
        
        apiMessages.push({
          role: 'system',
          content: enhancedSystemPrompt
        })
      }

      // Ajouter l'historique de conversation (limiter les 10 derniers messages pour le contexte)
      const recentHistory = chatHistory.slice(-10)
      for (const chatMessage of recentHistory) {
        apiMessages.push({
          role: chatMessage.role,
          content: chatMessage.content
        })
      }

      console.log(`📤 Sending ${apiMessages.length} messages to ${agentConfig.name}`)

      // Appeler l'API ZAI
      const completion = await this.zai.chat.completions.create({
        messages: apiMessages,
        model: options.model || agentConfig.model,
        temperature: options.temperature ?? agentConfig.temperature,
        max_tokens: options.maxTokens ?? agentConfig.maxTokens,
        stream: options.stream ?? false
      })

      // Extraire la réponse
      const response = completion.choices[0]?.message?.content || 'Pas de réponse'
      
      console.log(`📥 Received response from ${agentConfig.name}:`, response)

      // Ajouter la réponse à l'historique
      this.addToChatHistory(agentId, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      })

      // Stocker les informations importantes en mémoire si userId est fourni
      if (options.userId && options.conversationId) {
        try {
          // Extraire et stocker les préférences utilisateur
          const messages = [
            ...recentHistory,
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: response, timestamp: new Date() }
          ]
          
          await memoryService.extractUserPreferences(agentId, options.userId, messages)
          
          // Si la conversation est longue, créer un résumé
          if (messages.length > 10) {
            await memoryService.createConversationSummary(
              agentId,
              options.userId,
              options.conversationId,
              messages
            )
          }
          
          console.log(`💾 Stored conversation insights for agent ${agentId}`)
        } catch (error) {
          console.warn('⚠️ Failed to store conversation insights:', error)
        }
      }

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
    if (!this.isInitialized || !this.zai) {
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

      // Préparer les messages pour l'API
      const chatHistory = this.getChatHistory(agentId)
      const apiMessages: any[] = []

      // Récupérer le contexte de mémoire si activé
      let memoryContext = ''
      if (options.useMemory !== false && options.userId) {
        try {
          memoryContext = await memoryService.getRelevantContext(
            agentId, 
            options.userId, 
            message, 
            options.memoryLimit || 5
          )
          console.log(`🧠 Retrieved memory context for agent ${agentId}`)
        } catch (error) {
          console.warn('⚠️ Failed to retrieve memory context:', error)
        }
      }

      const systemPrompt = options.systemPrompt || agentConfig.systemPrompt
      if (systemPrompt) {
        const enhancedSystemPrompt = memoryContext 
          ? `${systemPrompt}\n\n${memoryContext}`
          : systemPrompt
        
        apiMessages.push({
          role: 'system',
          content: enhancedSystemPrompt
        })
      }

      const recentHistory = chatHistory.slice(-10)
      for (const chatMessage of recentHistory) {
        apiMessages.push({
          role: chatMessage.role,
          content: chatMessage.content
        })
      }

      console.log(`📤 Sending streaming request to ${agentConfig.name}`)

      // Appeler l'API ZAI avec streaming
      const completion = await this.zai.chat.completions.create({
        messages: apiMessages,
        model: options.model || agentConfig.model,
        temperature: options.temperature ?? agentConfig.temperature,
        max_tokens: options.maxTokens ?? agentConfig.maxTokens,
        stream: true
      })

      let fullResponse = ''
      
      // Traiter le streaming
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          fullResponse += content
          onChunk(content)
        }
      }

      console.log(`📥 Completed streaming response from ${agentConfig.name}`)

      // Ajouter la réponse complète à l'historique
      this.addToChatHistory(agentId, {
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      })

      // Stocker les informations importantes en mémoire si userId est fourni
      if (options.userId && options.conversationId) {
        try {
          // Extraire et stocker les préférences utilisateur
          const messages = [
            ...recentHistory,
            { role: 'user', content: message, timestamp: new Date() },
            { role: 'assistant', content: fullResponse, timestamp: new Date() }
          ]
          
          await memoryService.extractUserPreferences(agentId, options.userId, messages)
          
          // Si la conversation est longue, créer un résumé
          if (messages.length > 10) {
            await memoryService.createConversationSummary(
              agentId,
              options.userId,
              options.conversationId,
              messages
            )
          }
          
          console.log(`💾 Stored conversation insights for agent ${agentId}`)
        } catch (error) {
          console.warn('⚠️ Failed to store conversation insights:', error)
        }
      }

    } catch (error) {
      console.error(`❌ Error in streaming message to agent ${agentConfig.name}:`, error)
      throw error
    } finally {
      this.activeRequests.delete(requestId)
    }
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

  // Méthodes pour la gestion de la mémoire
  async getAgentMemories(agentId: string, userId?: string, type?: string, limit = 20) {
    return memoryService.getMemories(agentId, { userId, type, limit })
  }

  async searchAgentMemories(agentId: string, query: string, userId?: string, limit = 10) {
    return memoryService.searchMemories(query, { agentId, userId, limit })
  }

  async createAgentMemory(memoryData: {
    agentId: string
    userId?: string
    type: 'conversation_summary' | 'user_preference' | 'learned_fact' | 'context_info'
    title: string
    content: string
    tags?: string[]
    importance?: number
  }) {
    return memoryService.createMemory(memoryData)
  }

  async clearAgentMemory(agentId: string, userId?: string, type?: string) {
    try {
      const memories = await memoryService.getMemories(agentId, { userId, type, limit: 1000 })
      let deletedCount = 0
      
      for (const memory of memories) {
        if (await memoryService.deleteMemory(memory.id)) {
          deletedCount++
        }
      }
      
      console.log(`🗑️ Cleared ${deletedCount} memories for agent ${agentId}`)
      return deletedCount
    } catch (error) {
      console.error(`Error clearing memories for agent ${agentId}:`, error)
      return 0
    }
  }
}

// Exporter une instance singleton
export const aiService = new AIService()
export default AIService