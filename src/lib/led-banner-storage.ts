// Stockage local pour la configuration de la bande LED
export interface LedBannerConfig {
  enabled: boolean
  text: string
  color: string
  fontFamily: string
  style: 'fixed' | 'blinking'
  speed: number
}

const STORAGE_KEY = 'matrix-led-banner-config'

const DEFAULT_CONFIG: LedBannerConfig = {
  enabled: true,
  text: 'BIENVENUE DANS LA MATRIX - SYSTEME IA ACTIF - CHOISISSEZ VOTRE AGENT',
  color: '#00ff00',
  fontFamily: 'monospace',
  style: 'fixed',
  speed: 2
}

export class LedBannerStorage {
  static getConfig(): LedBannerConfig {
    if (typeof window === 'undefined') {
      return DEFAULT_CONFIG
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_CONFIG, ...parsed }
      }
    } catch (error) {
      console.error('Erreur lors de la lecture de la configuration LED:', error)
    }

    return DEFAULT_CONFIG
  }

  static saveConfig(config: LedBannerConfig): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration LED:', error)
    }
  }

  static resetConfig(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la configuration LED:', error)
    }
  }

  static exportConfig(): string {
    const config = this.getConfig()
    return JSON.stringify(config, null, 2)
  }

  static importConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson)
      if (this.validateConfig(config)) {
        this.saveConfig(config)
        return true
      }
      return false
    } catch (error) {
      console.error('Erreur lors de l\'importation de la configuration LED:', error)
      return false
    }
  }

  private static validateConfig(config: any): config is LedBannerConfig {
    return (
      typeof config === 'object' &&
      typeof config.enabled === 'boolean' &&
      typeof config.text === 'string' &&
      typeof config.color === 'string' &&
      typeof config.fontFamily === 'string' &&
      (config.style === 'fixed' || config.style === 'blinking') &&
      typeof config.speed === 'number'
    )
  }
}