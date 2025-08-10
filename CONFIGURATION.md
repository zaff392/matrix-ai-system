# Configuration de l'Application

Ce document explique comment configurer votre application Matrix AI System avec le nouveau système de configuration centralisée.

## Structure des Fichiers de Configuration

### Fichiers Principaux

1. **`src/lib/config.ts`** - Configuration centralisée de l'application
2. **`src/lib/config-utils.ts`** - Utilitaires pour la gestion de la configuration
3. **`src/lib/config-example.ts`** - Exemples d'utilisation de la configuration
4. **`.env`** - Variables d'environnement

### Fichiers Mis à Jour

1. **`src/lib/db.ts`** - Utilise maintenant la configuration centralisée
2. **`prisma/schema.prisma`** - Schéma de la base de données (inchangé)

## Configuration de la Base de Données

### Fichier `.env`

```bash
# Configuration de la Base de Données
DATABASE_URL=file:/home/z/my-project/db/custom.db
```

### Options de Configuration

- **SQLite** (par défaut) : `file:./chemin/vers/votre/base.db`
- **PostgreSQL** : `postgresql://user:password@host:port/database`
- **MySQL** : `mysql://user:password@host:port/database`

### Utilisation dans le Code

```typescript
import { config } from '@/lib/config'

// Accès à la configuration de la base de données
const dbConfig = config.database
console.log(dbConfig.url)    // URL de la base de données
console.log(dbConfig.provider) // 'sqlite', 'postgresql', etc.
```

## Variables d'Environnement Disponibles

### Application

```bash
NODE_ENV=development          # environnement: development, production, test
PORT=3000                    # port du serveur
BASE_URL=http://localhost:3000  # URL de base de l'application
```

### Serveur

```bash
CORS_ORIGIN=http://localhost:3000  # origines CORS autorisées
SESSION_SECRET=your-secret-key     # secret pour les sessions
SESSION_MAX_AGE=86400             # durée de vie des sessions (secondes)
```

### WebSocket

```bash
SOCKET_PATH=/api/socketio    # chemin pour Socket.IO
```

### Services Externes

```bash
# Service AI
AI_API_KEY=votre-cle-api
AI_BASE_URL=https://api.example.com
AI_TIMEOUT=30000

# Firebase (optionnel)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
```

### Sécurité

```bash
JWT_SECRET=your-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Stockage

```bash
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif
```

### Fonctionnalités

```bash
FEATURE_AUTH=true
FEATURE_MEMORY=true
FEATURE_LED_BANNER=true
FEATURE_WEBSOCKET=true

MAX_CONVERSATIONS=50
MAX_MESSAGES_PER_CONVERSATION=1000
MAX_MEMORIES_PER_AGENT=500
```

### Interface Utilisateur

```bash
UI_THEME=system          # light, dark, system
UI_LANGUAGE=fr           # langue de l'interface
UI_TIMEZONE=Europe/Paris # fuseau horaire
UI_DATE_FORMAT=DD/MM/YYYY
UI_TIME_FORMAT=HH:mm
```

## Utilisation de la Configuration

### Importation de Base

```typescript
import { config } from '@/lib/config'

// Accès à toutes les configurations
console.log(config.app.name)
console.log(config.database.url)
console.log(config.security.jwt.secret)
```

### Utilisation des Utilitaires

```typescript
import { configUtils } from '@/lib/config-utils'

// Initialisation et validation
configUtils.initializeConfig()

// Vérification des fonctionnalités
if (configUtils.isFeatureEnabled('auth')) {
  // L'authentification est activée
}

// Configuration spécifique
const dbConfig = configUtils.getDatabaseConfig()
const serverConfig = configUtils.getServerConfig()
const socketConfig = configUtils.getSocketConfig()
```

### Exemples Pratiques

#### 1. Configuration de Prisma

```typescript
import { configUtils } from '@/lib/config-utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  ...configUtils.createPrismaConfig(),
})
```

#### 2. Configuration du Serveur Express

```typescript
import { configUtils } from '@/lib/config-utils'
import express from 'express'

const app = express()
const serverConfig = configUtils.getServerConfig()

app.listen(serverConfig.port, () => {
  console.log(`Serveur démarré sur le port ${serverConfig.port}`)
})
```

#### 3. Configuration de Socket.IO

```typescript
import { Server } from 'socket.io'
import { configUtils } from '@/lib/config-utils'

const io = new Server(httpServer, {
  ...configUtils.getSocketConfig(),
})
```

#### 4. Validation de Configuration

```typescript
import { validateConfig } from '@/lib/config'

const validation = validateConfig()
if (!validation.valid) {
  console.error('Erreurs de configuration:', validation.errors)
  process.exit(1)
}
```

## Bonnes Pratiques

### 1. Sécurité

- **Jamais** committer votre fichier `.env` dans Git
- Utilisez des valeurs par défaut sécurisées en développement
- Changez tous les secrets par défaut en production
- Utilisez des variables d'environnement pour les informations sensibles

### 2. Environnements

- **Développement** : `NODE_ENV=development`
- **Production** : `NODE_ENV=production`
- **Test** : `NODE_ENV=test`

### 3. Validation

- Toujours valider la configuration au démarrage
- Utilisez la validation intégrée ou créez des validations personnalisées
- Arrêtez l'application si la configuration est invalide en production

## Dépannage

### Problèmes Courants

1. **Erreur de connexion à la base de données**
   - Vérifiez `DATABASE_URL` dans `.env`
   - Assurez-vous que le fichier de base de données existe
   - Vérifiez les permissions du fichier

2. **Erreur de configuration invalide**
   - Exécutez `configUtils.initializeConfig()` pour voir les erreurs
   - Vérifiez que tous les secrets requis sont définis
   - Assurez-vous que les valeurs sont dans le bon format

3. **Problèmes de CORS**
   - Vérifiez `CORS_ORIGIN` dans `.env`
   - Assurez-vous que l'origine est correcte pour votre environnement

### Journalisation

La configuration inclut des options de journalisation :

```typescript
// En développement, plus de détails sont journalisés
if (process.env.NODE_ENV === 'development') {
  console.log(configUtils.generateConfigReport())
}
```

## Migration depuis l'Ancienne Configuration

Si vous migrez depuis l'ancien système :

1. **Remplacez** les accès directs à `process.env` par `config.xxx`
2. **Mettez à jour** `src/lib/db.ts` pour utiliser la nouvelle configuration
3. **Ajoutez** les nouvelles variables d'environnement à votre `.env`
4. **Utilisez** les utilitaires de configuration pour une meilleure gestion

### Exemple de Migration

**Avant :**
```typescript
const db = new PrismaClient({
  log: ['query'],
})
```

**Après :**
```typescript
import { configUtils } from '@/lib/config-utils'

const db = new PrismaClient({
  ...configUtils.createPrismaConfig(),
})
```

## Support

Si vous avez des questions ou des problèmes avec la configuration :

1. Vérifiez ce document
2. Consultez les exemples dans `src/lib/config-example.ts`
3. Utilisez les utilitaires de diagnostic dans `src/lib/config-utils.ts`
4. Vérifiez les erreurs de configuration au démarrage de l'application

---

Cette configuration centralisée rend votre application plus maintenable, plus sécurisée et plus facile à déployer dans différents environnements.