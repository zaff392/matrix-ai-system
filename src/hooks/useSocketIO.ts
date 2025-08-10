'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketIOConfig {
  url?: string
  autoConnect?: boolean
  reconnection?: boolean
  reconnectionAttempts?: number
  reconnectionDelay?: number
  reconnectionDelayMax?: number
  enableLogging?: boolean
}

interface SocketMessage {
  type: string
  payload: any
  timestamp: number
  id: string
}

interface UseSocketIOReturn {
  isConnected: boolean
  sendMessage: (type: string, payload: any) => void
  lastMessage: SocketMessage | null
  connectionError: Error | null
  connect: () => void
  disconnect: () => void
  socket: Socket | null
}

export function useSocketIO(config: SocketIOConfig = {}): UseSocketIOReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null)
  const [connectionError, setConnectionError] = useState<Error | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const isMounted = useRef(true)

  const {
    url = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000',
    autoConnect = true,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 3000,
    reconnectionDelayMax = 5000,
    enableLogging = false
  } = config

  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`[SocketIO] ${message}`, data || '')
    }
  }, [enableLogging])

  const error = useCallback((message: string, err?: any) => {
    if (enableLogging) {
      console.error(`[SocketIO] ${message}`, err || '')
    }
  }, [enableLogging])

  // Initialize Socket.IO client
  useEffect(() => {
    if (!socketRef.current) {
      console.log('🚀 Initializing Socket.IO client (NEW VERSION)', { url })

      socketRef.current = io(url, {
        autoConnect: false,
        reconnection,
        reconnectionAttempts,
        reconnectionDelay,
        reconnectionDelayMax,
        path: '/api/socketio',
        transports: ['websocket', 'polling']
      })

      const socket = socketRef.current

      // Connection events
      socket.on('connect', () => {
        if (isMounted.current) {
          setIsConnected(true)
          setConnectionError(null)
          log('🟢 Connected to server', { socketId: socket.id })
        }
      })

      socket.on('disconnect', (reason) => {
        if (isMounted.current) {
          setIsConnected(false)
          log('🔴 Disconnected from server', { reason })
        }
      })

      socket.on('connect_error', (err) => {
        if (isMounted.current) {
          setConnectionError(err)
          error('❌ Connection error', err)
        }
      })

      // Message handling
      socket.on('message', (data: SocketMessage) => {
        if (isMounted.current) {
          setLastMessage(data)
          log('📨 Message received', data)
        }
      })

      // Custom message types
      socket.on('agent_response', (data) => {
        if (isMounted.current) {
          const message: SocketMessage = {
            type: 'agent_response',
            payload: data,
            timestamp: Date.now(),
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
          setLastMessage(message)
          log('🤖 Agent response received', data)
        }
      })

      socket.on('typing_start', (data) => {
        if (isMounted.current) {
          const message: SocketMessage = {
            type: 'typing_start',
            payload: data,
            timestamp: Date.now(),
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
          setLastMessage(message)
          log('⌨️ Typing started', data)
        }
      })

      socket.on('typing_end', (data) => {
        if (isMounted.current) {
          const message: SocketMessage = {
            type: 'typing_end',
            payload: data,
            timestamp: Date.now(),
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
          setLastMessage(message)
          log('⏹️ Typing ended', data)
        }
      })

      socket.on('system_status', (data) => {
        if (isMounted.current) {
          const message: SocketMessage = {
            type: 'system_status',
            payload: data,
            timestamp: Date.now(),
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
          setLastMessage(message)
          log('📊 System status update', data)
        }
      })

      // Auto-connect if enabled
      if (autoConnect) {
        socket.connect()
      }
    }

    return () => {
      isMounted.current = false
    }
  }, [url, autoConnect, reconnection, reconnectionAttempts, reconnectionDelay, reconnectionDelayMax, log, error])

  const sendMessage = useCallback((type: string, payload: any) => {
    if (!socketRef.current) {
      error('❌ Socket not initialized')
      return
    }

    const message: SocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    log('📤 Sending message', message)
    socketRef.current.emit('message', message)
  }, [log, error])

  const connect = useCallback(() => {
    if (!socketRef.current) {
      error('❌ Socket not initialized')
      return
    }

    log('🔄 Connecting to server...')
    socketRef.current.connect()
  }, [log, error])

  const disconnect = useCallback(() => {
    if (!socketRef.current) {
      error('❌ Socket not initialized')
      return
    }

    log('🔌 Disconnecting from server...')
    socketRef.current.disconnect()
  }, [log, error])

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connectionError,
    connect,
    disconnect,
    socket: socketRef.current
  }
}

// Hook for specific message types
export function useSocketIOMessage<T>(type: string, config: SocketIOConfig = {}) {
  const [message, setMessage] = useState<T | null>(null)
  const { lastMessage, ...socket } = useSocketIO(config)

  useEffect(() => {
    if (lastMessage && lastMessage.type === type) {
      setMessage(lastMessage.payload as T)
      console.log(`🎯 Received specific message type "${type}":`, lastMessage.payload)
    }
  }, [lastMessage, type])

  return { message, ...socket }
}