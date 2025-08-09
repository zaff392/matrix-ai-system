'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, logoutUser } from '@/lib/firebase'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isAdmin: boolean
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger les identifiants sauvegardés uniquement côté client
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('savedEmail') : null
    const savedRemember = typeof window !== 'undefined' ? localStorage.getItem('rememberMe') === 'true' : false

    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // Pour la démo, on considère que l'utilisateur est admin si son email contient "admin"
        const isAdmin = firebaseUser.email?.includes('admin') || false
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAdmin
        })

        // Sauvegarder l'email si "se souvenir de moi" est coché
        if (savedRemember && savedEmail) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('savedEmail', firebaseUser.email || '')
          }
        }
      } else {
        setUser(null)
        if (!savedRemember) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('savedEmail')
          }
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        await signInWithEmail(email, password)
      } else {
        await signInWithGoogle()
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password)
    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      throw error
    }
  }

  const resetPasswordRequest = async (email: string) => {
    try {
      await resetPassword(email)
    } catch (error) {
      console.error('Erreur de réinitialisation du mot de passe:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
      throw error
    }
  }

  const saveCredentials = (email: string, remember: boolean) => {
    if (typeof window !== 'undefined') {
      if (remember) {
        localStorage.setItem('savedEmail', email)
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('savedEmail')
        localStorage.removeItem('rememberMe')
      }
    }
  }

  const getSavedEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('savedEmail') || ''
    }
    return ''
  }

  const getRememberMe = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rememberMe') === 'true'
    }
    return false
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    resetPasswordRequest,
    logout,
    saveCredentials,
    getSavedEmail,
    getRememberMe
  }
}