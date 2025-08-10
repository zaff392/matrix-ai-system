/**
 * Fichier de configuration centralisé pour l'application
 * Ce fichier gère tous les paramètres de configuration de l'application
 */

// Configuration de la base de données
export const databaseConfig = {
  url: process.env.DATABASE_URL || 'file:./dev.db',
  provider: 'sqlite',
  // Options supplémentaires pour Prisma
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
}

// Configuration de l'application
export const appConfig = {
  name: 'Matrix AI System',
  version: '1.0.0',
  description: 'Système IA multi-agents avec styles de communication',
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
}

// Configuration du serveur
export const serverConfig = {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400', 10), // 24 heures en secondes
  },
}

// Configuration WebSocket/Socket.IO
export const socketConfig = {
  path: '/api/socketio',
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
}

// Configuration des services externes
export const externalServicesConfig = {
  // Service AI (z-ai-web-dev-sdk)
  ai: {
    apiKey: process.env.AI_API_KEY,
    baseUrl: process.env.AI_BASE_URL,
    timeout: parseInt(process.env.AI_TIMEOUT || '30000', 10),
  },
  
  // Firebase (si utilisé)
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },
}

// Configuration de la sécurité
export const securityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limite chaque IP
  },
}

// Configuration du stockage
export const storageConfig = {
  // Configuration pour le stockage local
  local: {
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif'],
  },
  
  // Configuration pour le stockage cloud (si utilisé)
  cloud: {
    provider: process.env.CLOUD_STORAGE_PROVIDER || 'local', // 'local', 'aws', 'gcp', 'azure'
    bucket: process.env.CLOUD_STORAGE_BUCKET,
    region: process.env.CLOUD_STORAGE_REGION,
    accessKey: process.env.CLOUD_STORAGE_ACCESS_KEY,
    secretKey: process.env.CLOUD_STORAGE_SECRET_KEY,
  },
}

// Configuration de la journalisation
export const loggingConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'combined',
  file: process.env.LOG_FILE || './logs/app.log',
  maxSize: process.env.LOG_MAX_SIZE || '10m',
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
}

// Configuration des fonctionnalités
export const featureConfig = {
  // Activation/Désactivation des fonctionnalités
  auth: process.env.FEATURE_AUTH !== 'false', // Activé par défaut
  memory: process.env.FEATURE_MEMORY !== 'false', // Activé par défaut
  ledBanner: process.env.FEATURE_LED_BANNER !== 'false', // Activé par défaut
  websocket: process.env.FEATURE_WEBSOCKET !== 'false', // Activé par défaut
  
  // Limites
  maxConversations: parseInt(process.env.MAX_CONVERSATIONS || '50', 10),
  maxMessagesPerConversation: parseInt(process.env.MAX_MESSAGES_PER_CONVERSATION || '1000', 10),
  maxMemoriesPerAgent: parseInt(process.env.MAX_MEMORIES_PER_AGENT || '500', 10),
}

// Configuration de l'interface utilisateur
export const uiConfig = {
  theme: process.env.UI_THEME || 'system', // 'light', 'dark', 'system'
  language: process.env.UI_LANGUAGE || 'fr',
  timezone: process.env.UI_TIMEZONE || 'Europe/Paris',
  dateFormat: process.env.UI_DATE_FORMAT || 'DD/MM/YYYY',
  timeFormat: process.env.UI_TIME_FORMAT || 'HH:mm',
}

// Fonction de validation de la configuration
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validation des configurations requises
  if (!databaseConfig.url) {
    errors.push('DATABASE_URL est requis')
  }
  
  if (!securityConfig.jwt.secret || securityConfig.jwt.secret === 'your-jwt-secret-change-in-production') {
    errors.push('JWT_SECRET doit être configuré avec une valeur sécurisée en production')
  }
  
  if (!serverConfig.session.secret || serverConfig.session.secret === 'your-secret-key-change-in-production') {
    errors.push('SESSION_SECRET doit être configuré avec une valeur sécurisée en production')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Exporter toutes les configurations
export const config = {
  database: databaseConfig,
  app: appConfig,
  server: serverConfig,
  socket: socketConfig,
  externalServices: externalServicesConfig,
  security: securityConfig,
  storage: storageConfig,
  logging: loggingConfig,
  features: featureConfig,
  ui: uiConfig,
}

export default config