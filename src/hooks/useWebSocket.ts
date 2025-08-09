'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import WebSocketManager, { WebSocketMessage, WebSocketConfig } from '@/lib/websocket-manager'

interface UseWebSocketReturn {
  isConnected: boolean
  sendMessage: (type: string, payload: any, options?: { cache?: boolean; ttl?: number }) => string
  lastMessage: WebSocketMessage | null
  connectionError: Error | null
  connect: () => Promise<void>
  disconnect: () => void
  cacheStats: { size: number; keys: string[] }
  messageQueueSize: number
}

export function useWebSocket(config: WebSocketConfig): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [connectionError, setConnectionError] = useState<Error | null>(null)
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] as string[] })
  const [messageQueueSize, setMessageQueueSize] = useState(0)

  const wsRef = useRef<WebSocketManager | null>(null)
  const isMounted = useRef(true)

  // Initialize WebSocket manager
  useEffect(() => {
    if (!wsRef.current) {
      wsRef.current = new WebSocketManager({
        ...config,
        enableLogging: true // Enable logging for debugging
      })

      const ws = wsRef.current

      // Set up event listeners
      ws.on('connected', (data) => {
        if (isMounted.current) {
          setIsConnected(true)
          setConnectionError(null)
          console.log('🟢 WebSocket connected:', data)
        }
      })

      ws.on('disconnected', (data) => {
        if (isMounted.current) {
          setIsConnected(false)
          console.log('🔴 WebSocket disconnected:', data)
        }
      })

      ws.on('message', (message: WebSocketMessage) => {
        if (isMounted.current) {
          setLastMessage(message)
          console.log('📨 WebSocket message received:', message)
        }
      })

      ws.on('error', (error) => {
        if (isMounted.current) {
          setConnectionError(error as Error)
          console.error('❌ WebSocket error:', error)
        }
      })

      ws.on('reconnected', (data) => {
        if (isMounted.current) {
          setIsConnected(true)
          setConnectionError(null)
          console.log('🔄 WebSocket reconnected:', data)
        }
      })

      ws.on('reconnect_failed', (data) => {
        if (isMounted.current) {
          console.error('💥 WebSocket reconnection failed:', data)
        }
      })

      // Start cache cleanup
      ws.startCacheCleanup()

      // Connect automatically
      ws.connect().catch((error) => {
        if (isMounted.current) {
          setConnectionError(error as Error)
          console.error('💥 Initial connection failed:', error)
        }
      })
    }

    return () => {
      isMounted.current = false
    }
  }, [config])

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current && isMounted.current) {
        setCacheStats(wsRef.current.getCacheStats())
        setMessageQueueSize(wsRef.current.getMessageQueueSize())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const sendMessage = useCallback((type: string, payload: any, options?: { cache?: boolean; ttl?: number }) => {
    if (!wsRef.current) {
      console.error('❌ WebSocket manager not initialized')
      return ''
    }

    const messageId = wsRef.current.send(type, payload, options)
    console.log('📤 WebSocket message sent:', { type, payload, messageId, options })
    return messageId
  }, [])

  const connect = useCallback(async () => {
    if (!wsRef.current) {
      console.error('❌ WebSocket manager not initialized')
      return
    }

    try {
      await wsRef.current.connect()
      console.log('🟢 WebSocket connection initiated')
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error)
      throw error
    }
  }, [])

  const disconnect = useCallback(() => {
    if (!wsRef.current) {
      console.error('❌ WebSocket manager not initialized')
      return
    }

    wsRef.current.disconnect()
    console.log('🔴 WebSocket disconnected')
  }, [])

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connectionError,
    connect,
    disconnect,
    cacheStats,
    messageQueueSize
  }
}

// Hook for specific message types
export function useWebSocketMessage<T>(type: string, config: WebSocketConfig) {
  const [message, setMessage] = useState<T | null>(null)
  const ws = useWebSocket(config)

  useEffect(() => {
    if (!wsRef.current) return

    const handleMessage = (websocketMessage: WebSocketMessage) => {
      if (websocketMessage.type === type) {
        console.log(`🎯 Received specific message type "${type}":`, websocketMessage.payload)
        setMessage(websocketMessage.payload as T)
      }
    }

    wsRef.current.on(type, handleMessage)

    return () => {
      if (wsRef.current) {
        wsRef.current.off(type, handleMessage)
      }
    }
  }, [type])

  return message
}

// Hook for connection status with detailed info
export function useWebSocketStatus(config: WebSocketConfig) {
  const ws = useWebSocket(config)
  const [statusDetails, setStatusDetails] = useState({
    connectionId: '',
    reconnectAttempts: 0,
    lastActivity: Date.now()
  })

  useEffect(() => {
    if (!wsRef.current) return

    const handleConnected = (data: any) => {
      setStatusDetails(prev => ({
        ...prev,
        connectionId: data.connectionId || '',
        lastActivity: Date.now()
      }))
    }

    const handleReconnected = (data: any) => {
      setStatusDetails(prev => ({
        ...prev,
        reconnectAttempts: data.attempts || 0,
        lastActivity: Date.now()
      }))
    }

    wsRef.current.on('connected', handleConnected)
    wsRef.current.on('reconnected', handleReconnected)

    return () => {
      if (wsRef.current) {
        wsRef.current.off('connected', handleConnected)
        wsRef.current.off('reconnected', handleReconnected)
      }
    }
  }, [])

  return {
    ...ws,
    statusDetails
  }
}

// Global reference for the WebSocket manager
let wsRef: WebSocketManager | null = null