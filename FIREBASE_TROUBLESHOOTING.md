# Dépannage Firebase

Ce document vous aide à résoudre les problèmes courants avec Firebase dans votre application Next.js.

## Erreur Courante: `FirebaseError: Firebase: Error (auth/invalid-api-key)`

### Cause Principale
Cette erreur se produit lorsque Next.js ne peut pas accéder aux variables d'environnement Firebase côté client. Dans Next.js, les variables d'environnement accessibles côté client doivent être préfixées par `NEXT_PUBLIC_`.

### Solution

#### 1. Vérifier votre fichier `.env`

Assurez-vous que votre fichier `.env` contient les variables avec le préfixe `NEXT_PUBLIC_` :

```bash
# Variables Firebase côté client (Next.js) - OBLIGATOIRE
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCwC4eBjqKjWbv5YO2CDqGZowhB29YLAVI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=agents-ia-e5a5f.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=agents-ia-e5a5f
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=agents-ia-e5a5f.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=68160256788
NEXT_PUBLIC_FIREBASE_APP_ID=1:68160256788:web:35240aa314cb200e25e001
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-4YHEG8T6NH
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://agents-ia-e5a5f-default-rtdb.europe-west1.firebasedatabase.app
```

#### 2. Redémarrer le serveur de développement

Après avoir modifié le fichier `.env`, vous devez redémarrer le serveur :

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

#### 3. Vérifier la configuration

Utilisez le composant `FirebaseDebug` pour vérifier votre configuration :

```tsx
import FirebaseDebug from '@/components/debug/FirebaseDebug'

// Dans votre composant
<FirebaseDebug />
```

## Étapes de Dépannage Complètes

### Étape 1: Vérifier les variables d'environnement

```bash
# Vérifier que le fichier .env existe et contient les bonnes valeurs
cat .env

# Chercher les variables Firebase
grep "FIREBASE" .env
```

### Étape 2: Vérifier l'accès aux variables côté client

Créez un composant de test pour vérifier que les variables sont accessibles :

```tsx
'use client'

export default function EnvTest() {
  return (
    <div>
      <h3>Variables d'environnement</h3>
      <p>NEXT_PUBLIC_FIREBASE_API_KEY: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Présent' : 'Manquant'}</p>
      <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Manquant'}</p>
      <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Manquant'}</p>
      <p>NEXT_PUBLIC_FIREBASE_APP_ID: {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'Manquant'}</p>
    </div>
  )
}
```

### Étape 3: Vérifier la configuration Firebase

Utilisez les fonctions de diagnostic incluses :

```tsx
import { getFirebaseDiagnostic, isFirebaseConfigured } from '@/lib/firebase'

// Dans un composant ou pour le débogage
const diagnostic = getFirebaseDiagnostic()
const configured = isFirebaseConfigured()

console.log('Diagnostic:', diagnostic)
console.log('Configuré:', configured)
```

### Étape 4: Tester l'initialisation Firebase

```tsx
import { initializeApp } from 'firebase/app'

try {
  const app = initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  })
  console.log('✅ Firebase initialisé avec succès')
} catch (error) {
  console.error('❌ Erreur d\'initialisation Firebase:', error)
}
```

## Problèmes Courants et Solutions

### Problème 1: Variables non accessibles côté client

**Symptôme:** `undefined` ou `""` pour les variables Firebase

**Cause:** Variables sans préfixe `NEXT_PUBLIC_`

**Solution:**
```bash
# Incorrect
FIREBASE_API_KEY=your-key

# Correct
NEXT_PUBLIC_FIREBASE_API_KEY=your-key
```

### Problème 2: Clé API invalide

**Symptôme:** `auth/invalid-api-key`

**Causes possibles:**
1. Clé API incorrecte
2. Clé API mal copiée
3. Problème de configuration Firebase Console

**Solution:**
1. Vérifiez votre clé dans la [Console Firebase](https://console.firebase.google.com/)
2. Copiez-la à nouveau sans espaces supplémentaires
3. Assurez-vous que l'application web est correctement enregistrée

### Problème 3: Domaine non autorisé

**Symptôme:** `auth/unauthorized-domain`

**Cause:** Le domaine n'est pas dans la liste des domaines autorisés

**Solution:**
1. Allez dans la Console Firebase → Authentication → Paramètres
2. Ajoutez votre domaine (ex: `localhost`, `localhost:3000`, `votre-domaine.com`)
3. Pour le développement local, ajoutez `localhost` et `localhost:3000`

### Problème 4: Configuration incomplète

**Symptôme:** Erreurs d'initialisation multiples

**Cause:** Variables manquantes

**Solution:**
Assurez-vous d'avoir au minimum ces 4 variables :
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Script de Vérification Automatique

Créez ce script pour vérifier votre configuration :

```bash
#!/bin/bash

echo "=== Vérification de la configuration Firebase ==="

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env non trouvé!"
    exit 1
fi

# Vérifier les variables obligatoires
required_vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "NEXT_PUBLIC_FIREBASE_APP_ID"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if grep -q "^$var=" .env; then
        echo "✅ $var trouvé"
    else
        echo "❌ $var manquant"
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo ""
    echo "🎉 Toutes les variables obligatoires sont présentes!"
    echo ""
    echo "N'oubliez pas de redémarrer votre serveur de développement:"
    echo "npm run dev"
else
    echo ""
    echo "❌ Variables manquantes: ${missing_vars[*]}"
    echo ""
    echo "Ajoutez ces variables à votre fichier .env:"
    for var in "${missing_vars[@]}"; do
        echo "$var=votre_valeur_ici"
    done
fi
```

## Checklist de Dépannage

- [ ] Le fichier `.env` existe
- [ ] Les variables `NEXT_PUBLIC_FIREBASE_*` sont présentes
- [ ] Les valeurs sont correctes (pas d'espaces, pas de caractères manquants)
- [ ] Le serveur de développement a été redémarré après modification du `.env`
- [ ] Le domaine est autorisé dans la Console Firebase
- [ ] La clé API est valide et active
- [ ] L'application web est correctement enregistrée dans Firebase

## Support

Si vous continuez à avoir des problèmes :

1. Consultez ce document de dépannage
2. Utilisez le composant `FirebaseDebug` pour diagnostiquer
3. Vérifiez la [documentation Next.js sur les variables d'environnement](https://nextjs.org/docs/basic-features/environment-variables)
4. Consultez la [documentation Firebase](https://firebase.google.com/docs)

---

Ce guide devrait vous aider à résoudre la plupart des problèmes de configuration Firebase dans votre application Next.js.