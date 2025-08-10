'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  displayName: string
}

export default function FormDebugComponent() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    console.log(`🔧 handleInputChange appelé: field=${field}, value=${value}`)
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log(`📝 Nouvel état du formulaire:`, newData)
      return newData
    })
  }

  return (
    <Card className="p-6 bg-black/90 border border-green-500/30">
      <h2 className="text-xl font-bold text-green-400 mb-4">Débogage du Formulaire</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-green-400 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
            <Input
              type="email"
              name="debug-email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Entrez votre email"
              className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-green-400 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="debug-password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Entrez votre mot de passe"
              className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-black/60 border border-green-500/20 rounded">
          <h3 className="text-sm font-medium text-green-400 mb-2">État du formulaire:</h3>
          <pre className="text-xs text-green-600 bg-black/40 p-2 rounded overflow-x-auto">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>

        <div className="text-xs text-green-600">
          <p>📝 Ouvrez la console du navigateur pour voir les logs détaillés</p>
          <p>🔧 Testez les champs et vérifiez que les bonnes valeurs sont mises à jour</p>
        </div>
      </div>
    </Card>
  )
}