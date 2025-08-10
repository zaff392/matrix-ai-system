/**
 * Service de gestion des utilisateurs et des rôles
 * Ce service gère toutes les opérations liées aux utilisateurs, rôles et permissions
 */

import { db } from './db'
import { UserRole, User, Role, Permission, AdminLog } from '@prisma/client'

// Types pour le service
export type UserWithRoles = User & {
  roles: Role[]
  permissions: Permission[]
}

export type CreateUserInput = {
  email: string
  name?: string
  role?: UserRole
  isActive?: boolean
}

export type UpdateUserInput = {
  id: string
  email?: string
  name?: string
  role?: UserRole
  isActive?: boolean
}

export type CreateRoleInput = {
  name: string
  description?: string
  level: number
  isActive?: boolean
}

export type CreatePermissionInput = {
  name: string
  description?: string
  resource: string
  action: string
}

// Service de gestion des utilisateurs
export class UserService {
  /**
   * Créer un nouvel utilisateur
   */
  static async createUser(input: CreateUserInput): Promise<User> {
    const user = await db.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role || UserRole.USER,
        isActive: input.isActive ?? true,
      },
    })

    // Logger la création
    await this.logAdminAction('user_created', user.id, 'user', { email: user.email })

    return user
  }

  /**
   * Obtenir un utilisateur par son ID avec ses rôles et permissions
   */
  static async getUserById(id: string): Promise<UserWithRoles | null> {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!user) return null

    // Extraire les permissions uniques
    const permissions = user.roles.flatMap(role => 
      role.role.rolePermissions.map(rp => rp.permission)
    ).filter((perm, index, self) => 
      self.findIndex(p => p.id === perm.id) === index
    )

    return {
      ...user,
      roles: user.roles.map(ur => ur.role),
      permissions
    }
  }

  /**
   * Obtenir un utilisateur par son email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return await db.user.findUnique({
      where: { email }
    })
  }

  /**
   * Obtenir tous les utilisateurs avec pagination
   */
  static async getAllUsers(params: {
    page?: number
    limit?: number
    search?: string
    role?: UserRole
    isActive?: boolean
  } = {}): Promise<{ users: UserWithRoles[]; total: number }> {
    const { page = 1, limit = 10, search, role, isActive } = params
    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          roles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    const usersWithRoles = users.map(user => {
      const permissions = user.roles.flatMap(role => 
        role.role.rolePermissions.map(rp => rp.permission)
      ).filter((perm, index, self) => 
        self.findIndex(p => p.id === perm.id) === index
      )

      return {
        ...user,
        roles: user.roles.map(ur => ur.role),
        permissions
      }
    })

    return { users: usersWithRoles, total }
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(input: UpdateUserInput): Promise<User> {
    const { id, ...data } = input
    
    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      throw new Error('Utilisateur non trouvé')
    }

    const updatedUser = await db.user.update({
      where: { id },
      data
    })

    // Logger la mise à jour
    await this.logAdminAction('user_updated', id, 'user', { 
      changes: data,
      previous: { email: existingUser.email, name: existingUser.name, role: existingUser.role }
    })

    return updatedUser
  }

  /**
   * Supprimer un utilisateur
   */
  static async deleteUser(id: string): Promise<void> {
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    await db.user.delete({ where: { id } })

    // Logger la suppression
    await this.logAdminAction('user_deleted', id, 'user', { email: user.email })
  }

  /**
   * Activer/Désactiver un utilisateur
   */
  static async toggleUserActive(id: string): Promise<User> {
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    })

    // Logger l'action
    await this.logAdminAction('user_toggled_active', id, 'user', { 
      isActive: updatedUser.isActive 
    })

    return updatedUser
  }

  /**
   * Assigner un rôle à un utilisateur
   */
  static async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // Vérifier si l'association existe déjà
    const existing = await db.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId }
      }
    })

    if (!existing) {
      await db.userRole.create({
        data: { userId, roleId }
      })

      // Logger l'assignation
      await this.logAdminAction('role_assigned', userId, 'user', { roleId })
    }
  }

  /**
   * Retirer un rôle à un utilisateur
   */
  static async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await db.userRole.delete({
      where: {
        userId_roleId: { userId, roleId }
      }
    })

    // Logger le retrait
    await this.logAdminAction('role_removed', userId, 'user', { roleId })
  }

  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  static async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const user = await this.getUserById(userId)
    if (!user) return false

    // Les SUPER_ADMIN ont toutes les permissions
    if (user.role === UserRole.SUPER_ADMIN) return true

    // Vérifier les permissions via les rôles
    return user.permissions.some(perm => 
      perm.resource === resource && perm.action === action
    )
  }

  /**
   * Vérifier si un utilisateur est administrateur
   */
  static async isAdmin(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return false

    return user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
  }

  /**
   * Vérifier si un utilisateur est super administrateur
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return false

    return user.role === UserRole.SUPER_ADMIN
  }

  /**
   * Obtenir les statistiques des utilisateurs
   */
  static async getUserStats(): Promise<{
    total: number
    active: number
    inactive: number
    byRole: Record<UserRole, number>
  }> {
    const [total, active, inactive, byRole] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { isActive: false } }),
      db.user.groupBy({
        by: ['role'],
        _count: { role: true }
      })
    ])

    const roleCounts = byRole.reduce((acc, item) => {
      acc[item.role as UserRole] = item._count.role
      return acc
    }, {} as Record<UserRole, number>)

    return {
      total,
      active,
      inactive,
      byRole: {
        USER: roleCounts.USER || 0,
        ADMIN: roleCounts.ADMIN || 0,
        SUPER_ADMIN: roleCounts.SUPER_ADMIN || 0
      }
    }
  }

  /**
   * Logger une action d'administration
   */
  private static async logAdminAction(
    action: string,
    targetId: string,
    targetType: string,
    details?: any,
    userId?: string
  ): Promise<void> {
    // Pour l'instant, on utilise un userId fixe ou on le passe en paramètre
    // Dans une vraie application, ce serait l'utilisateur connecté
    const adminUserId = userId || 'system'

    await db.adminLog.create({
      data: {
        userId: adminUserId,
        action,
        targetId,
        targetType,
        details: details ? JSON.stringify(details) : null,
        ipAddress: 'unknown', // À récupérer depuis la requête
        userAgent: 'unknown' // À récupérer depuis la requête
      }
    })
  }

  /**
   * Obtenir les logs d'administration
   */
  static async getAdminLogs(params: {
    page?: number
    limit?: number
    userId?: string
    action?: string
    targetType?: string
  } = {}): Promise<{ logs: AdminLog[]; total: number }> {
    const { page = 1, limit = 20, userId, action, targetType } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (userId) where.userId = userId
    if (action) where.action = action
    if (targetType) where.targetType = targetType

    const [logs, total] = await Promise.all([
      db.adminLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, email: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.adminLog.count({ where })
    ])

    return { logs, total }
  }
}

// Service de gestion des rôles
export class RoleService {
  /**
   * Créer un nouveau rôle
   */
  static async createRole(input: CreateRoleInput): Promise<Role> {
    const role = await db.role.create({
      data: {
        name: input.name,
        description: input.description,
        level: input.level,
        isActive: input.isActive ?? true,
      }
    })

    await UserService['logAdminAction']('role_created', role.id, 'role', { name: role.name })

    return role
  }

  /**
   * Obtenir tous les rôles
   */
  static async getAllRoles(): Promise<Role[]> {
    return await db.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { level: 'desc' }
    })
  }

  /**
   * Obtenir un rôle par son ID
   */
  static async getRoleById(id: string): Promise<Role | null> {
    return await db.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })
  }

  /**
   * Mettre à jour un rôle
   */
  static async updateRole(id: string, data: Partial<CreateRoleInput>): Promise<Role> {
    const updatedRole = await db.role.update({
      where: { id },
      data
    })

    await UserService['logAdminAction']('role_updated', id, 'role', data)

    return updatedRole
  }

  /**
   * Supprimer un rôle
   */
  static async deleteRole(id: string): Promise<void> {
    const role = await db.role.findUnique({ where: { id } })
    if (!role) {
      throw new Error('Rôle non trouvé')
    }

    await db.role.delete({ where: { id } })

    await UserService['logAdminAction']('role_deleted', id, 'role', { name: role.name })
  }

  /**
   * Ajouter une permission à un rôle
   */
  static async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const existing = await db.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId }
      }
    })

    if (!existing) {
      await db.rolePermission.create({
        data: { roleId, permissionId }
      })

      await UserService['logAdminAction']('permission_added_to_role', roleId, 'role', { permissionId })
    }
  }

  /**
   * Retirer une permission d'un rôle
   */
  static async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await db.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId }
      }
    })

    await UserService['logAdminAction']('permission_removed_from_role', roleId, 'role', { permissionId })
  }
}

// Service de gestion des permissions
export class PermissionService {
  /**
   * Créer une nouvelle permission
   */
  static async createPermission(input: CreatePermissionInput): Promise<Permission> {
    const permission = await db.permission.create({
      data: input
    })

    await UserService['logAdminAction']('permission_created', permission.id, 'permission', { name: permission.name })

    return permission
  }

  /**
   * Obtenir toutes les permissions
   */
  static async getAllPermissions(): Promise<Permission[]> {
    return await db.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }]
    })
  }

  /**
   * Obtenir les permissions par ressource
   */
  static async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return await db.permission.findMany({
      where: { resource },
      orderBy: { action: 'asc' }
    })
  }
}