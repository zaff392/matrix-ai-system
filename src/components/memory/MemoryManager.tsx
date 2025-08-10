'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Plus, Edit, Trash2, Brain, MessageSquare, User, Settings, RefreshCw, Download, Upload } from 'lucide-react'
import { Agent, Message } from '@/app/page'

interface Memory {
  id: string
  agentId: string
  userId?: string
  type: 'conversation_summary' | 'user_preference' | 'learned_fact' | 'context_info'
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

interface MemoryManagerProps {
  agents: Agent[]
  selectedAgent: string | null
  user?: { uid: string; displayName?: string; email?: string }
}

export default function MemoryManager({ agents, selectedAgent, user }: MemoryManagerProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newMemory, setNewMemory] = useState({
    title: '',
    content: '',
    type: 'context_info' as const,
    tags: '',
    importance: 5
  })

  // Types de mémoire avec leurs couleurs
  const memoryTypes = {
    conversation_summary: { label: 'Résumé de conversation', color: 'bg-blue-500' },
    user_preference: { label: 'Préférence utilisateur', color: 'bg-green-500' },
    learned_fact: { label: 'Fait appris', color: 'bg-purple-500' },
    context_info: { label: 'Information contextuelle', color: 'bg-orange-500' }
  }

  // Charger les mémoires
  const loadMemories = async () => {
    if (!selectedAgent) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (user) params.append('userId', user.uid)

      const response = await fetch(`/api/memory/search?${params}`)
      const data = await response.json()
      
      if (data.success) {
        // Filtrer par agent sélectionné
        const filteredMemories = data.data.filter((memory: Memory) => memory.agentId === selectedAgent)
        setMemories(filteredMemories)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mémoires:', error)
    } finally {
      setLoading(false)
    }
  }

  // Créer une nouvelle mémoire
  const createMemory = async () => {
    if (!selectedAgent || !user || !newMemory.title || !newMemory.content) return

    try {
      const response = await fetch(`/api/agents/${selectedAgent}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMemory,
          userId: user.uid,
          tags: newMemory.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setNewMemory({ title: '', content: '', type: 'context_info', tags: '', importance: 5 })
        setIsCreateDialogOpen(false)
        loadMemories()
      }
    } catch (error) {
      console.error('Erreur lors de la création de la mémoire:', error)
    }
  }

  // Supprimer une mémoire
  const deleteMemory = async (memoryId: string) => {
    if (!selectedAgent) return

    try {
      const response = await fetch(`/api/agents/${selectedAgent}/memory?memoryIds=${memoryId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        loadMemories()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la mémoire:', error)
    }
  }

  // Exporter les mémoires
  const exportMemories = () => {
    const dataStr = JSON.stringify(memories, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `agent-${selectedAgent}-memories-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (selectedAgent) {
      loadMemories()
    } else {
      setMemories([])
    }
  }, [selectedAgent, searchQuery, selectedType])

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent)

  return (
    <Card className="bg-black/60 backdrop-blur-md border-green-500/30 text-green-400">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            <CardTitle className="text-green-400">Gestion de la Mémoire</CardTitle>
            {selectedAgentData && (
              <Badge variant="outline" className="text-green-400 border-green-500/30">
                {selectedAgentData.emoji} {selectedAgentData.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMemories}
              disabled={loading}
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            {memories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={exportMemories}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!selectedAgent || !user}
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 backdrop-blur-md border-green-500/30 text-green-400">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle mémoire</DialogTitle>
                  <DialogDescription>
                    Ajoutez une information importante que l'agent doit se souvenir
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-green-400">Titre</label>
                    <Input
                      value={newMemory.title}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-black/60 border-green-500/30 text-green-400"
                      placeholder="Titre de la mémoire"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-green-400">Type</label>
                    <Select
                      value={newMemory.type}
                      onValueChange={(value: any) => setNewMemory(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="bg-black/60 border-green-500/30 text-green-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-green-500/30 text-green-400">
                        {Object.entries(memoryTypes).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-green-400">Contenu</label>
                    <Textarea
                      value={newMemory.content}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                      className="bg-black/60 border-green-500/30 text-green-400"
                      placeholder="Contenu détaillé de la mémoire"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-green-400">Tags (séparés par des virgules)</label>
                    <Input
                      value={newMemory.tags}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, tags: e.target.value }))}
                      className="bg-black/60 border-green-500/30 text-green-400"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-green-400">Importance (1-10)</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newMemory.importance}
                      onChange={(e) => setNewMemory(prev => ({ ...prev, importance: parseInt(e.target.value) || 5 }))}
                      className="bg-black/60 border-green-500/30 text-green-400"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={createMemory}
                      disabled={!newMemory.title || !newMemory.content}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                    >
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <CardDescription className="text-green-600">
          Gérez la mémoire à long terme de l'agent pour un contexte persistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedAgent ? (
          <div className="text-center text-green-600 py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Sélectionnez un agent pour gérer sa mémoire</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filtres et recherche */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                <Input
                  placeholder="Rechercher dans la mémoire..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/60 border-green-500/30 text-green-400 pl-10"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-black/60 border-green-500/30 text-green-400 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-green-500/30 text-green-400">
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(memoryTypes).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Liste des mémoires */}
            <ScrollArea className="h-96">
              {loading ? (
                <div className="text-center text-green-600 py-8">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
                  <p>Chargement des mémoires...</p>
                </div>
              ) : memories.length === 0 ? (
                <div className="text-center text-green-600 py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune mémoire trouvée</p>
                  <p className="text-sm mt-2">Créez des mémoires pour aider l'agent à se souvenir</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {memories.map((memory) => (
                    <Card
                      key={memory.id}
                      className="bg-black/40 border-green-500/20 p-3 hover:border-green-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={`${memoryTypes[memory.type].color} text-white text-xs`}
                            >
                              {memoryTypes[memory.type].label}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < Math.floor(memory.importance / 2)
                                      ? 'bg-green-500'
                                      : 'bg-green-500/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-green-600">
                              Accès: {memory.accessCount}
                            </span>
                          </div>
                          <h4 className="text-green-400 font-medium mb-1">{memory.title}</h4>
                          <p className="text-green-600 text-sm mb-2 line-clamp-2">
                            {memory.content}
                          </p>
                          {memory.tags && memory.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {memory.tags.map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs border-green-500/30 text-green-600"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMemory(memory.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-6 w-6"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Statistiques */}
            {memories.length > 0 && (
              <div className="flex items-center justify-between text-sm text-green-600 pt-2 border-t border-green-500/20">
                <span>Total: {memories.length} mémoires</span>
                <div className="flex gap-4">
                  {Object.entries(memoryTypes).map(([type, { label, color }]) => {
                    const count = memories.filter(m => m.type === type).length
                    return count > 0 ? (
                      <span key={type} className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${color}`} />
                        {count} {label.toLowerCase()}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}