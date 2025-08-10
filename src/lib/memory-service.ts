import { db } from '@/lib/db'

export interface MemoryData {
  id?: string
  agentId: string
  userId?: string
  type: 'conversation_summary' | 'user_preference' | 'learned_fact' | 'context_info'
  title: string
  content: string
  tags?: string[]
  importance?: number
  embedding?: string
}

export interface SearchResult {
  id: string
  agentId: string
  userId?: string
  type: string
  title: string
  content: string
  tags?: string[]
  importance: number
  accessCount: number
  lastAccessed: Date
  createdAt: Date
  agent?: {
    id: string
    name: string
    emoji: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface SearchOptions {
  agentId?: string
  userId?: string
  type?: string
  tags?: string[]
  limit?: number
  offset?: number
}

class MemoryService {
  /**
   * Créer une nouvelle mémoire
   */
  async createMemory(memoryData: MemoryData): Promise<MemoryData> {
    const { agentId, userId, type, title, content, tags, importance, embedding } = memoryData

    const memory = await db.memory.create({
      data: {
        agentId,
        userId: userId || null,
        type,
        title,
        content,
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        importance: importance || 1,
        embedding: embedding || null,
        lastAccessed: new Date()
      }
    })

    console.log(`💾 Memory created: ${memory.id} (${type}) for agent ${agentId}`)

    return {
      id: memory.id,
      agentId: memory.agentId,
      userId: memory.userId || undefined,
      type: memory.type as any,
      title: memory.title,
      content: memory.content,
      tags: memory.tags ? JSON.parse(memory.tags) : undefined,
      importance: memory.importance,
      embedding: memory.embedding || undefined
    }
  }

  /**
   * Récupérer les mémoires d'un agent
   */
  async getMemories(agentId: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { userId, type, limit = 50, offset = 0 } = options

    const where: any = { agentId }

    if (userId) {
      where.userId = userId
    }

    if (type) {
      where.type = type
    }

    const memories = await db.memory.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, emoji: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { importance: 'desc' },
        { lastAccessed: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    return memories.map(memory => ({
      id: memory.id,
      agentId: memory.agentId,
      userId: memory.userId || undefined,
      type: memory.type,
      title: memory.title,
      content: memory.content,
      tags: memory.tags ? JSON.parse(memory.tags) : undefined,
      importance: memory.importance,
      accessCount: memory.accessCount,
      lastAccessed: memory.lastAccessed,
      createdAt: memory.createdAt,
      agent: memory.agent,
      user: memory.user
    }))
  }

  /**
   * Rechercher dans la mémoire
   */
  async searchMemories(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { agentId, userId, type, tags, limit = 20, offset = 0 } = options

    const where: any = {}

    if (agentId) {
      where.agentId = agentId
    }

    if (userId) {
      where.userId = userId
    }

    if (type) {
      where.type = type
    }

    // Recherche textuelle simple
    const OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ]

    // Ajouter les tags à la recherche si fournis
    if (tags && tags.length > 0) {
      OR.push(
        ...tags.map(tag => ({
          tags: { contains: tag, mode: 'insensitive' }
        }))
      )
    }

    where.OR = OR

    const memories = await db.memory.findMany({
      where,
      include: {
        agent: {
          select: { id: true, name: true, emoji: true }
        },
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { importance: 'desc' },
        { accessCount: 'desc' },
        { lastAccessed: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    // Mettre à jour le compteur d'accès
    if (memories.length > 0) {
      await db.memory.updateMany({
        where: {
          id: { in: memories.map(m => m.id) }
        },
        data: {
          accessCount: { increment: 1 },
          lastAccessed: new Date()
        }
      })
    }

    console.log(`🔍 Memory search "${query}": found ${memories.length} results`)

    return memories.map(memory => ({
      id: memory.id,
      agentId: memory.agentId,
      userId: memory.userId || undefined,
      type: memory.type,
      title: memory.title,
      content: memory.content,
      tags: memory.tags ? JSON.parse(memory.tags) : undefined,
      importance: memory.importance,
      accessCount: memory.accessCount,
      lastAccessed: memory.lastAccessed,
      createdAt: memory.createdAt,
      agent: memory.agent,
      user: memory.user
    }))
  }

  /**
   * Mettre à jour une mémoire
   */
  async updateMemory(memoryId: string, updates: Partial<MemoryData>): Promise<MemoryData | null> {
    try {
      const updateData: any = { ...updates, updatedAt: new Date() }

      // Gérer les champs JSON
      if (updates.tags) {
        updateData.tags = JSON.stringify(updates.tags)
      }

      const memory = await db.memory.update({
        where: { id: memoryId },
        data: updateData
      })

      return {
        id: memory.id,
        agentId: memory.agentId,
        userId: memory.userId || undefined,
        type: memory.type as any,
        title: memory.title,
        content: memory.content,
        tags: memory.tags ? JSON.parse(memory.tags) : undefined,
        importance: memory.importance,
        embedding: memory.embedding || undefined
      }
    } catch (error) {
      console.error(`Error updating memory ${memoryId}:`, error)
      return null
    }
  }

  /**
   * Supprimer une mémoire
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    try {
      await db.memory.delete({
        where: { id: memoryId }
      })
      console.log(`🗑️ Memory deleted: ${memoryId}`)
      return true
    } catch (error) {
      console.error(`Error deleting memory ${memoryId}:`, error)
      return false
    }
  }

  /**
   * Créer un résumé de conversation
   */
  async createConversationSummary(
    agentId: string,
    userId: string,
    conversationId: string,
    messages: Array<{ role: string; content: string; timestamp: Date }>,
    title?: string
  ): Promise<MemoryData> {
    // Créer un résumé simple des messages
    const summaryPoints = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content.substring(0, 100)}...`)
      .join('\n')

    const summaryContent = `Résumé de la conversation ${conversationId}:\n\n${summaryPoints}\n\nNombre de messages: ${messages.length}\nDate: ${new Date().toISOString()}`

    return this.createMemory({
      agentId,
      userId,
      type: 'conversation_summary',
      title: title || `Conversation du ${new Date().toLocaleDateString('fr-FR')}`,
      content: summaryContent,
      tags: ['conversation', 'summary', conversationId],
      importance: 3
    })
  }

  /**
   * Extraire et stocker les préférences utilisateur d'une conversation
   */
  async extractUserPreferences(
    agentId: string,
    userId: string,
    messages: Array<{ role: string; content: string }>
  ): Promise<MemoryData[]> {
    const preferences: MemoryData[] = []
    
    // Chercher des patterns indiquant des préférences
    const userMessages = messages.filter(msg => msg.role === 'user')
    
    for (const message of userMessages) {
      const content = message.content.toLowerCase()
      
      // Détecter des préférences communes
      const preferencePatterns = [
        { pattern: /j'aime|je préfère|j'adore|j'apprécie/, type: 'préférence positive' },
        { pattern: /je déteste|je n'aime pas|je déteste|je déconseille/, type: 'préférence négative' },
        { pattern: /s'il te plaît|svp|pourrais-tu|est-ce que tu peux/, type: 'politesse' },
        { pattern: /merci|thanks|thank you/, type: 'gratitude' },
        { pattern: /explique|détaille|décris|comment/, type: "style d'apprentissage" },
        { pattern: /résumé|court|concis|bref/, type: 'préférence de longueur' }
      ]
      
      for (const { pattern, type } of preferencePatterns) {
        if (pattern.test(content)) {
          const preference = await this.createMemory({
            agentId,
            userId,
            type: 'user_preference',
            title: `Préférence: ${type}`,
            content: `L'utilisateur a exprimé une préférence de type "${type}" dans le message: "${message.content}"`,
            tags: ['préférence', type, 'utilisateur'],
            importance: 5
          })
          preferences.push(preference)
        }
      }
    }
    
    return preferences
  }

  /**
   * Récupérer le contexte pertinent pour une conversation
   */
  async getRelevantContext(agentId: string, userId?: string, query?: string, limit = 10): Promise<string> {
    const contextMemories: SearchResult[] = []
    
    // 1. Récupérer les mémoires les plus importantes
    const importantMemories = await this.getMemories(agentId, { 
      userId, 
      limit: 5 
    })
    contextMemories.push(...importantMemories)
    
    // 2. Si une requête est fournie, faire une recherche sémantique
    if (query) {
      const searchResults = await this.searchMemories(query, { 
        agentId, 
        userId, 
        limit: 5 
      })
      contextMemories.push(...searchResults)
    }
    
    // 3. Dédoublonner et trier par importance
    const uniqueMemories = contextMemories
      .filter((memory, index, self) => 
        index === self.findIndex(m => m.id === memory.id)
      )
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit)
    
    // Formater le contexte
    if (uniqueMemories.length === 0) {
      return ''
    }
    
    const contextText = uniqueMemories.map(memory => 
      `[${memory.type.toUpperCase()}] ${memory.title}:\n${memory.content}`
    ).join('\n\n')
    
    return `Contexte pertinent:\n\n${contextText}\n\n---\n\n`
  }
}

// Exporter une instance singleton
export const memoryService = new MemoryService()
export default MemoryService