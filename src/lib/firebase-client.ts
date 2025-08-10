/**
 * Configuration Firebase côté client
 * Ce fichier expose les variables Firebase nécessaires pour le fonctionnement côté client
 */

// Configuration Firebase pour le côté client - utilise uniquement les variables NEXT_PUBLIC_
export const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
}

// Fonction pour vérifier si la configuration cliente Firebase est valide
export const isClientFirebaseConfigured = () => {
  const config = clientFirebaseConfig
  return !!(
    config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId
  )
}

// Fonction pour obtenir la configuration cliente Firebase
export const getClientFirebaseConfig = () => {
  return {
    ...clientFirebaseConfig,
    isConfigured: isClientFirebaseConfigured(),
  }
}

// Fonction de diagnostic pour le débogage
export const getFirebaseDiagnostic = () => {
  const config = clientFirebaseConfig
  return {
    hasApiKey: !!config.apiKey,
    hasAuthDomain: !!config.authDomain,
    hasProjectId: !!config.projectId,
    hasAppId: !!config.appId,
    hasStorageBucket: !!config.storageBucket,
    hasMessagingSenderId: !!config.messagingSenderId,
    hasMeasurementId: !!config.measurementId,
    hasDatabaseURL: !!config.databaseURL,
    isConfigured: isClientFirebaseConfigured(),
    config: {
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'missing',
      authDomain: config.authDomain || 'missing',
      projectId: config.projectId || 'missing',
      appId: config.appId ? `${config.appId.substring(0, 8)}...` : 'missing',
    }
  }
}

export default clientFirebaseConfig