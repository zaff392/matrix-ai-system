'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, LogOut, Eye, EyeOff, Copy, Settings, User, Mail, Lock, Send, StopCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSocketIO } from '@/hooks/useSocketIO'
import { useLedBanner } from '@/hooks/useLedBanner'
import { aiServiceClient } from '@/lib/ai-service-client'
import AuthModal from '@/components/auth/AuthModal'
import MemoryManager from '@/components/memory/MemoryManager'
import LedBanner from '@/components/led-banner/LedBanner'
import LedBannerSettings from '@/components/led-banner/LedBannerSettings'
import FormDebug from '@/components/debug/FormDebug'

interface Agent {
  id: string
  name: string
  emoji: string
  isActive: boolean
  status: 'actif' | 'inactif' | 'en_pause' | 'occupé'
  color: {
    primary: string
    secondary: string
    accent: string
    glow: string
  }
  personality: string
}

interface Message {
  id: string
  type: 'system' | 'agent' | 'user'
  content: string
  timestamp: Date
  agentId?: string
}

interface SystemMetrics {
  cpu: number
  memory: number
  network: number
  activeAgents: number
  timestamp: Date
}

const agents: Agent[] = [
  { 
    id: '1', 
    name: 'Likejust', 
    emoji: '🕴️', 
    isActive: true, 
    status: 'actif',
    color: {
      primary: 'from-emerald-500 to-teal-600',
      secondary: 'bg-emerald-500/20',
      accent: 'border-emerald-500',
      glow: 'shadow-emerald-500/20'
    },
    personality: 'élégant et professionnel'
  },
  { 
    id: '2', 
    name: 'Trinity', 
    emoji: '👩‍💻', 
    isActive: false, 
    status: 'inactif',
    color: {
      primary: 'from-purple-500 to-pink-600',
      secondary: 'bg-purple-500/20',
      accent: 'border-purple-500',
      glow: 'shadow-purple-500/20'
    },
    personality: 'rebelle et déterminée'
  },
  { 
    id: '3', 
    name: 'Morpheus', 
    emoji: '🧙‍♂️', 
    isActive: true, 
    status: 'actif',
    color: {
      primary: 'from-blue-500 to-indigo-600',
      secondary: 'bg-blue-500/20',
      accent: 'border-blue-500',
      glow: 'shadow-blue-500/20'
    },
    personality: 'sage et mystérieux'
  },
  { 
    id: '4', 
    name: 'Oracle', 
    emoji: '🔮', 
    isActive: false, 
    status: 'en_pause',
    color: {
      primary: 'from-amber-500 to-orange-600',
      secondary: 'bg-amber-500/20',
      accent: 'border-amber-500',
      glow: 'shadow-amber-500/20'
    },
    personality: 'visionnaire et calme'
  },
  { 
    id: '5', 
    name: 'Agent Smith', 
    emoji: '🕵️', 
    isActive: true, 
    status: 'occupé',
    color: {
      primary: 'from-red-500 to-rose-600',
      secondary: 'bg-red-500/20',
      accent: 'border-red-500',
      glow: 'shadow-red-500/20'
    },
    personality: 'menaçant et calculateur'
  },
  { 
    id: '6', 
    name: 'Cypher', 
    emoji: '👨‍💻', 
    isActive: false, 
    status: 'inactif',
    color: {
      primary: 'from-gray-500 to-slate-600',
      secondary: 'bg-gray-500/20',
      accent: 'border-gray-500',
      glow: 'shadow-gray-500/20'
    },
    personality: 'cynique et manipulateur'
  },
  { 
    id: '7', 
    name: 'Tank', 
    emoji: '👷', 
    isActive: true, 
    status: 'actif',
    color: {
      primary: 'from-green-500 to-lime-600',
      secondary: 'bg-green-500/20',
      accent: 'border-green-500',
      glow: 'shadow-green-500/20'
    },
    personality: 'loyal et technique'
  },
  { 
    id: '8', 
    name: 'Dozer', 
    emoji: '🔧', 
    isActive: false, 
    status: 'en_pause',
    color: {
      primary: 'from-yellow-500 to-amber-600',
      secondary: 'bg-yellow-500/20',
      accent: 'border-yellow-500',
      glow: 'shadow-yellow-500/20'
    },
    personality: 'pratique et fiable'
  },
  { 
    id: '9', 
    name: 'Switch', 
    emoji: '🔄', 
    isActive: true, 
    status: 'actif',
    color: {
      primary: 'from-cyan-500 to-sky-600',
      secondary: 'bg-cyan-500/20',
      accent: 'border-cyan-500',
      glow: 'shadow-cyan-500/20'
    },
    personality: 'rapide et adaptable'
  },
  { 
    id: '10', 
    name: 'Apoc', 
    emoji: '💀', 
    isActive: false, 
    status: 'inactif',
    color: {
      primary: 'from-red-600 to-black',
      secondary: 'bg-red-600/20',
      accent: 'border-red-600',
      glow: 'shadow-red-600/20'
    },
    personality: 'mortel et silencieux'
  },
  { 
    id: '11', 
    name: 'Mouse', 
    emoji: '🐭', 
    isActive: true, 
    status: 'en_pause',
    color: {
      primary: 'from-pink-500 to-rose-600',
      secondary: 'bg-pink-500/20',
      accent: 'border-pink-500',
      glow: 'shadow-pink-500/20'
    },
    personality: 'curieux et créatif'
  },
  { 
    id: '12', 
    name: 'Keymaker', 
    emoji: '🗝️', 
    isActive: false, 
    status: 'inactif',
    color: {
      primary: 'from-yellow-400 to-gold-600',
      secondary: 'bg-yellow-400/20',
      accent: 'border-yellow-400',
      glow: 'shadow-yellow-400/20'
    },
    personality: 'précis et méthodique'
  },
  { 
    id: '13', 
    name: 'Architect', 
    emoji: '🏗️', 
    isActive: true, 
    status: 'occupé',
    color: {
      primary: 'from-slate-500 to-gray-700',
      secondary: 'bg-slate-500/20',
      accent: 'border-slate-500',
      glow: 'shadow-slate-500/20'
    },
    personality: 'logique et absolu'
  },
  { 
    id: '14', 
    name: 'Seraph', 
    emoji: '👼', 
    isActive: false, 
    status: 'en_pause',
    color: {
      primary: 'from-white to-gray-300',
      secondary: 'bg-white/20',
      accent: 'border-white',
      glow: 'shadow-white/20'
    },
    personality: 'protecteur et spirituel'
  },
  { 
    id: '15', 
    name: 'Persephone', 
    emoji: '👸', 
    isActive: true, 
    status: 'actif',
    color: {
      primary: 'from-violet-500 to-purple-600',
      secondary: 'bg-violet-500/20',
      accent: 'border-violet-500',
      glow: 'shadow-violet-500/20'
    },
    personality: 'séductrice et complexe'
  },
  { 
    id: '16', 
    name: 'Merovingian', 
    emoji: '🎭', 
    isActive: false, 
    status: 'inactif',
    color: {
      primary: 'from-rose-500 to-pink-600',
      secondary: 'bg-rose-500/20',
      accent: 'border-rose-500',
      glow: 'shadow-rose-500/20'
    },
    personality: 'sophistiqué et cruel'
  },
  { 
    id: '17', 
    name: 'Twin 1', 
    emoji: '👥', 
    isActive: true, 
    status: 'occupé',
    color: {
      primary: 'from-silver-400 to-gray-500',
      secondary: 'bg-silver-400/20',
      accent: 'border-silver-400',
      glow: 'shadow-silver-400/20'
    },
    personality: 'spectral et jumeau'
  },
  { 
    id: '18', 
    name: 'Twin 2', 
    emoji: '👥', 
    isActive: false, 
    status: 'en_pause',
    color: {
      primary: 'from-silver-400 to-gray-500',
      secondary: 'bg-silver-400/20',
      accent: 'border-silver-400',
      glow: 'shadow-silver-400/20'
    },
    personality: 'spectral et jumeau'
  },
  { 
    id: '19', 
    name: 'Trainman', 
    emoji: '🚂', 
    isActive: true, 
    status: 'actif',
    color: {
      primary: 'from-orange-500 to-red-600',
      secondary: 'bg-orange-500/20',
      accent: 'border-orange-500',
      glow: 'shadow-orange-500/20'
    },
    personality: 'nomade et libre'
  },
  { 
    id: '20', 
    name: 'Sati', 
    emoji: '🌸', 
    isActive: false, 
    status: 'inactif',
    color: {
      primary: 'from-cherry-500 to-pink-600',
      secondary: 'bg-cherry-500/20',
      accent: 'border-cherry-500',
      glow: 'shadow-cherry-500/20'
    },
    personality: 'innocente et évolutive'
  }
]

export default function MatrixInterface() {
  const { user, loading, signIn, logout } = useAuth()
  const { config: ledConfig, updateConfig: updateLedConfig, saveConfig: saveLedConfig } = useLedBanner()
  const [agentList, setAgentList] = useState<Agent[]>(agents)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'system', content: 'Système initialisé. Bienvenue dans la Matrix.', timestamp: new Date() },
    { id: '2', type: 'agent', content: 'Likejust: Choisis ton agent et commence la conversation.', timestamp: new Date(), agentId: '1' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<string | null>('1')
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    network: 28,
    activeAgents: 8,
    timestamp: new Date()
  })
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDebugForm, setShowDebugForm] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)
  const [aiServiceInitialized, setAiServiceInitialized] = useState(false)
  const [typingAgentId, setTypingAgentId] = useState<string | null>(null)
  const [reflectionEffect, setReflectionEffect] = useState(false)
  const [backgroundGradient, setBackgroundGradient] = useState('from-black via-gray-900 to-black')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Socket.IO configuration
  const socketConfig = {
    url: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000',
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    enableLogging: true
  }

  const {
    isConnected: socketConnected,
    sendMessage: sendSocketMessage,
    lastMessage: lastSocketMessage,
    connectionError: socketError,
    connect: socketConnect,
    disconnect: socketDisconnect,
    socket
  } = useSocketIO(socketConfig)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize AI Service
  useEffect(() => {
    const initializeAI = async () => {
      try {
        console.log('🤖 Initializing AI Service...')
        await aiServiceClient.initialize()
        setAiServiceInitialized(true)
        console.log('✅ AI Service initialized successfully')
        
        // Add system message
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: 'Service IA initialisé. Les agents sont prêts à communiquer.',
          timestamp: new Date()
        }])
      } catch (error) {
        console.error('❌ Failed to initialize AI Service:', error)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: 'Erreur: Impossible d\'initialiser le service IA.',
          timestamp: new Date()
        }])
      }
    }

    if (user) {
      initializeAI()
    }

    return () => {
      // Cleanup on unmount
      if (currentRequestId) {
        aiServiceClient.abortRequest(currentRequestId)
      }
    }
  }, [user])

  // Handle Socket.IO messages
  useEffect(() => {
    if (lastSocketMessage) {
      console.log('📨 Received Socket.IO message:', lastSocketMessage)
      
      switch (lastSocketMessage.type) {
        case 'agent_response':
          const agentResponse: Message = {
            id: Date.now().toString(),
            type: 'agent',
            content: lastSocketMessage.payload.response,
            timestamp: new Date(),
            agentId: lastSocketMessage.payload.agentId
          }
          setMessages(prev => [...prev, agentResponse])
          setIsTyping(false)
          setTypingAgentId(null)
          setReflectionEffect(false)
          setCurrentRequestId(null)
          break
          
        case 'typing_start':
          setIsTyping(true)
          setTypingAgentId(lastSocketMessage.payload.agentId)
          setReflectionEffect(true)
          break
          
        case 'typing_end':
          setIsTyping(false)
          setTypingAgentId(null)
          setReflectionEffect(false)
          break
          
        case 'system_status':
          console.log('📊 System status update:', lastSocketMessage.payload)
          break
          
        default:
          console.log('📨 Unknown message type:', lastSocketMessage.type)
      }
    }
  }, [lastSocketMessage])

  // Handle Socket.IO errors
  useEffect(() => {
    if (socketError) {
      console.error('❌ Socket.IO error:', socketError)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: `Erreur de connexion Socket.IO: ${socketError.message}`,
        timestamp: new Date()
      }])
    }
  }, [socketError])

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        activeAgents: agentList.filter(a => a.isActive).length,
        timestamp: new Date()
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [agentList])

  const toggleAgent = (agentId: string) => {
    setAgentList(prev => 
      prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, isActive: !agent.isActive }
          : agent
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-500'
      case 'inactif': return 'bg-gray-600'
      case 'en_pause': return 'bg-yellow-500'
      case 'occupé': return 'bg-red-500'
      default: return 'bg-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'actif': return 'Actif'
      case 'inactif': return 'Inactif'
      case 'en_pause': return 'En pause'
      case 'occupé': return 'Occupé'
      default: return 'Inconnu'
    }
  }

  const selectAgent = (agentId: string) => {
    setSelectedAgent(agentId)
    const agent = agentList.find(a => a.id === agentId)
    if (agent) {
      setBackgroundGradient(`from-black via-${agent.color.primary.split('-')[1]}-900/20 to-black`)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || !user || !aiServiceInitialized) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputMessage
    setInputMessage('')
    setIsTyping(true)
    setTypingAgentId(selectedAgent)
    setReflectionEffect(true)

    try {
      console.log(`🤖 Sending message to agent ${selectedAgent}:`, messageToSend)

      // Send via Socket.IO if available
      if (socketConnected) {
        sendSocketMessage('chat_message', {
          agentId: selectedAgent,
          message: messageToSend,
          userId: user.uid,
          timestamp: Date.now()
        })
        console.log('📤 Message sent via Socket.IO')
        setCurrentRequestId(Date.now().toString())
      } else {
        console.log('📤 Socket.IO not connected, using direct AI service')
        
        // Fallback to direct AI service
        const response = await aiServiceClient.sendMessage(selectedAgent, messageToSend)
        
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: response,
          timestamp: new Date(),
          agentId: selectedAgent
        }
        
        setMessages(prev => [...prev, agentMessage])
        setIsTyping(false)
        setTypingAgentId(null)
        setReflectionEffect(false)
      }

    } catch (error) {
      console.error('❌ Error sending message:', error)
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: `Erreur: ${error.message || 'Impossible d\'envoyer le message'}`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
      setIsTyping(false)
      setTypingAgentId(null)
      setReflectionEffect(false)
      setCurrentRequestId(null)
    }
  }

  const stopGeneration = () => {
    if (currentRequestId) {
      console.log('⏹️ Stopping message generation')
      aiServiceClient.abortRequest(currentRequestId)
      setIsTyping(false)
      setTypingAgentId(null)
      setReflectionEffect(false)
      setCurrentRequestId(null)
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: 'Génération de réponse arrêtée.',
        timestamp: new Date()
      }])
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-green-500'
    if (value < 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} text-green-400 font-mono relative overflow-hidden transition-all duration-1000`}>
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PHBhdGggZD0iTTQwIDBMMCA0MCIgc3Ryb2tlPSIjMDBmZjAwIiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
      
      {/* Reflection Effect */}
      {reflectionEffect && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/3 to-transparent animate-pulse pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.05)_100%)] animate-pulse pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse pointer-events-none"></div>
          
          {/* Dynamic Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.5 + 0.1
                }}
              />
            ))}
          </div>
          
          {/* Scanning Lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-green-400/20 animate-scanning-line"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-green-400/10 animate-scanning-line-reverse"></div>
          </div>
        </>
      )}
      
      {/* LED Banner */}
      <div className="relative z-10">
        <LedBanner
          text={ledConfig.text}
          enabled={ledConfig.enabled}
          color={ledConfig.color}
          fontFamily={ledConfig.fontFamily}
          style={ledConfig.style}
          speed={ledConfig.speed}
        />
      </div>
      
      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-sm border-b border-green-500/30 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-400 tracking-wider">
            MATRIX AI SYSTEM
          </h1>
          
          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-green-400">Chargement...</div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-green-400">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photoURL || ''} />
                    <AvatarFallback className="bg-green-500/20 text-green-400">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-semibold">{user.displayName || 'Utilisateur'}</div>
                    <div className="text-xs text-green-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
                
                {user.isAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      onClick={() => window.location.href = '/admin'}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                      onClick={() => setShowDebugForm(!showDebugForm)}
                    >
                      🔧 Debug
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                onClick={() => setShowAuthModal(true)}
              >
                <User className="w-4 h-4 mr-2" />
                Connexion
              </Button>
            )}
            
            {/* Navigation */}
            <nav className="flex items-center gap-4 border-l border-green-500/30 pl-4">
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10">
                <Upload className="w-4 h-4 mr-2" />
                Importer
              </Button>
              <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 hover:bg-green-500/10">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-12 gap-4 p-4 h-[calc(100vh-80px)]">
        
        {/* Left Column - AI Agents */}
        <div className="col-span-3 bg-black/60 backdrop-blur-md border border-green-500/30 rounded-lg p-4 overflow-hidden">
          <h2 className="text-lg font-bold text-green-400 mb-4 tracking-wider">AGENTS IA</h2>
          <ScrollArea className="h-[calc(100vh-160px)]">
            <div className="space-y-3">
              {agentList.map((agent) => {
                const isSelected = selectedAgent === agent.id
                const isTypingAgent = typingAgentId === agent.id
                
                return (
                  <Card
                    key={agent.id}
                    className={`p-4 cursor-pointer transition-all duration-500 transform hover:scale-105 relative overflow-hidden ${
                      isSelected
                        ? `${agent.color.secondary} ${agent.color.accent} shadow-lg ${agent.color.glow} scale-105`
                        : agent.isActive
                        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                    }`}
                    onClick={() => selectAgent(agent.id)}
                  >
                    {/* Animated Background for Selected Agent */}
                    {isSelected && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${agent.color.primary} opacity-20 animate-pulse`}></div>
                    )}
                    
                    {/* Curtain Effect for Typing Agent */}
                    {isTypingAgent && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-pulse flex items-center justify-center">
                        <div className="text-white text-xs font-bold animate-pulse">ÉCRITURE...</div>
                      </div>
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {/* Agent Avatar with Glow Effect */}
                          <div className={`relative ${isTypingAgent ? 'animate-pulse' : ''}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                              isSelected 
                                ? `bg-gradient-to-r ${agent.color.primary} text-white shadow-lg ${agent.color.glow}`
                                : 'bg-gray-700'
                            }`}>
                              {agent.emoji}
                            </div>
                            {isSelected && (
                              <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${agent.color.primary} opacity-50 animate-ping`}></div>
                            )}
                          </div>
                          
                          <div>
                            <div className={`font-bold tracking-wide ${
                              isSelected 
                                ? `bg-gradient-to-r ${agent.color.primary} bg-clip-text text-transparent`
                                : 'text-green-400'
                            }`}>
                              {agent.name}
                            </div>
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} ${agent.isActive ? 'animate-pulse' : ''}`}></div>
                              {getStatusText(agent.status)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Toggle Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleAgent(agent.id)
                          }}
                          className={`w-4 h-4 rounded-full transition-all duration-300 ${
                            agent.isActive 
                              ? `bg-gradient-to-r ${agent.color.primary} shadow-lg ${agent.color.glow} animate-pulse` 
                              : 'bg-gray-600'
                          }`}
                        />
                      </div>
                      
                      {/* Personality Tag */}
                      {isSelected && (
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${agent.color.secondary} ${agent.color.accent} border`}>
                          {agent.personality}
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Center Column - Chat Interface */}
        <div className="col-span-6 bg-black/60 backdrop-blur-md border border-green-500/30 rounded-lg p-4 flex flex-col">
          <h2 className="text-lg font-bold text-green-400 mb-4 tracking-wider">INTERFACE DE CHAT</h2>
          
          {/* Messages Area */}
          <ScrollArea className="flex-1 mb-4 border border-green-500/20 rounded-lg p-4 bg-black/40">
            <div className="space-y-3">
              {messages.map((message) => {
                const agent = message.agentId ? agentList.find(a => a.id === message.agentId) : null
                
                return (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      message.type === 'system'
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : message.type === 'agent' && agent
                        ? `${agent.color.secondary} ${agent.color.accent} hover:${agent.color.secondary}`
                        : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {message.type === 'agent' && agent && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm bg-gradient-to-r ${agent.color.primary} text-white shadow-sm`}>
                              {agent.emoji}
                            </div>
                          )}
                          <div className={`font-semibold text-sm ${
                            message.type === 'agent' && agent
                              ? `bg-gradient-to-r ${agent.color.primary} bg-clip-text text-transparent`
                              : message.type === 'system'
                              ? 'text-blue-400'
                              : 'text-cyan-400'
                          }`}>
                            {message.type === 'system' && 'SYSTÈME'}
                            {message.type === 'agent' && agent?.name}
                            {message.type === 'user' && 'UTILISATEUR'}
                          </div>
                        </div>
                        <div className="text-sm leading-relaxed">{message.content}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={user ? "Entrez votre requête..." : "Veuillez vous connecter pour utiliser le chat"}
                className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 focus:border-green-500"
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
                disabled={!user || !aiServiceInitialized || isTyping}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || !selectedAgent || !user || !aiServiceInitialized || isTyping}
                className="bg-green-500 hover:bg-green-600 text-black font-bold"
              >
                <Send className="w-4 h-4" />
              </Button>
              {isTyping && (
                <Button
                  onClick={stopGeneration}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Typing Indicator */}
            {isTyping && typingAgentId && (
              <div className="flex items-center gap-3 text-green-400 text-sm p-3 bg-black/40 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2">
                  {/* Typing Agent Avatar */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg animate-pulse">
                      {agentList.find(a => a.id === typingAgentId)?.emoji}
                    </div>
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 opacity-50 animate-ping"></div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="font-semibold text-green-300">
                      {agentList.find(a => a.id === typingAgentId)?.name} est en train d'écrire...
                    </span>
                    <div className="flex gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
                
                {/* Thinking Effect */}
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            
            {/* Status Messages */}
            {!user && (
              <div className="text-center p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-yellow-400 text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Connectez-vous pour accéder au chat et aux fonctionnalités complètes</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="text-yellow-400 hover:text-yellow-300 mt-2"
                >
                  Se connecter maintenant
                </Button>
              </div>
            )}
            
            {user && !aiServiceInitialized && (
              <div className="text-center p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Initialisation du service IA...</span>
                </div>
              </div>
            )}
            
            {user && aiServiceInitialized && !wsConnected && (
              <div className="text-center p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-orange-400 text-sm">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>Connexion directe au service IA (WebSocket indisponible)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - System Metrics & Memory */}
        <div className="col-span-3 bg-black/60 backdrop-blur-md border border-green-500/30 rounded-lg p-4">
          <Tabs defaultValue="metrics" className="h-full">
            <TabsList className="grid w-full grid-cols-4 bg-black/40 border-green-500/30">
              <TabsTrigger value="metrics" className="text-green-400 data-[state=active]:bg-green-500/20">
                Métriques
              </TabsTrigger>
              <TabsTrigger value="memory" className="text-green-400 data-[state=active]:bg-green-500/20">
                Mémoire
              </TabsTrigger>
              <TabsTrigger value="led-settings" className="text-green-400 data-[state=active]:bg-green-500/20">
                Bannière LED
              </TabsTrigger>
              <TabsTrigger value="debug" className="text-yellow-400 data-[state=active]:bg-yellow-500/20">
                🔧 Debug
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics" className="mt-4">
              <h2 className="text-lg font-bold text-green-400 mb-4 tracking-wider">MÉTRIQUES SYSTÈME</h2>
              
              <div className="space-y-6">
                {/* Connection Status */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-semibold">CONNECTION</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-green-400 text-xs">
                        {socketConnected ? 'Socket.IO' : 'Direct'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 space-y-1">
                    <div>Socket.IO: {socketConnected ? '✅ Connecté' : '❌ Déconnecté'}</div>
                    <div>IA: {aiServiceInitialized ? '✅' : '❌'}</div>
                  </div>
                </div>

                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-semibold">CPU</span>
                    <span className="text-green-400">{systemMetrics.cpu.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={systemMetrics.cpu} 
                    className="h-2 bg-black/40"
                  />
                </div>

                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-semibold">MÉMOIRE</span>
                    <span className="text-green-400">{systemMetrics.memory.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={systemMetrics.memory} 
                    className="h-2 bg-black/40"
                  />
                </div>

                {/* Network Usage */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-semibold">RÉSEAU</span>
                    <span className="text-green-400">{systemMetrics.network.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={systemMetrics.network} 
                    className="h-2 bg-black/40"
                  />
                </div>

                {/* Active Agents */}
                <div className="border-t border-green-500/30 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-semibold">AGENTS ACTIFS</span>
                    <span className="text-green-400">{systemMetrics.activeAgents}/20</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {agentList.map((agent) => (
                      <div
                        key={agent.id}
                        className={`w-2 h-2 rounded-full transition-all ${
                          agent.isActive ? 'bg-green-500 shadow-lg shadow-green-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="border-t border-green-500/30 pt-4">
                  <div className="text-center">
                    <div className="text-xs text-green-600 mb-1">DERNIÈRE MISE À JOUR</div>
                    <div className="text-green-400 font-mono text-sm">
                      {formatTime(systemMetrics.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="memory" className="mt-0 h-[calc(100vh-180px)]">
              <MemoryManager 
                agents={agentList}
                selectedAgent={selectedAgent}
                user={user}
              />
            </TabsContent>
            
            <TabsContent value="led-settings" className="mt-0 h-[calc(100vh-180px)]">
              <LedBannerSettings
                config={ledConfig}
                onConfigChange={updateLedConfig}
                onSave={saveLedConfig}
              />
            </TabsContent>
            
            <TabsContent value="debug" className="mt-0 h-[calc(100vh-180px)]">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-yellow-400 mb-4 tracking-wider">DÉBOGAGE</h2>
                <FormDebug />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

          {/* Sound Wave Visualization */}
          {reflectionEffect && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1 pointer-events-none">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.sin(i * 0.5) * 20 + 10}px`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.6
                  }}
                />
              ))}
            </div>
          )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}