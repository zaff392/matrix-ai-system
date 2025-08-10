'use client'

import { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  UserWithRoles, 
  UserService, 
  CreateUserInput, 
  UpdateUserInput 
} from '@/lib/user-service'
import { UserRole } from '@prisma/client'
import { 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  Power, 
  Shield, 
  ShieldOff,
  Users,
  UserCheck,
  UserX,
  User
} from 'lucide-react'

interface UserManagerProps {
  currentUserId?: string
}

export default function UserManager({ currentUserId }: UserManagerProps) {
  const [users, setUsers] = useState<UserWithRoles[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: UserRole.USER,
    isActive: true
  })

  const usersPerPage = 10

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers()
  }, [currentPage, searchTerm, roleFilter, activeFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: usersPerPage,
      }

      if (searchTerm) params.search = searchTerm
      if (roleFilter !== 'all') params.role = roleFilter as UserRole
      if (activeFilter !== 'all') params.isActive = activeFilter === 'active'

      const response = await UserService.getAllUsers(params)
      setUsers(response.users)
      setTotalUsers(response.total)
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    try {
      const input: CreateUserInput = {
        email: formData.email,
        name: formData.name || undefined,
        role: formData.role,
        isActive: formData.isActive
      }

      await UserService.createUser(input)
      
      // Réinitialiser le formulaire et fermer le dialogue
      setFormData({ email: '', name: '', role: UserRole.USER, isActive: true })
      setIsCreateDialogOpen(false)
      
      // Recharger la liste
      loadUsers()
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const input: UpdateUserInput = {
        id: selectedUser.id,
        email: formData.email,
        name: formData.name || undefined,
        role: formData.role,
        isActive: formData.isActive
      }

      await UserService.updateUser(input)
      
      // Fermer le dialogue et recharger
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await UserService.deleteUser(userId)
      loadUsers()
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    }
  }

  const handleToggleActive = async (userId: string) => {
    try {
      await UserService.toggleUserActive(userId)
      loadUsers()
    } catch (error) {
      console.error('Erreur lors du basculement de l\'état de l\'utilisateur:', error)
    }
  }

  const openEditDialog = (user: UserWithRoles) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name || '',
      role: user.role,
      isActive: user.isActive
    })
    setIsEditDialogOpen(true)
  }

  const getRoleBadgeColor = (role: UserRole) => {
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
        return <Shield className="w-4 h-4" />
      case UserRole.ADMIN:
        return <ShieldOff className="w-4 h-4" />
      default:
        return <User className="w-4 h-4" />
    }
  }

  const totalPages = Math.ceil(totalUsers / usersPerPage)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des Utilisateurs
              </CardTitle>
              <CardDescription>
                Gérez les utilisateurs, leurs rôles et leurs permissions
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau compte utilisateur avec un rôle spécifique.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Nom
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      Rôle
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.USER}>Utilisateur</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Administrateur</SelectItem>
                        <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="active" className="text-right">
                      Actif
                    </Label>
                    <Switch
                      id="active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateUser}>Créer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres et recherche */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par email ou nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value={UserRole.USER}>Utilisateurs</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Administrateurs</SelectItem>
                <SelectItem value={UserRole.SUPER_ADMIN}>Super Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tableau des utilisateurs */}
          {loading ? (
            <div className="text-center py-8">Chargement des utilisateurs...</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date de création</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.email}</div>
                            {user.name && (
                              <div className="text-sm text-gray-500">{user.name}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getRoleBadgeColor(user.role)}
                          >
                            <div className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              {user.role}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className="flex items-center gap-1"
                          >
                            {user.isActive ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                Actif
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3" />
                                Inactif
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(user.id)}
                              disabled={user.id === currentUserId}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            {user.id !== currentUserId && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer l'utilisateur "{user.email}" ? 
                                      Cette action est irréversible.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                      Supprimer
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Affichage de {(currentPage - 1) * usersPerPage + 1} à {Math.min(currentPage * usersPerPage, totalUsers)} sur {totalUsers} utilisateurs
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogue d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Rôle
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>Utilisateur</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Administrateur</SelectItem>
                  <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                Actif
              </Label>
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateUser}>Mettre à jour</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}