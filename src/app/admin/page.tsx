'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Settings, 
  Key, 
  Users, 
  Activity, 
  Shield, 
  Database, 
  Eye, 
  EyeOff, 
  Copy, 
  Plus, 
  Trash2, 
  Edit,
  LogOut,
  ArrowLeft,
  Crown,
  Brain,
  Bot
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import LikejustManager from '@/components/admin/LikejustManager'
import AgentsManager from '@/components/admin/AgentsManager'
import UserManager from '@/components/admin/UserManager'
import AdminDashboard from '@/components/admin/AdminDashboard'

interface ApiKey {
  id: string
  name: string
  key: string
  model: string
  isActive: boolean
  createdAt: Date
  lastUsed?: Date
}

interface User {
  id: string
  email: string
  displayName: string
  role: 'admin' | 'user'
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export default function AdminPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'GPT-4 Principal',
      key: 'sk-1234567890abcdef1234567890abcdef',
      model: 'GPT-4',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date()
    },
    {
      id: '2',
      name: 'Claude Backup',
      key: 'sk-abcdef1234567890abcdef1234567890',
      model: 'Claude',
      isActive: false,
      createdAt: new Date('2024-01-10'),
      lastUsed: new Date('2024-01-14')
    },
    {
      id: '3',
      name: 'GPT-3.5 Rapide',
      key: 'sk-0987654321fedcba0987654321fedcba',
      model: 'GPT-3.5',
      isActive: true,
      createdAt: new Date('2024-01-20'),
      lastUsed: new Date()
    }
  ])

  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@matrix.com',
      displayName: 'Admin Matrix',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date()
    },
    {
      id: '2',
      email: 'user@matrix.com',
      displayName: 'Utilisateur Standard',
      role: 'user',
      isActive: true,
      createdAt: new Date('2024-01-05'),
      lastLogin: new Date('2024-01-19')
    }
  ])

  const [newApiKey, setNewApiKey] = useState({
    name: '',
    model: 'GPT-4',
    key: ''
  })

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/')
    }
  }, [user, router])

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const addApiKey = () => {
    if (!newApiKey.name || !newApiKey.key) return

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newApiKey.name,
      key: newApiKey.key,
      model: newApiKey.model,
      isActive: true,
      createdAt: new Date()
    }

    setApiKeys(prev => [...prev, newKey])
    setNewApiKey({ name: '', model: 'GPT-4', key: '' })
  }

  const deleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId))
  }

  const toggleApiKeyStatus = (keyId: string) => {
    setApiKeys(prev => 
      prev.map(key => 
        key.id === keyId 
          ? { ...key, isActive: !key.isActive }
          : key
      )
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
          <p className="text-green-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PHBhdGggZD0iTTQwIDBMMCA0MCIgc3Ryb2tlPSIjMDBmZjAwIiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>

      {/* Header */}
      <header className="relative z-10 bg-black/80 backdrop-blur-sm border-b border-green-500/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-green-400 tracking-wider">
                PANNEAU D'ADMINISTRATION
              </h1>
              <div className="text-sm text-green-600">Gestion du système Matrix AI</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-green-400">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="bg-green-500/20 text-green-400">
                  {user.displayName?.[0] || user.email?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-semibold">{user.displayName || 'Admin'}</div>
                <div className="text-xs text-green-600">{user.email}</div>
              </div>
            </div>
            
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
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-black/60 border border-green-500/30">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Activity className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Key className="w-4 h-4" />
                Clés API
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Users className="w-4 h-4" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="likejust" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Crown className="w-4 h-4" />
                Likejust
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Bot className="w-4 h-4" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Activity className="w-4 h-4" />
                Système
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-green-500/20">
                <Settings className="w-4 h-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <AdminDashboard currentUserId={user?.uid} />
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-green-400">Gestion des Clés API</h2>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {apiKeys.filter(k => k.isActive).length} actives
                  </Badge>
                </div>

                {/* Add New API Key */}
                <Card className="bg-black/40 border border-green-500/20 p-4 mb-6">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Ajouter une nouvelle clé API</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Nom de la clé"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600"
                    />
                    <select
                      value={newApiKey.model}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, model: e.target.value }))}
                      className="bg-black/40 border border-green-500/30 text-green-400 rounded-md px-3 py-2"
                    >
                      <option value="GPT-4">GPT-4</option>
                      <option value="GPT-3.5">GPT-3.5</option>
                      <option value="Claude">Claude</option>
                    </select>
                    <Input
                      placeholder="Clé API"
                      value={newApiKey.key}
                      onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
                      className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600"
                    />
                    <Button
                      onClick={addApiKey}
                      disabled={!newApiKey.name || !newApiKey.key}
                      className="bg-green-500 hover:bg-green-600 text-black font-bold"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </Card>

                {/* API Keys List */}
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {apiKeys.map((apiKey) => (
                      <Card key={apiKey.id} className="bg-black/40 border border-green-500/20 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-green-400">{apiKey.name}</h4>
                              <Badge 
                                className={`${
                                  apiKey.isActive 
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                }`}
                              >
                                {apiKey.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {apiKey.model}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <span>Créée le {formatDate(apiKey.createdAt)}</span>
                              {apiKey.lastUsed && (
                                <span>• Dernière utilisation {formatDate(apiKey.lastUsed)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Input
                                type={showKeys[apiKey.id] ? 'text' : 'password'}
                                value={apiKey.key}
                                readOnly
                                className="bg-black/60 border-green-500/30 text-green-400 text-xs font-mono flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleApiKeyVisibility(apiKey.id)}
                                className="text-green-400 hover:text-green-300"
                              >
                                {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(apiKey.key)}
                                className="text-green-400 hover:text-green-300"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyStatus(apiKey.id)}
                              className={`${
                                apiKey.isActive 
                                  ? 'text-yellow-400 hover:text-yellow-300' 
                                  : 'text-green-400 hover:text-green-300'
                              }`}
                            >
                              {apiKey.isActive ? 'Désactiver' : 'Activer'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteApiKey(apiKey.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <UserManager currentUserId={user?.uid} />
            </TabsContent>

            {/* Likejust Tab */}
            <TabsContent value="likejust" className="space-y-6">
              <LikejustManager />
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="space-y-6">
              <AgentsManager />
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
                <h2 className="text-xl font-bold text-green-400 mb-6">État du Système</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="bg-black/40 border border-green-500/20 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Database className="w-8 h-8 text-green-400" />
                      <h3 className="font-semibold text-green-400">Base de données</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-600">Status:</span>
                        <span className="text-green-400">Connectée</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Type:</span>
                        <span className="text-green-400">SQLite</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Taille:</span>
                        <span className="text-green-400">2.4 MB</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-black/40 border border-green-500/20 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="w-8 h-8 text-green-400" />
                      <h3 className="font-semibold text-green-400">Performance</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-600">CPU:</span>
                        <span className="text-green-400">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Mémoire:</span>
                        <span className="text-green-400">62%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Uptime:</span>
                        <span className="text-green-400">99.9%</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-black/40 border border-green-500/20 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-8 h-8 text-green-400" />
                      <h3 className="font-semibold text-green-400">Sécurité</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-600">Authentification:</span>
                        <span className="text-green-400">Firebase</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">SSL:</span>
                        <span className="text-green-400">Actif</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Dernière vérif:</span>
                        <span className="text-green-400">Aujourd'hui</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-black/60 backdrop-blur-md border border-green-500/30 p-6">
                <h2 className="text-xl font-bold text-green-400 mb-6">Paramètres Système</h2>
                
                <div className="space-y-6">
                  <Card className="bg-black/40 border border-green-500/20 p-4">
                    <h3 className="font-semibold text-green-400 mb-4">Configuration Générale</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Mode maintenance</span>
                        <Button variant="outline" size="sm" className="border-green-500/30 text-green-400">
                          Désactivé
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Notifications par email</span>
                        <Button variant="outline" size="sm" className="border-green-500/30 text-green-400">
                          Activé
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Journalisation des erreurs</span>
                        <Button variant="outline" size="sm" className="border-green-500/30 text-green-400">
                          Activé
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-black/40 border border-green-500/20 p-4">
                    <h3 className="font-semibold text-green-400 mb-4">Limites et Quotas</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Requêtes par minute</span>
                        <span className="text-green-400">100</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Taille max des fichiers</span>
                        <span className="text-green-400">10 MB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-green-400">Utilisateurs simultanés</span>
                        <span className="text-green-400">50</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}