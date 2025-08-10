/**
 * Service d'initialisation des données par défaut
 * Ce service crée les rôles, permissions et utilisateurs par défaut
 */

import { db } from './db'
import { UserService, RoleService, PermissionService } from './user-service'
import { UserRole } from '@prisma/client'

export class InitService {
  /**
   * Initialiser toutes les données par défaut
   */
  static async initialize(): Promise<void> {
    console.log('🚀 Démarrage de l\'initialisation des données par défaut...')
    
    try {
      await this.createDefaultPermissions()
      await this.createDefaultRoles()
      await this.assignDefaultPermissions()
      await this.createDefaultAdminUser()
      
      console.log('✅ Initialisation terminée avec succès!')
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error)
      throw error
    }
  }

  /**
   * Créer les permissions par défaut
   */
  private static async createDefaultPermissions(): Promise<void> {
    console.log('📋 Création des permissions par défaut...')
    
    const defaultPermissions = [
      // Permissions utilisateurs
      { name: 'users_read', description: 'Voir les utilisateurs', resource: 'users', action: 'read' },
      { name: 'users_create', description: 'Créer des utilisateurs', resource: 'users', action: 'create' },
      { name: 'users_update', description: 'Modifier des utilisateurs', resource: 'users', action: 'update' },
      { name: 'users_delete', description: 'Supprimer des utilisateurs', resource: 'users', action: 'delete' },
      { name: 'users_manage', description: 'Gérer les utilisateurs', resource: 'users', action: 'manage' },
      
      // Permissions agents
      { name: 'agents_read', description: 'Voir les agents', resource: 'agents', action: 'read' },
      { name: 'agents_create', description: 'Créer des agents', resource: 'agents', action: 'create' },
      { name: 'agents_update', description: 'Modifier des agents', resource: 'agents', action: 'update' },
      { name: 'agents_delete', description: 'Supprimer des agents', resource: 'agents', action: 'delete' },
      { name: 'agents_manage', description: 'Gérer les agents', resource: 'agents', action: 'manage' },
      
      // Permissions conversations
      { name: 'conversations_read', description: 'Voir les conversations', resource: 'conversations', action: 'read' },
      { name: 'conversations_create', description: 'Créer des conversations', resource: 'conversations', action: 'create' },
      { name: 'conversations_update', description: 'Modifier des conversations', resource: 'conversations', action: 'update' },
      { name: 'conversations_delete', description: 'Supprimer des conversations', resource: 'conversations', action: 'delete' },
      { name: 'conversations_manage', description: 'Gérer les conversations', resource: 'conversations', action: 'manage' },
      
      // Permissions mémoires
      { name: 'memories_read', description: 'Voir les mémoires', resource: 'memories', action: 'read' },
      { name: 'memories_create', description: 'Créer des mémoires', resource: 'memories', action: 'create' },
      { name: 'memories_update', description: 'Modifier des mémoires', resource: 'memories', action: 'update' },
      { name: 'memories_delete', description: 'Supprimer des mémoires', resource: 'memories', action: 'delete' },
      { name: 'memories_manage', description: 'Gérer les mémoires', resource: 'memories', action: 'manage' },
      
      // Permissions système
      { name: 'system_read', description: 'Voir les configurations système', resource: 'system', action: 'read' },
      { name: 'system_update', description: 'Modifier les configurations système', resource: 'system', action: 'update' },
      { name: 'system_manage', description: 'Gérer le système', resource: 'system', action: 'manage' },
      
      // Permissions rôles
      { name: 'roles_read', description: 'Voir les rôles', resource: 'roles', action: 'read' },
      { name: 'roles_create', description: 'Créer des rôles', resource: 'roles', action: 'create' },
      { name: 'roles_update', description: 'Modifier des rôles', resource: 'roles', action: 'update' },
      { name: 'roles_delete', description: 'Supprimer des rôles', resource: 'roles', action: 'delete' },
      { name: 'roles_manage', description: 'Gérer les rôles', resource: 'roles', action: 'manage' },
      
      // Permissions logs
      { name: 'logs_read', description: 'Voir les logs', resource: 'logs', action: 'read' },
      { name: 'logs_manage', description: 'Gérer les logs', resource: 'logs', action: 'manage' },
    ]

    for (const perm of defaultPermissions) {
      try {
        await PermissionService.createPermission(perm)
        console.log(`  ✅ Permission créée: ${perm.name}`)
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          console.log(`  ⚠️  Permission déjà existante: ${perm.name}`)
        } else {
          throw error
        }
      }
    }
  }

  /**
   * Créer les rôles par défaut
   */
  private static async createDefaultRoles(): Promise<void> {
    console.log('👥 Création des rôles par défaut...')
    
    const defaultRoles = [
      {
        name: 'USER',
        description: 'Utilisateur standard',
        level: 0
      },
      {
        name: 'ADMIN',
        description: 'Administrateur',
        level: 100
      },
      {
        name: 'SUPER_ADMIN',
        description: 'Super Administrateur',
        level: 200
      }
    ]

    for (const role of defaultRoles) {
      try {
        await RoleService.createRole(role)
        console.log(`  ✅ Rôle créé: ${role.name}`)
      } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')) {
          console.log(`  ⚠️  Rôle déjà existant: ${role.name}`)
        } else {
          throw error
        }
      }
    }
  }

  /**
   * Assigner les permissions par défaut aux rôles
   */
  private static async assignDefaultPermissions(): Promise<void> {
    console.log('🔐 Assignation des permissions par défaut...')
    
    try {
      // Obtenir tous les rôles et permissions
      const roles = await RoleService.getAllRoles()
      const permissions = await PermissionService.getAllPermissions()

      const userRole = roles.find(r => r.name === 'USER')
      const adminRole = roles.find(r => r.name === 'ADMIN')
      const superAdminRole = roles.find(r => r.name === 'SUPER_ADMIN')

      if (!userRole || !adminRole || !superAdminRole) {
        throw new Error('Rôles par défaut non trouvés')
      }

      // Permissions pour les utilisateurs standard
      const userPermissions = permissions.filter(p => 
        p.name.startsWith('conversations_') || 
        p.name.startsWith('memories_') ||
        p.name === 'users_read'
      )

      // Permissions pour les administrateurs
      const adminPermissions = permissions.filter(p => 
        !p.name.includes('super') && 
        !p.name.includes('system_manage') &&
        !p.name.includes('roles_manage')
      )

      // Super administrateur a toutes les permissions
      const superAdminPermissions = permissions

      // Assigner les permissions
      for (const permission of userPermissions) {
        await RoleService.addPermissionToRole(userRole.id, permission.id)
      }

      for (const permission of adminPermissions) {
        await RoleService.addPermissionToRole(adminRole.id, permission.id)
      }

      for (const permission of superAdminPermissions) {
        await RoleService.addPermissionToRole(superAdminRole.id, permission.id)
      }

      console.log('  ✅ Permissions assignées avec succès')
    } catch (error) {
      console.error('  ❌ Erreur lors de l\'assignation des permissions:', error)
      throw error
    }
  }

  /**
   * Créer l'utilisateur administrateur par défaut
   */
  private static async createDefaultAdminUser(): Promise<void> {
    console.log('👤 Création de l\'administrateur par défaut...')
    
    try {
      // Vérifier si l'administrateur existe déjà
      const existingAdmin = await UserService.getUserByEmail('admin@example.com')
      
      if (existingAdmin) {
        console.log('  ⚠️  Administrateur déjà existant')
        return
      }

      // Créer l'administrateur
      const adminUser = await UserService.createUser({
        email: 'admin@example.com',
        name: 'Administrateur',
        role: UserRole.SUPER_ADMIN,
        isActive: true
      })

      console.log(`  ✅ Administrateur créé: ${adminUser.email}`)
      console.log(`  📝 Mot de passe: À définir via la réinitialisation`)
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) {
        console.log('  ⚠️  Administrateur déjà existant')
      } else {
        console.error('  ❌ Erreur lors de la création de l\'administrateur:', error)
        throw error
      }
    }
  }

  /**
   * Vérifier si l'initialisation est nécessaire
   */
  static async needsInitialization(): Promise<boolean> {
    try {
      const permissionsCount = await db.permission.count()
      const rolesCount = await db.role.count()
      
      return permissionsCount === 0 || rolesCount === 0
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'initialisation:', error)
      return true
    }
  }

  /**
   * Obtenir le statut de l'initialisation
   */
  static async getInitializationStatus(): Promise<{
    initialized: boolean
    permissionsCount: number
    rolesCount: number
    usersCount: number
    needsInit: boolean
  }> {
    try {
      const [permissionsCount, rolesCount, usersCount] = await Promise.all([
        db.permission.count(),
        db.role.count(),
        db.user.count()
      ])

      const needsInit = permissionsCount === 0 || rolesCount === 0

      return {
        initialized: !needsInit,
        permissionsCount,
        rolesCount,
        usersCount,
        needsInit
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error)
      return {
        initialized: false,
        permissionsCount: 0,
        rolesCount: 0,
        usersCount: 0,
        needsInit: true
      }
    }
  }
}