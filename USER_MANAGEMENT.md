# Système de Gestion des Utilisateurs et des Rôles

Ce document décrit le système complet de gestion des utilisateurs, des rôles et des permissions implémenté dans votre application Matrix AI System.

## Vue d'Ensemble

Le système de gestion des utilisateurs fournit :
- **Gestion des utilisateurs** : Création, modification, suppression, activation/désactivation
- **Système de rôles** : Trois niveaux de rôles (USER, ADMIN, SUPER_ADMIN)
- **Gestion des permissions** : Permissions granulaires par ressource et action
- **Interface d'administration** : Tableau de bord et outils de gestion
- **Journalisation** : Suivi des actions administratives
- **API REST** : Endpoints pour toutes les opérations

## Architecture du Système

### 1. Base de Données (Prisma)

#### Modèle User
```typescript
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  conversations Conversation[]
  memories      Memory[]
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}
```

#### Modèles de Permissions
```typescript
model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  resource    String   // 'users', 'agents', 'conversations', 'memories', 'system'
  action      String   // 'create', 'read', 'update', 'delete', 'manage'
  createdAt   DateTime @default(now())
}

model Role {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  isActive    Boolean  @default(true)
  level       Int      @default(0) // 0 = user, 100 = admin, 200 = super_admin
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt()
}

model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())
}

model UserRole {
  id        String   @id @default(cuid())
  userId    String
  roleId    String
  createdAt DateTime @default(now())
}

model AdminLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // 'user_created', 'user_updated', etc.
  targetId    String?
  targetType  String?
  details     String?  // JSON with additional details
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}
```

### 2. Services

#### UserService
Classe principale pour la gestion des utilisateurs :
- `createUser()` : Créer un nouvel utilisateur
- `getUserById()` : Obtenir un utilisateur avec ses rôles et permissions
- `getAllUsers()` : Lister les utilisateurs avec pagination et filtres
- `updateUser()` : Mettre à jour un utilisateur
- `deleteUser()` : Supprimer un utilisateur
- `toggleUserActive()` : Activer/désactiver un utilisateur
- `hasPermission()` : Vérifier les permissions d'un utilisateur
- `getUserStats()` : Obtenir les statistiques des utilisateurs

#### RoleService
Gestion des rôles et permissions :
- `createRole()` : Créer un nouveau rôle
- `getAllRoles()` : Lister tous les rôles
- `addPermissionToRole()` : Ajouter une permission à un rôle
- `removePermissionFromRole()` : Retirer une permission d'un rôle

#### PermissionService
Gestion des permissions :
- `createPermission()` : Créer une nouvelle permission
- `getAllPermissions()` : Lister toutes les permissions
- `getPermissionsByResource()` : Obtenir les permissions par ressource

#### InitService
Initialisation des données par défaut :
- `initialize()` : Créer les rôles, permissions et utilisateur admin par défaut
- `needsInitialization()` : Vérifier si l'initialisation est nécessaire
- `getInitializationStatus()` : Obtenir le statut d'initialisation

### 3. Hook d'Authentification

Le hook `useAuth` a été amélioré pour gérer les rôles et permissions :

```typescript
interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
  isAdmin: boolean
  isSuperAdmin: boolean
  permissions: string[]
  isActive: boolean
}

const {
  user,
  dbUser,
  loading,
  signIn,
  signUp,
  hasPermission,
  refreshUser
} = useAuth()
```

### 4. Composants d'Interface

#### AdminDashboard
Tableau de bord administratif avec :
- Statistiques des utilisateurs
- Répartition par rôle
- Actions rapides
- Statut du système

#### UserManager
Interface complète de gestion des utilisateurs :
- Liste des utilisateurs avec pagination
- Filtres (recherche, rôle, statut)
- Création/édition/suppression d'utilisateurs
- Activation/désactivation d'utilisateurs

### 5. API REST

#### Endpoints disponibles :

**Initialisation**
- `GET /api/init` : Vérifier le statut d'initialisation
- `POST /api/init` : Initialiser les données par défaut

**Utilisateurs**
- `GET /api/users` : Lister les utilisateurs
- `POST /api/users` : Créer un utilisateur
- `GET /api/users/stats` : Obtenir les statistiques

**Exemples d'utilisation :**

```javascript
// Créer un utilisateur
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    role: 'USER',
    isActive: true
  })
})

// Lister les utilisateurs
const response = await fetch('/api/users?page=1&limit=10&search=john&role=USER')
const data = await response.json()
```

## Installation et Configuration

### 1. Mettre à jour la base de données

```bash
# Pousser le schéma mis à jour
npm run db:push

# Générer le client Prisma
npx prisma generate
```

### 2. Initialiser les données par défaut

```bash
# Via l'API
curl -X POST http://localhost:3000/api/init \
  -H "Content-Type: application/json" \
  -d '{"force": false}'

# Ou via le navigateur
# Visitez http://localhost:3000/api/init
```

### 3. Vérifier l'initialisation

```bash
curl http://localhost:3000/api/init
```

## Utilisation

### 1. Pour les administrateurs

#### Accéder au tableau de bord
1. Connectez-vous avec un compte administrateur
2. Allez dans `/admin`
3. Cliquez sur l'onglet "Dashboard" pour voir les statistiques
4. Cliquez sur l'onglet "Utilisateurs" pour gérer les utilisateurs

#### Créer un utilisateur
1. Dans l'onglet "Utilisateurs", cliquez sur "Nouvel Utilisateur"
2. Remplissez le formulaire :
   - Email (obligatoire)
   - Nom (optionnel)
   - Rôle (USER, ADMIN, SUPER_ADMIN)
   - Statut actif (coché par défaut)
3. Cliquez sur "Créer"

#### Gérer les utilisateurs
- **Rechercher** : Utilisez la barre de recherche
- **Filtrer** : Utilisez les filtres par rôle et statut
- **Modifier** : Cliquez sur l'icône d'édition
- **Activer/Désactiver** : Cliquez sur l'icône d'alimentation
- **Supprimer** : Cliquez sur l'icône de corbeille

### 2. Pour les développeurs

#### Utiliser le hook useAuth

```typescript
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { user, hasPermission } = useAuth()

  const canManageUsers = async () => {
    return await hasPermission('users', 'manage')
  }

  return (
    <div>
      {user && (
        <div>
          <p>Bonjour {user.displayName}</p>
          <p>Rôle: {user.role}</p>
          <p>Admin: {user.isAdmin ? 'Oui' : 'Non'}</p>
        </div>
      )}
    </div>
  )
}
```

#### Utiliser les services directement

```typescript
import { UserService } from '@/lib/user-service'

// Créer un utilisateur
const newUser = await UserService.createUser({
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER'
})

// Vérifier les permissions
const canRead = await UserService.hasPermission(userId, 'users', 'read')
```

#### Appeler les API

```typescript
// Obtenir les statistiques
const statsResponse = await fetch('/api/users/stats')
const stats = await statsResponse.json()

// Lister les utilisateurs
const usersResponse = await fetch('/api/users?page=1&limit=10')
const users = await usersResponse.json()
```

## Permissions par Défaut

### Rôle USER
- `conversations_read`
- `conversations_create`
- `conversations_update`
- `conversations_delete`
- `memories_read`
- `memories_create`
- `memories_update`
- `memories_delete`
- `users_read`

### Rôle ADMIN
Toutes les permissions USER plus :
- `agents_read`
- `agents_create`
- `agents_update`
- `agents_delete`
- `users_create`
- `users_update`
- `users_delete`
- `roles_read`
- `logs_read`

### Rôle SUPER_ADMIN
Toutes les permissions disponibles

## Sécurité

### 1. Validation des entrées
- Tous les champs sont validés avant traitement
- Les emails sont uniques
- Les rôles sont validés

### 2. Journalisation
- Toutes les actions administratives sont journalisées
- Les logs incluent : utilisateur, action, cible, détails, IP, user agent

### 3. Permissions
- Les permissions sont vérifiées au niveau service et API
- Les super administrateurs ont toutes les permissions
- Les permissions sont granulaires par ressource et action

### 4. Protection contre les abus
- Pagination pour éviter les surcharges
- Rate limiting recommandé au niveau reverse proxy
- Validation des tokens d'authentification

## Dépannage

### Problèmes courants

1. **Erreur d'initialisation**
   ```bash
   # Vérifier le statut
   curl http://localhost:3000/api/init
   
   # Forcer l'initialisation
   curl -X POST http://localhost:3000/api/init \
     -H "Content-Type: application/json" \
     -d '{"force": true}'
   ```

2. **Permissions non fonctionnelles**
   - Vérifier que l'initialisation a été exécutée
   - Vérifier les rôles et permissions dans la base de données
   - Rafraîchir l'utilisateur avec `refreshUser()`

3. **Utilisateur non créé après connexion**
   - Vérifier les logs du serveur
   - Vérifier que le service UserService fonctionne
   - Vérifier la connexion à la base de données

### Debug

```typescript
// Vérifier le statut d'initialisation
const status = await InitService.getInitializationStatus()
console.log('Initialization status:', status)

// Vérifier les permissions d'un utilisateur
const userWithRoles = await UserService.getUserById(userId)
console.log('User permissions:', userWithRoles?.permissions)

// Vérifier si un utilisateur est admin
const isAdmin = await UserService.isAdmin(userId)
console.log('Is admin:', isAdmin)
```

## Extensions Possibles

### 1. Authentification à deux facteurs
- Ajouter 2FA pour les administrateurs
- Intégration avec Google Authenticator

### 2. Audit avancé
- Logs détaillés pour toutes les actions
- Export des logs
- Analyse des patterns

### 3. Gestion des groupes
- Création de groupes d'utilisateurs
- Permissions par groupe
- Héritage des permissions

### 4. Notifications
- Email de bienvenue
- Notifications de changement de rôle
- Alertes de sécurité

---

Ce système de gestion des utilisateurs est maintenant entièrement intégré dans votre application et prêt à être utilisé. Il fournit une base solide pour la gestion des accès et des permissions.