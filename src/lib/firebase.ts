import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { clientFirebaseConfig, getFirebaseDiagnostic } from './firebase-client'

// Configuration Firebase depuis la configuration cliente
const firebaseConfig = clientFirebaseConfig

// Fonction de diagnostic pour le débogage
const logFirebaseDiagnostic = () => {
  if (process.env.NODE_ENV === 'development') {
    const diagnostic = getFirebaseDiagnostic()
    console.log('=== Firebase Diagnostic ===')
    console.log('Configuration status:', diagnostic)
    if (!diagnostic.isConfigured) {
      console.error('Firebase is not properly configured!')
      console.error('Missing variables:')
      if (!diagnostic.hasApiKey) console.error('- NEXT_PUBLIC_FIREBASE_API_KEY')
      if (!diagnostic.hasAuthDomain) console.error('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
      if (!diagnostic.hasProjectId) console.error('- NEXT_PUBLIC_FIREBASE_PROJECT_ID')
      if (!diagnostic.hasAppId) console.error('- NEXT_PUBLIC_FIREBASE_APP_ID')
    }
    console.log('========================')
  }
}

// Vérifier la configuration avant d'initialiser Firebase
if (!clientFirebaseConfig.apiKey || !clientFirebaseConfig.authDomain || !clientFirebaseConfig.projectId || !clientFirebaseConfig.appId) {
  logFirebaseDiagnostic()
  throw new Error('Firebase configuration is incomplete. Please check your NEXT_PUBLIC_ environment variables.')
}

// Initialiser Firebase
let app: any
let auth: any
let googleProvider: any
let analytics: any = null

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  
  // Initialiser Analytics (uniquement côté client)
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app)
    } catch (error) {
      console.warn('Analytics non disponible:', error)
    }
  }
  
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Failed to initialize Firebase:', error)
  logFirebaseDiagnostic()
  throw error
}

// Fonctions d'authentification
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Erreur lors de la connexion avec Google:', error)
    throw error
  }
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Erreur lors de la connexion avec email:', error)
    throw error
  }
}

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    throw error
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    throw error
  }
}

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Exporter les instances et la configuration
export { auth, app, analytics }
export { firebaseConfig }

// Fonction utilitaire pour vérifier si Firebase est configuré
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  )
}

// Fonction utilitaire pour obtenir la configuration Firebase
export const getFirebaseConfig = () => {
  return {
    ...firebaseConfig,
    isConfigured: isFirebaseConfigured(),
  }
}

// Fonction pour obtenir le statut de configuration
export const getFirebaseStatus = () => {
  const configured = isFirebaseConfigured()
  return {
    configured,
    apiKey: !!firebaseConfig.apiKey,
    authDomain: !!firebaseConfig.authDomain,
    projectId: !!firebaseConfig.projectId,
    appId: !!firebaseConfig.appId,
    hasAnalytics: !!analytics,
    hasDatabase: !!firebaseConfig.databaseURL,
  }
}

// Exporter la fonction de diagnostic
export { getFirebaseDiagnostic }