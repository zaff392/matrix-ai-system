'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldAlert, 
  Activity,
  TrendingUp,
  Calendar,
  Settings
} from 'lucide-react'
import { UserService } from '@/lib/user-service'
import { UserRole } from '@prisma/client'

interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: Record<UserRole, number>
}

interface AdminDashboardProps {
  currentUserId?: string
}

export default function AdminDashboard({ currentUserId }: AdminDashboardProps) {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: { USER: 0, ADMIN: 0, SUPER_ADMIN: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const userStats = await UserService.getUserStats()
      setStats(userStats)
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'bg-red-100 text-red-800 border-red-200'
      case UserRole.ADMIN:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <ShieldAlert className="w-4 h-4" />
      case UserRole.ADMIN:
        return <Shield className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Administrateurs'
      case UserRole.ADMIN:
        return 'Administrateurs'
      default:
        return 'Utilisateurs'
    }
  }

  const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Administrateur</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de la gestion des utilisateurs et du système
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Système Actif
          </Badge>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Chargement...' : `${activePercentage}% actifs`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Chargement...' : `${stats.inactive} inactifs`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? '-' : stats.byRole.ADMIN + stats.byRole.SUPER_ADMIN}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Chargement...' : `${stats.byRole.SUPER_ADMIN} super admins`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Activité</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '-' : `${activePercentage}%`}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Chargement...' : 'Utilisateurs actifs'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par rôle */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs Standard
            </CardTitle>
            <CardDescription>
              Comptes utilisateur standard avec permissions limitées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{loading ? '-' : stats.byRole.USER}</div>
              <Badge variant="outline" className={getRoleColor(UserRole.USER)}>
                <div className="flex items-center gap-1">
                  {getRoleIcon(UserRole.USER)}
                  USER
                </div>
              </Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progression</span>
                <span>{stats.total > 0 ? Math.round((stats.byRole.USER / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.byRole.USER / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Administrateurs
            </CardTitle>
            <CardDescription>
              Comptes administrateurs avec permissions étendues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{loading ? '-' : stats.byRole.ADMIN}</div>
              <Badge variant="outline" className={getRoleColor(UserRole.ADMIN)}>
                <div className="flex items-center gap-1">
                  {getRoleIcon(UserRole.ADMIN)}
                  ADMIN
                </div>
              </Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progression</span>
                <span>{stats.total > 0 ? Math.round((stats.byRole.ADMIN / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.byRole.ADMIN / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Super Administrateurs
            </CardTitle>
            <CardDescription>
              Comptes avec tous les droits d'administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{loading ? '-' : stats.byRole.SUPER_ADMIN}</div>
              <Badge variant="outline" className={getRoleColor(UserRole.SUPER_ADMIN)}>
                <div className="flex items-center gap-1">
                  {getRoleIcon(UserRole.SUPER_ADMIN)}
                  SUPER_ADMIN
                </div>
              </Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progression</span>
                <span>{stats.total > 0 ? Math.round((stats.byRole.SUPER_ADMIN / stats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${stats.total > 0 ? (stats.byRole.SUPER_ADMIN / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Actions Rapides
          </CardTitle>
          <CardDescription>
            Actions administratives courantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/users'}
            >
              <Users className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Gérer les Utilisateurs</div>
                <div className="text-xs text-muted-foreground">
                  Ajouter, modifier ou supprimer des utilisateurs
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/roles'}
            >
              <Shield className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Gérer les Rôles</div>
                <div className="text-xs text-muted-foreground">
                  Configurer les rôles et permissions
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/logs'}
            >
              <Activity className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Voir les Logs</div>
                <div className="text-xs text-muted-foreground">
                  Consulter les activités administratives
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => window.location.href = '/admin/settings'}
            >
              <Calendar className="w-6 h-6" />
              <div className="text-left">
                <div className="font-medium">Paramètres Système</div>
                <div className="text-xs text-muted-foreground">
                  Configurer les options système
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statut du système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Statut du Système
          </CardTitle>
          <CardDescription>
            État actuel du système et des services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Base de données</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connectée
                  </div>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Authentification</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Active
                  </div>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service Firebase</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Opérationnel
                  </div>
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">WebSocket</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connecté
                  </div>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service AI</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Disponible
                  </div>
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stockage</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Normal
                  </div>
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}