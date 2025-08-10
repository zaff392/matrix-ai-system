'use client'

import { useState, useEffect } from 'react'

interface LedBannerConfig {
  enabled: boolean
  text: string
  color: string
  fontFamily: string
  style: 'fixed' | 'blinking'
  speed: number
}

const DEFAULT_CONFIG: LedBannerConfig = {
  enabled: true,
  text: "BIENVENUE DANS LA MATRIX - SYSTEME IA ACTIF",
  color: '#00ff00',
  fontFamily: 'monospace',
  style: 'fixed',
  speed: 1
}

export function useLedBanner() {
  const [config, setConfig] = useState<LedBannerConfig>(() => {
    // Essayer de charger depuis localStorage
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('led-banner-config')
        if (saved) {
          return { ...DEFAULT_CONFIG, ...JSON.parse(saved) }
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la config LED:', error)
      }
    }
    return DEFAULT_CONFIG
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement depuis le stockage local
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const updateConfig = (updates: Partial<LedBannerConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('led-banner-config', JSON.stringify(newConfig))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la config LED:', error)
      }
    }
  }

  const saveConfig = (newConfig: LedBannerConfig) => {
    setConfig(newConfig)
    
    // Sauvegarder dans localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('led-banner-config', JSON.stringify(newConfig))
        console.log('Configuration LED sauvegardée:', newConfig)
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la config LED:', error)
      }
    }
  }

  const resetConfig = () => {
    updateConfig(DEFAULT_CONFIG)
  }

  const enableBanner = () => {
    updateConfig({ enabled: true })
  }

  const disableBanner = () => {
    updateConfig({ enabled: false })
  }

  const toggleBanner = () => {
    updateConfig({ enabled: !config.enabled })
  }

  return {
    config,
    updateConfig,
    saveConfig,
    resetConfig,
    enableBanner,
    disableBanner,
    toggleBanner,
    isLoading
  }
}