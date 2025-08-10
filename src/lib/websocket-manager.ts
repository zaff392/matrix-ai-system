interface WebSocketMessage {
  type: string
  payload: any
  timestamp: number
  id: string
}

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectInterval?: number
  cacheTTL?: number
  enableLogging?: boolean
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectAttempts: number
  private reconnectInterval: number
  private cacheTTL: number
  private enableLogging: boolean
  private url: string
  private isConnected: boolean = false
  private reconnectTimeout: NodeJS.Timeout | null = null
  private messageQueue: WebSocketMessage[] = []
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map()
  private cache: Map<string, CacheEntry> = new Map()
  private connectionId: string = this.generateConnectionId()

  constructor(config: WebSocketConfig) {
    this.url = config.url
    this.reconnectAttempts = config.reconnectAttempts || 5
    this.reconnectInterval = config.reconnectInterval || 3000
    this.cacheTTL = config.cacheTTL || 300000 // 5 minutes default
    this.enableLogging = config.enableLogging || false
    
    this.log('WebSocketManager initialized', { config })
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private log(message: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`[WebSocketManager ${this.connectionId}] ${message}`, data || '')
    }
  }

  private error(message: string, error?: any): void {
    if (this.enableLogging) {
      console.error(`[WebSocketManager ${this.connectionId}] ${message}`, error || '')
    }
  }

  private warn(message: string, data?: any): void {
    if (this.enableLogging) {
      console.warn(`[WebSocketManager ${this.connectionId}] ${message}`, data || '')
    }
  }

  // Cache management
  private setCache(key: string, data: any, ttl?: number): void {
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.cacheTTL
    }
    this.cache.set(key, entry)
    this.log('Cache entry set', { key, ttl: entry.ttl })
  }

  private getCache(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.log('Cache entry expired', { key })
      return null
    }

    this.log('Cache entry retrieved', { key, age: now - entry.timestamp })
    return entry.data
  }

  private clearCache(): void {
    this.cache.clear()
    this.log('Cache cleared')
  }

  private cleanupExpiredCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
    this.log('Expired cache entries cleaned up')
  }

  // WebSocket connection management
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.log('Already connected')
        resolve()
        return
      }

      this.log('Attempting to connect', { url: this.url })

      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.isConnected = true
          this.log('Connected successfully')
          this.emit('connected', { connectionId: this.connectionId })
          
          // Send queued messages
          this.flushMessageQueue()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.log('Message received', { type: message.type, id: message.id })
            
            // Cache certain message types
            if (message.type === 'agent_response' || message.type === 'system_status') {
              this.setCache(`msg_${message.id}`, message.payload)
            }
            
            this.emit('message', message)
            this.emit(message.type, message)
          } catch (error) {
            this.error('Failed to parse message', { error, data: event.data })
          }
        }

        this.ws.onclose = (event) => {
          this.isConnected = false
          this.warn('Connection closed', { code: event.code, reason: event.reason })
          this.emit('disconnected', { code: event.code, reason: event.reason })
          
          // Attempt to reconnect if not closed intentionally
          if (event.code !== 1000) {
            this.attemptReconnect()
          }
        }

        this.ws.onerror = (error) => {
          this.error('WebSocket error', error)
          this.emit('error', error)
          reject(error)
        }

      } catch (error) {
        this.error('Failed to create WebSocket connection', error)
        reject(error)
      }
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    let attempts = 0
    const reconnect = () => {
      attempts++
      this.log(`Reconnection attempt ${attempts}/${this.reconnectAttempts}`)
      
      if (attempts > this.reconnectAttempts) {
        this.error('Max reconnection attempts reached')
        this.emit('reconnect_failed', { attempts })
        return
      }

      this.reconnectTimeout = setTimeout(async () => {
        try {
          await this.connect()
          this.log('Reconnected successfully')
          this.emit('reconnected', { attempts })
        } catch (error) {
          this.warn('Reconnection failed, retrying...', { error })
          reconnect()
        }
      }, this.reconnectInterval)
    }

    reconnect()
  }

  disconnect(): void {
    this.log('Disconnecting intentionally')
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect')
      this.ws = null
    }

    this.isConnected = false
    this.emit('disconnected', { code: 1000, reason: 'Intentional disconnect' })
  }

  // Message management
  send(type: string, payload: any, options: { cache?: boolean; ttl?: number } = {}): string {
    const messageId = this.generateMessageId()
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: messageId
    }

    // Cache message if requested
    if (options.cache) {
      this.setCache(`msg_${messageId}`, payload, options.ttl)
    }

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.log('Sending message', { type, id: messageId })
      this.ws.send(JSON.stringify(message))
    } else {
      this.warn('WebSocket not connected, queueing message', { type, id: messageId })
      this.messageQueue.push(message)
    }

    return messageId
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      return
    }

    this.log(`Flushing message queue`, { count: this.messageQueue.length })
    
    const queuedMessages = [...this.messageQueue]
    this.messageQueue = []

    for (const message of queuedMessages) {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message))
        this.log('Sent queued message', { type: message.type, id: message.id })
      } else {
        this.warn('Still not connected, re-queueing message', { type: message.type, id: message.id })
        this.messageQueue.push(message)
      }
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Event management
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
    this.log('Event listener added', { event })
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
        this.log('Event listener removed', { event })
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      this.log('Emitting event', { event, listenersCount: listeners.length })
      listeners.forEach(callback => callback(data))
    }
  }

  // Public utility methods
  getConnectionStatus(): boolean {
    return this.isConnected
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  clearMessageQueue(): void {
    this.messageQueue = []
    this.log('Message queue cleared')
  }

  getMessageQueueSize(): number {
    return this.messageQueue.length
  }

  // Start periodic cache cleanup
  startCacheCleanup(interval: number = 60000): void {
    setInterval(() => {
      this.cleanupExpiredCache()
    }, interval)
    this.log('Started periodic cache cleanup', { interval })
  }
}

export default WebSocketManager
export type { WebSocketMessage, WebSocketConfig }