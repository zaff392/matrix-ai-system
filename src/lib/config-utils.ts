/**
 * Utilitaires pour la gestion de la configuration
 * Fournit des fonctions helpers pour travailler avec la configuration
 */

import { config, validateConfig } from './config'

/**
 * Charge et valide la configuration au démarrage de l'application
 */
export function initializeConfig(): void {
  const validation = validateConfig()
  
  if (!validation.valid) {
    console.error('❌ Erreurs de configuration détectées :')
    validation.errors.forEach(error => {
      console.error(`  - ${error}`)
    })
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Configuration invalide. Arrêt de l\'application.')
    } else {
      console.warn('⚠️  Configuration invalide en mode développement. L\'application continue avec des valeurs par défaut.')
    }
  } else {
    console.log('✅ Configuration validée avec succès')
  }
}

/**
 * Obtient la configuration de la base de données avec gestion des erreurs
 */
export function getDatabaseConfig() {
  try {
    return {
      ...config.database,
      // S'assurer que l'URL est toujours définie
      url: config.database.url || 'file:./dev.db'
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration de la base de données:', error)
    return {
      url: 'file:./dev.db',
      provider: 'sqlite',
      log: ['error']
    }
  }
}

/**
 * Obtient la configuration du serveur avec valeurs par défaut
 */
export function getServerConfig() {
  return {
    ...config.server,
    port: config.app.port,
  }
}

/**
 * Obtient la configuration WebSocket avec valeurs par défaut
 */
export function getSocketConfig() {
  return {
    ...config.socket,
    cors: {
      ...config.socket.cors,
      origin: config.socket.cors.origin || config.app.baseUrl,
    },
  }
}

/**
 * Vérifie si une fonctionnalité est activée
 */
export function isFeatureEnabled(featureName: keyof typeof config.features): boolean {
  return config.features[featureName] !== false
}

/**
 * Obtient la configuration pour un service externe spécifique
 */
export function getExternalServiceConfig(serviceName: keyof typeof config.externalServices) {
  return config.externalServices[serviceName] || {}
}

/**
 * Crée un objet de configuration pour Prisma
 */
export function createPrismaConfig() {
  const dbConfig = getDatabaseConfig()
  
  return {
    datasources: {
      db: {
        url: dbConfig.url,
      },
    },
    log: dbConfig.log,
  }
}

/**
 * Génère un rapport de configuration pour le débogage
 */
export function generateConfigReport(): string {
  const report = [
    '=== Rapport de Configuration ===',
    '',
    'Application:',
    `  Nom: ${config.app.name}`,
    `  Version: ${config.app.version}`,
    `  Environnement: ${config.app.environment}`,
    `  Port: ${config.app.port}`,
    `  URL de base: ${config.app.baseUrl}`,
    '',
    'Base de données:',
    `  Fournisseur: ${config.database.provider}`,
    `  URL: ${config.database.url}`,
    `  Journalisation: ${config.database.log.join(', ')}`,
    '',
    'Serveur:',
    `  Origine CORS: ${config.server.cors.origin}`,
    `  Session max âge: ${config.server.session.maxAge}s`,
    '',
    'WebSocket:',
    `  Chemin: ${config.socket.path}`,
    `  Transports: ${config.socket.transports.join(', ')}`,
    '',
    'Fonctionnalités:',
    `  Authentification: ${isFeatureEnabled('auth') ? 'Activée' : 'Désactivée'}`,
    `  Mémoire: ${isFeatureEnabled('memory') ? 'Activée' : 'Désactivée'}`,
    `  Bannière LED: ${isFeatureEnabled('ledBanner') ? 'Activée' : 'Désactivée'}`,
    `  WebSocket: ${isFeatureEnabled('websocket') ? 'Activée' : 'Désactivée'}`,
    '',
    'Interface utilisateur:',
    `  Thème: ${config.ui.theme}`,
    `  Langue: ${config.ui.language}`,
    `  Fuseau horaire: ${config.ui.timezone}`,
    '',
    'Sécurité:',
    `  JWT expiration: ${config.security.jwt.expiresIn}`,
    `  Bcrypt rounds: ${config.security.bcrypt.saltRounds}`,
    `  Rate limit: ${config.security.rateLimit.max} requêtes / ${config.security.rateLimit.windowMs}ms`,
    '',
    '===============================',
  ]
  
  return report.join('\n')
}

/**
 * Exporte toutes les fonctions utilitaires
 */
export const configUtils = {
  initializeConfig,
  getDatabaseConfig,
  getServerConfig,
  getSocketConfig,
  isFeatureEnabled,
  getExternalServiceConfig,
  createPrismaConfig,
  generateConfigReport,
}

export default configUtils