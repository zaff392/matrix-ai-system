'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Chrome, 
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { 
    signIn, 
    signUp, 
    resetPasswordRequest, 
    saveCredentials, 
    getSavedEmail, 
    getRememberMe 
  } = useAuth()
  
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(getRememberMe())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resetMode, setResetMode] = useState(false)
  
  const [formData, setFormData] = useState({
    email: getSavedEmail(),
    password: '',
    confirmPassword: '',
    displayName: ''
  })

  if (!isOpen) return null

  const handleInputChange = (field: string, value: string) => {
<<<<<<< HEAD
    console.log(`🔧 handleInputChange appelé: field=${field}, value=${value}`)
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log(`📝 Nouvel état du formulaire:`, newData)
      return newData
    })
=======
    setFormData(prev => ({ ...prev, [field]: value }))
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
    setError('')
    setSuccess('')
  }

<<<<<<< HEAD
  const handleInputBlur = (field: string, value: string) => {
    console.log(`🔍 handleInputBlur appelé: field=${field}, value=${value}`)
    // Forcer la mise à jour de l'état au cas où le navigateur aurait modifié la valeur
    setFormData(prev => ({ ...prev, [field]: value }))
  }

=======
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await signIn(formData.email, formData.password)
      saveCredentials(formData.email, rememberMe)
      setSuccess('Connexion réussie!')
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      await signUp(formData.email, formData.password)
      setSuccess('Inscription réussie! Vérifiez votre email.')
      setTimeout(() => {
        setActiveTab('login')
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erreur d\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await resetPasswordRequest(formData.email)
      setSuccess('Email de réinitialisation envoyé!')
      setTimeout(() => {
        setResetMode(false)
        setActiveTab('login')
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      await signIn()
      setSuccess('Connexion réussie!')
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion avec Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-cyan-500/5"></div>
      
      <Card className="relative z-10 bg-black/90 backdrop-blur-md border border-green-500/30 rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-green-400 tracking-wider">
                MATRIX ACCESS
              </h2>
              <p className="text-sm text-green-600">Authentification requise</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-green-400 hover:text-green-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">{success}</span>
            </div>
          )}

          {/* Reset Password Mode */}
          {resetMode ? (
<<<<<<< HEAD
            <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
=======
            <form onSubmit={handleResetPassword} className="space-y-4">
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                  <Input
                    type="email"
<<<<<<< HEAD
                    name="reset-email"
                    autoComplete="off"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={(e) => handleInputBlur('email', e.target.value)}
=======
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                    placeholder="Entrez votre email"
                    className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.email}
                className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setResetMode(false)}
                className="w-full text-green-400 hover:text-green-300"
              >
                Retour à la connexion
              </Button>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-black/60 border border-green-500/30">
                <TabsTrigger value="login" className="data-[state=active]:bg-green-500/20">
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-green-500/20">
                  Inscription
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
<<<<<<< HEAD
                <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
=======
                <form onSubmit={handleLogin} className="space-y-4">
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                  <div>
                    <label className="block text-sm font-medium text-green-400 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                      <Input
                        type="email"
<<<<<<< HEAD
                        name="login-email"
                        autoComplete="off"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => handleInputBlur('email', e.target.value)}
=======
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                        placeholder="Entrez votre email"
                        className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10"
                        required
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
<<<<<<< HEAD
                        name="login-password"
                        autoComplete="off"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={(e) => handleInputBlur('password', e.target.value)}
=======
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                        placeholder="Entrez votre mot de passe"
                        className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10 pr-10"
                        required
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

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => {
                          setRememberMe(checked as boolean)
                        }}
                        className="border-green-500/30 data-[state=checked]:bg-green-500"
                      />
                      <label htmlFor="remember" className="text-sm text-green-400">
                        Se souvenir de moi
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setResetMode(true)}
                      className="text-green-600 hover:text-green-400 text-xs"
                    >
                      Mot de passe oublié?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !formData.email || !formData.password}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </form>

                {/* Google Sign In */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-green-500/30"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black/90 px-2 text-green-600">Ou continuer avec</span>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-green-400 border border-green-500/30"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  {loading ? 'Connexion en cours...' : 'Google'}
                </Button>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
<<<<<<< HEAD
                <form onSubmit={handleSignUp} className="space-y-4" autoComplete="off">
=======
                <form onSubmit={handleSignUp} className="space-y-4">
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                  <div>
                    <label className="block text-sm font-medium text-green-400 mb-2">
                      Nom d'affichage
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                      <Input
                        type="text"
<<<<<<< HEAD
                        name="register-name"
                        autoComplete="off"
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        onBlur={(e) => handleInputBlur('displayName', e.target.value)}
=======
                        value={formData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                        placeholder="Entrez votre nom"
                        className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-400 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                      <Input
                        type="email"
<<<<<<< HEAD
                        name="register-email"
                        autoComplete="off"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        onBlur={(e) => handleInputBlur('email', e.target.value)}
=======
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                        placeholder="Entrez votre email"
                        className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10"
                        required
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
<<<<<<< HEAD
                        name="register-password"
                        autoComplete="off"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        onBlur={(e) => handleInputBlur('password', e.target.value)}
=======
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                        placeholder="Entrez votre mot de passe"
                        className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10 pr-10"
                        required
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

                  <div>
                    <label className="block text-sm font-medium text-green-400 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-600" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
<<<<<<< HEAD
                        name="register-confirm-password"
                        autoComplete="off"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        onBlur={(e) => handleInputBlur('confirmPassword', e.target.value)}
=======
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
                        placeholder="Confirmez votre mot de passe"
                        className="bg-black/40 border-green-500/30 text-green-400 placeholder-green-600 pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-400"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !formData.email || !formData.password || !formData.displayName}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
                  >
                    {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </Card>
    </div>
  )
}