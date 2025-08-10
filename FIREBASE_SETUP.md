# Configuration Firebase

Ce document explique comment configurer et utiliser Firebase dans votre application Matrix AI System avec le nouveau système de configuration centralisée.

## Configuration Terminée

Votre configuration Firebase a été intégrée avec succès dans le système de configuration centralisé. Voici ce qui a été mis en place :

### 1. Fichiers de Configuration

- **`.env`** - Contient vos identifiants Firebase
- **`src/lib/config.ts`** - Configuration centralisée incluant Firebase
- **`src/lib/firebase.ts`** - Configuration Firebase mise à jour
- **`src/lib/firebase-client.ts`** - Configuration côté client pour Next.js

### 2. Votre Configuration Firebase

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCwC4eBjqKjWbv5YO2CDqGZowhB29YLAVI",
  authDomain: "agents-ia-e5a5f.firebaseapp.com",
  databaseURL: "https://agents-ia-e5a5f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "agents-ia-e5a5f",
  storageBucket: "agents-ia-e5a5f.firebasestorage.app",
  messagingSenderId: "68160256788",
  appId: "1:68160256788:web:35240aa314cb200e25e001",
  measurementId: "G-4YHEG8T6NH"
}
```

## Utilisation de Firebase

### Importation des Fonctions Firebase

```typescript
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword, 
  logoutUser,
  onAuthChange,
  isFirebaseConfigured,
  getFirebaseConfig,
  getFirebaseStatus
} from '@/lib/firebase'
```

### Vérification de la Configuration

```typescript
// Vérifier si Firebase est correctement configuré
if (isFirebaseConfigured()) {
  console.log('Firebase est configuré et prêt à être utilisé')
} else {
  console.error('Firebase n\'est pas correctement configuré')
}

// Obtenir le statut détaillé
const status = getFirebaseStatus()
console.log('Statut Firebase:', status)
```

### Authentification

#### Connexion avec Google

```typescript
try {
  const user = await signInWithGoogle()
  console.log('Utilisateur connecté:', user.displayName)
} catch (error) {
  console.error('Erreur de connexion:', error)
}
```

#### Connexion avec Email/Mot de passe

```typescript
try {
  const user = await signInWithEmail('user@example.com', 'password123')
  console.log('Utilisateur connecté:', user.email)
} catch (error) {
  console.error('Erreur de connexion:', error)
}
```

#### Inscription avec Email/Mot de passe

```typescript
try {
  const user = await signUpWithEmail('newuser@example.com', 'password123')
  console.log('Nouvel utilisateur créé:', user.email)
} catch (error) {
  console.error('Erreur d\'inscription:', error)
}
```

#### Réinitialisation de Mot de Passe

```typescript
try {
  await resetPassword('user@example.com')
  console.log('Email de réinitialisation envoyé')
} catch (error) {
  console.error('Erreur de réinitialisation:', error)
}
```

#### Déconnexion

```typescript
try {
  await logoutUser()
  console.log('Utilisateur déconnecté')
} catch (error) {
  console.error('Erreur de déconnexion:', error)
}
```

### Écoute des Changements d'Authentification

```typescript
import { useEffect } from 'react'
import { onAuthChange } from '@/lib/firebase'

useEffect(() => {
  const unsubscribe = onAuthChange((user) => {
    if (user) {
      // Utilisateur connecté
      console.log('Utilisateur connecté:', user.displayName)
    } else {
      // Utilisateur déconnecté
      console.log('Utilisateur déconnecté')
    }
  })

  // Nettoyage
  return () => unsubscribe()
}, [])
```

### Utilisation dans les Composants React

```typescript
'use client'

import { useState, useEffect } from 'react'
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  logoutUser,
  onAuthChange,
  User 
} from '@/lib/firebase'

export default function AuthComponent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmail(email, password)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleEmailSignUp = async () => {
    try {
      await signUpWithEmail(email, password)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (user) {
    return (
      <div>
        <h2>Bienvenue, {user.displayName}!</h2>
        <p>Email: {user.email}</p>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
    )
  }

  return (
    <div>
      <h2>Connexion</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleEmailSignIn}>Connexion</button>
      <button onClick={handleEmailSignUp}>Inscription</button>
      <button onClick={handleGoogleSignIn}>Connexion avec Google</button>
    </div>
  )
}
```

## Configuration Avancée

### Variables d'Environnement

Pour le déploiement, vous pouvez utiliser les variables d'environnement suivantes :

```bash
# Variables côté serveur
FIREBASE_API_KEY=AIzaSyCwC4eBjqKjWbv5YO2CDqGZowhB29YLAVI
FIREBASE_AUTH_DOMAIN=agents-ia-e5a5f.firebaseapp.com
FIREBASE_PROJECT_ID=agents-ia-e5a5f
FIREBASE_STORAGE_BUCKET=agents-ia-e5a5f.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=68160256788
FIREBASE_APP_ID=1:68160256788:web:35240aa314cb200e25e001
FIREBASE_MEASUREMENT_ID=G-4YHEG8T6NH
FIREBASE_DATABASE_URL=https://agents-ia-e5a5f-default-rtdb.europe-west1.firebasedatabase.app

# Variables côté client (Next.js)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCwC4eBjqKjWbv5YO2CDqGZowhB29YLAVI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=agents-ia-e5a5f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=agents-ia-e5a5f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=agents-ia-e5a5f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=68160256788
NEXT_PUBLIC_FIREBASE_APP_ID=1:68160256788:web:35240aa314cb200e25e001
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4YHEG8T6NH
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://agents-ia-e5a5f-default-rtdb.europe-west1.firebasedatabase.app
```

### Services Firebase Supplémentaires

#### Firestore Database

```typescript
import { getFirestore } from 'firebase/firestore'
import { app } from '@/lib/firebase'

const db = getFirestore(app)
export { db }
```

#### Firebase Storage

```typescript
import { getStorage } from 'firebase/storage'
import { app } from '@/lib/firebase'

const storage = getStorage(app)
export { storage }
```

#### Firebase Realtime Database

```typescript
import { getDatabase } from 'firebase/database'
import { app } from '@/lib/firebase'

const database = getDatabase(app)
export { database }
```

## Dépannage

### Problèmes Courants

1. **Erreur de configuration Firebase**
   ```typescript
   // Vérifier la configuration
   const config = getFirebaseConfig()
   console.log('Configuration Firebase:', config)
   ```

2. **Erreur d'authentification**
   ```typescript
   // Vérifier le statut
   const status = getFirebaseStatus()
   console.log('Statut Firebase:', status)
   ```

3. **Problèmes côté client**
   - Assurez-vous que les variables `NEXT_PUBLIC_` sont correctement définies
   - Vérifiez que vous êtes dans un composant client (`'use client'`)

### Debug

```typescript
// Activer le debug Firebase
if (process.env.NODE_ENV === 'development') {
  console.log('Configuration Firebase:', getFirebaseConfig())
  console.log('Statut Firebase:', getFirebaseStatus())
}
```

## Bonnes Pratiques

1. **Sécurité**
   - Ne jamais exposer vos clés Firebase dans le code client
   - Utilisez les règles de sécurité Firebase pour protéger vos données
   - Validez toujours les données côté serveur

2. **Performance**
   - Utilisez le chargement conditionnel pour les services Firebase
   - Nettoyez les écouteurs d'événements
   - Utilisez le caching lorsque c'est approprié

3. **Développement**
   - Utilisez différents projets Firebase pour développement et production
   - Testez toutes les fonctionnalités d'authentification
   - Gérez les erreurs de manière élégante

## Support

Si vous rencontrez des problèmes avec la configuration Firebase :

1. Vérifiez ce document
2. Consultez la [documentation Firebase](https://firebase.google.com/docs)
3. Vérifiez votre configuration dans la [console Firebase](https://console.firebase.google.com/)
4. Utilisez les fonctions de diagnostic fournies

---

Votre configuration Firebase est maintenant entièrement intégrée dans le système de configuration centralisé de votre application. Vous pouvez utiliser toutes les fonctionnalités Firebase de manière cohérente et sécurisée.