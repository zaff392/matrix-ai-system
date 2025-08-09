# Guide de Récupération du Projet Matrix AI System

## 📋 Résumé du Projet

Votre projet est un système d'IA Matrix avec interface web immersive comprenant :
- 20 agents IA uniques avec personnalités et couleurs distinctes
- Système de mémoire à long terme pour les agents
- Interface de chat avec effets visuels immersifs
- Système WebSocket pour communication en temps réel
- Base de données SQLite avec Prisma

## 📁 Structure des Fichiers Importants

### Fichiers Principaux
```
src/
├── app/
│   ├── page.tsx                 # Interface principale (avec toutes les améliorations)
│   ├── layout.tsx              # Layout du site
│   └── globals.css             # Styles globaux
├── styles/
│   └── animations.css          # Animations CSS personnalisées
├── components/
│   ├── auth/
│   │   └── AuthModal.tsx       # Modal d'authentification
│   ├── memory/
│   │   └── MemoryManager.tsx   # Gestionnaire de mémoire
│   ├── admin/
│   │   ├── LikejustManager.tsx  # Gestionnaire Likejust
│   │   └── AgentsManager.tsx    # Gestionnaire d'agents
│   └── ui/                     # Composants UI shadcn
├── lib/
│   ├── ai-service.ts           # Service IA principal
│   ├── ai-service-client.ts    # Client IA côté client
│   ├── memory-service.ts       # Service de mémoire
│   ├── websocket-manager.ts    # Gestionnaire WebSocket
│   ├── socket.ts               # Configuration Socket.IO
│   ├── db.ts                   # Configuration base de données
│   ├── firebase.ts             # Configuration Firebase
│   └── utils.ts                # Utilitaires
├── hooks/
│   ├── useAuth.ts              # Hook d'authentification
│   ├── useWebSocket.ts         # Hook WebSocket
│   ├── use-toast.ts            # Hook pour notifications
│   └── use-mobile.ts           # Hook pour détection mobile
└── data/
    └── styles-ia.ts            # Styles d'IA (document CSV)
```

### Fichiers de Configuration
```
package.json                    # Dépendances du projet
tailwind.config.js              # Configuration Tailwind
tsconfig.json                  # Configuration TypeScript
prisma/
├── schema.prisma              # Schéma de base de données
└── migrations/                # Migrations de base de données
```

## 🚀 Étapes de Récupération

### Étape 1: Télécharger les fichiers principaux

1. **Interface principale** (`src/app/page.tsx`)
   - Contient toute l'interface utilisateur avec les effets visuels
   - Inclut les 20 agents avec leurs couleurs et personnalités
   - Contient le système de réflexion et les animations

2. **Animations CSS** (`src/styles/animations.css`)
   - Contient toutes les animations personnalisées
   - Nécessaire pour les effets visuels immersifs

3. **Layout** (`src/app/layout.tsx`)
   - Configure l'application et importe les animations

### Étape 2: Télécharger les composants importants

1. **Composants UI** (`src/components/ui/`)
   - Tous les composants shadcn/ui nécessaires
   - Boutons, cartes, inputs, etc.

2. **Gestionnaire de mémoire** (`src/components/memory/MemoryManager.tsx`)
   - Système de mémoire à long terme
   - Interface de gestion des souvenirs

3. **Modal d'authentification** (`src/components/auth/AuthModal.tsx`)
   - Système de connexion utilisateur

### Étape 3: Télécharger les services et hooks

1. **Services IA** (`src/lib/ai-service.ts` et `src/lib/ai-service-client.ts`)
   - Cœur du système IA
   - Communication avec les agents

2. **Service de mémoire** (`src/lib/memory-service.ts`)
   - Gestion de la mémoire persistante

3. **Hooks personnalisés** (`src/hooks/`)
   - useAuth.ts - Gestion de l'authentification
   - useWebSocket.ts - Communication WebSocket
   - use-toast.ts - Notifications

### Étape 4: Configuration

1. **Package.json** - Copiez ce fichier pour avoir les bonnes dépendances
2. **Tailwind config** - Configuration du système de design
3. **TypeScript config** - Configuration du langage
4. **Prisma schema** - Structure de la base de données

## 🛠️ Installation et Configuration

### 1. Cloner ou télécharger les fichiers
```bash
# Si vous avez accès à un terminal
git clone <votre-repository> matrix-ai-system
cd matrix-ai-system
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer la base de données
```bash
npx prisma generate
npx prisma db push
```

### 4. Configurer les variables d'environnement
Créez un fichier `.env.local` avec :
```
NEXT_PUBLIC_FIREBASE_API_KEY=votre_cle_api
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_WS_URL="ws://localhost:3000/api/socketio"
```

### 5. Lancer le projet
```bash
npm run dev
```

## 🎨 Fonctionnalités Uniques à Conserver

### 1. Système de Couleurs d'Agents
Chaque agent a une palette unique :
- Likejust: Émeraude/Teal
- Trinity: Violet/Rose  
- Morpheus: Bleu/Indigo
- Agent Smith: Rouge/Rose
- etc.

### 2. Effets Visuels Immersifs
- Effet de réflexion pendant la réflexion
- Particules dynamiques
- Lignes de balayage
- Visualisation audio
- Animations fluides

### 3. Système de Mémoire
- Stockage persistant des conversations
- Apprentissage des préférences utilisateur
- Recherche sémantique
- Gestion manuelle des souvenirs

### 4. Interface Améliorée
- Cartes d'agents avec personnalités
- Effets de survol et transitions
- Messages colorés par agent
- Indicateurs de typing animés

## 🔧 Dépannage

### Problèmes Courants
1. **Module non trouvé**: Vérifiez que toutes les dépendances sont installées
2. **Erreur WebSocket**: Vérifiez la configuration du serveur Socket.IO
3. **Erreur base de données**: Exécutez `npx prisma db push`
4. **Erreur Firebase**: Vérifiez vos identifiants dans .env.local

### Support
Si vous rencontrez des problèmes :
- Vérifiez les logs du serveur
- Consultez la console du navigateur
- Vérifiez que toutes les variables d'environnement sont correctes

## 📞 Contact pour Support

Ce projet a été développé avec Z.ai Code. Pour toute question ou assistance supplémentaire, n'hésitez pas à demander de l'aide.

---

## 🎯 Résumé des Améliorations Implémentées

1. **Système de couleurs dynamiques** pour chaque agent
2. **Effets de réflexion immersifs** pendant l'attente de réponse
3. **Effet rideau** sur les agents pendant qu'ils écrivent
4. **Interface créative** avec animations fluides
5. **Système de mémoire persistant** pour personnalisation
6. **Communication temps réel** avec WebSocket

Votre système est maintenant prêt à être utilisé et offre une expérience utilisateur immersive et professionnelle !