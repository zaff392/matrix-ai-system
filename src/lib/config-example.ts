/**
 * Exemple d'utilisation de la configuration centralisée
 * Ce fichier montre comment utiliser la configuration dans différents contextes
 */

import { config, validateConfig } from './config'
import { configUtils } from './config-utils'
import { PrismaClient } from '@prisma/client'

// Exemple 1: Initialisation de l'application
export function initializeApplication() {
  // Valider la configuration au démarrage
  configUtils.initializeConfig()
  
  // Afficher le rapport de configuration en développement
  if (process.env.NODE_ENV === 'development') {
    console.log(configUtils.generateConfigReport())
  }
  
  // Vérifier les fonctionnalités activées
  if (configUtils.isFeatureEnabled('auth')) {
    console.log('Authentification activée - Initialisation du système d\'auth...')
  }
  
  if (configUtils.isFeatureEnabled('websocket')) {
    console.log('WebSocket activé - Initialisation du serveur Socket.IO...')
  }
}

// Exemple 2: Création d'un client Prisma avec configuration
export function createPrismaClient(): PrismaClient {
  const prismaConfig = configUtils.createPrismaConfig()
  
  return new PrismaClient({
    ...prismaConfig,
  })
}

// Exemple 3: Configuration du serveur HTTP
export function getServerConfiguration() {
  const serverConfig = configUtils.getServerConfig()
  const socketConfig = configUtils.getSocketConfig()
  
  return {
    port: serverConfig.port,
    cors: serverConfig.cors,
    socket: socketConfig,
  }
}

// Exemple 4: Configuration pour l'authentification
export function getAuthConfiguration() {
  return {
    jwtSecret: config.security.jwt.secret,
    jwtExpiresIn: config.security.jwt.expiresIn,
    sessionSecret: config.server.session.secret,
    sessionMaxAge: config.server.session.maxAge,
    bcryptSaltRounds: config.security.bcrypt.saltRounds,
  }
}

// Exemple 5: Configuration pour les limites de l'application
export function getAppLimits() {
  return {
    maxConversations: config.features.maxConversations,
    maxMessagesPerConversation: config.features.maxMessagesPerConversation,
    maxMemoriesPerAgent: config.features.maxMemoriesPerAgent,
  }
}

// Exemple 6: Configuration pour l'interface utilisateur
export function getUIConfiguration() {
  return {
    theme: config.ui.theme,
    language: config.ui.language,
    timezone: config.ui.timezone,
    dateFormat: config.ui.dateFormat,
    timeFormat: config.ui.timeFormat,
  }
}

// Exemple 7: Configuration pour le stockage de fichiers
export function getStorageConfiguration() {
  return {
    ...config.storage.local,
    cloud: config.storage.cloud,
  }
}

// Exemple 8: Validation personnalisée
export function validateCustomConfig() {
  const errors: string[] = []
  
  // Vérification personnalisée pour la base de données
  if (!config.database.url.includes('file:') && !config.database.url.includes('postgresql://')) {
    errors.push('URL de base de données non valide. Doit commencer par "file:" ou "postgresql://"')
  }
  
  // Vérification des ports valides
  if (config.app.port < 1 || config.app.port > 65535) {
    errors.push('Le port doit être entre 1 et 65535')
  }
  
  // Vérification des secrets par défaut
  const defaultSecrets = [
    'your-secret-key-change-in-production',
    'your-jwt-secret-change-in-production',
  ]
  
  if (defaultSecrets.includes(config.server.session.secret)) {
    errors.push('SESSION_SECRET utilise une valeur par défaut non sécurisée')
  }
  
  if (defaultSecrets.includes(config.security.jwt.secret)) {
    errors.push('JWT_SECRET utilise une valeur par défaut non sécurisée')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Exemple 9: Fonction pour basculer entre les environnements
export function getEnvironmentSpecificConfig() {
  const isProduction = config.app.environment === 'production'
  const isDevelopment = config.app.environment === 'development'
  
  return {
    isProduction,
    isDevelopment,
    // Configuration spécifique à l'environnement
    logLevel: isProduction ? 'error' : 'debug',
    corsOrigin: isProduction ? config.app.baseUrl : '*',
    // Activer/désactiver des fonctionnalités selon l'environnement
    enableDebugTools: isDevelopment,
    enableAnalytics: isProduction,
  }
}

// Exemple d'utilisation dans une application réelle
export function setupApplication() {
  // 1. Initialiser la configuration
  initializeApplication()
  
  // 2. Créer le client Prisma
  const prisma = createPrismaClient()
  
  // 3. Obtenir la configuration du serveur
  const serverConfig = getServerConfiguration()
  
  // 4. Obtenir la configuration d'authentification
  const authConfig = getAuthConfiguration()
  
  // 5. Obtenir les limites de l'application
  const appLimits = getAppLimits()
  
  // 6. Obtenir la configuration UI
  const uiConfig = getUIConfiguration()
  
  // 7. Validation personnalisée
  const customValidation = validateCustomConfig()
  if (!customValidation.valid) {
    console.error('Erreurs de configuration personnalisée:', customValidation.errors)
  }
  
  // 8. Configuration spécifique à l'environnement
  const envConfig = getEnvironmentSpecificConfig()
  
  return {
    prisma,
    serverConfig,
    authConfig,
    appLimits,
    uiConfig,
    envConfig,
    isValid: customValidation.valid,
  }
}

// Exporter toutes les fonctions d'exemple
export const configExamples = {
  initializeApplication,
  createPrismaClient,
  getServerConfiguration,
  getAuthConfiguration,
  getAppLimits,
  getUIConfiguration,
  getStorageConfiguration,
  validateCustomConfig,
  getEnvironmentSpecificConfig,
  setupApplication,
}

export default configExamples