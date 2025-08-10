'use client'

import { useEffect, useState } from 'react'
import { 
  getFirebaseDiagnostic, 
  getFirebaseStatus, 
  isFirebaseConfigured 
} from '@/lib/firebase'

export default function FirebaseDebug() {
  const [diagnostic, setDiagnostic] = useState<any>(null)
  const [status, setStatus] = useState<any>(null)
  const [configured, setConfigured] = useState<boolean>(false)

  useEffect(() => {
    // Récupérer les informations de diagnostic
    const diag = getFirebaseDiagnostic()
    const stat = getFirebaseStatus()
    const conf = isFirebaseConfigured()
    
    setDiagnostic(diag)
    setStatus(stat)
    setConfigured(conf)
    
    console.log('Firebase Debug Info:', { diagnostic: diag, status: stat, configured: conf })
  }, [])

  if (!diagnostic || !status) {
    return <div>Chargement du diagnostic Firebase...</div>
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-4">Diagnostic Firebase</h3>
      
      <div className="space-y-4">
        {/* Statut général */}
        <div className="p-3 rounded bg-white">
          <h4 className="font-semibold mb-2">Statut Général</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span className="w-32">Configuré:</span>
              <span className={`px-2 py-1 rounded text-xs ${configured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {configured ? '✅ Oui' : '❌ Non'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-32">Analytics:</span>
              <span className={`px-2 py-1 rounded text-xs ${status.hasAnalytics ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status.hasAnalytics ? '✅ Disponible' : '⚠️ Non disponible'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-32">Database:</span>
              <span className={`px-2 py-1 rounded text-xs ${status.hasDatabase ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {status.hasDatabase ? '✅ Disponible' : '⚠️ Non disponible'}
              </span>
            </div>
          </div>
        </div>

        {/* Variables d'environnement */}
        <div className="p-3 rounded bg-white">
          <h4 className="font-semibold mb-2">Variables d'Environnement</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span className="w-40">API Key:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {diagnostic.hasApiKey ? `✅ ${diagnostic.config.apiKey}` : '❌ Manquante'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-40">Auth Domain:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasAuthDomain ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {diagnostic.hasAuthDomain ? `✅ ${diagnostic.config.authDomain}` : '❌ Manquant'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-40">Project ID:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasProjectId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {diagnostic.hasProjectId ? `✅ ${diagnostic.config.projectId}` : '❌ Manquant'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-40">App ID:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasAppId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {diagnostic.hasAppId ? `✅ ${diagnostic.config.appId}` : '❌ Manquant'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-40">Storage Bucket:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasStorageBucket ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {diagnostic.hasStorageBucket ? '✅ Présent' : '⚠️ Manquant'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-40">Messaging Sender ID:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasMessagingSenderId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {diagnostic.hasMessagingSenderId ? '✅ Présent' : '⚠️ Manquant'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-40">Measurement ID:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasMeasurementId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {diagnostic.hasMeasurementId ? '✅ Présent' : '⚠️ Manquant'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-40">Database URL:</span>
              <span className={`px-2 py-1 rounded text-xs ${diagnostic.hasDatabaseURL ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {diagnostic.hasDatabaseURL ? '✅ Présent' : '⚠️ Manquant'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions recommandées */}
        {!configured && (
          <div className="p-3 rounded bg-red-50 border border-red-200">
            <h4 className="font-semibold mb-2 text-red-800">Actions Requises</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {!diagnostic.hasApiKey && <li>• Ajouter NEXT_PUBLIC_FIREBASE_API_KEY dans .env</li>}
              {!diagnostic.hasAuthDomain && <li>• Ajouter NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN dans .env</li>}
              {!diagnostic.hasProjectId && <li>• Ajouter NEXT_PUBLIC_FIREBASE_PROJECT_ID dans .env</li>}
              {!diagnostic.hasAppId && <li>• Ajouter NEXT_PUBLIC_FIREBASE_APP_ID dans .env</li>}
              <li>• Redémarrer le serveur de développement après avoir modifié .env</li>
            </ul>
          </div>
        )}

        {configured && (
          <div className="p-3 rounded bg-green-50 border border-green-200">
            <h4 className="font-semibold mb-2 text-green-800">✅ Firebase est correctement configuré!</h4>
            <p className="text-sm text-green-700">
              Votre configuration Firebase est prête à être utilisée. Vous pouvez maintenant utiliser les fonctionnalités d'authentification.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}