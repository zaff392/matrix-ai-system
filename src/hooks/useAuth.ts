'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, logoutUser } from '@/lib/firebase'
<<<<<<< HEAD
import { UserService } from '@/lib/user-service'
import { UserRole } from '@prisma/client'
=======
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
<<<<<<< HEAD
  role: UserRole
  isAdmin: boolean
  isSuperAdmin: boolean
  permissions: string[]
  isActive: boolean
=======
  isAdmin: boolean
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
<<<<<<< HEAD
  const [dbUser, setDbUser] = useState<any>(null)
=======
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0

  useEffect(() => {
    // Charger les identifiants sauvegardés uniquement côté client
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('savedEmail') : null
    const savedRemember = typeof window !== 'undefined' ? localStorage.getItem('rememberMe') === 'true' : false

<<<<<<< HEAD
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Récupérer l'utilisateur depuis la base de données
          const dbUserData = await UserService.getUserByEmail(firebaseUser.email || '')
          
          if (dbUserData) {
            // Récupérer les permissions de l'utilisateur
            const userWithRoles = await UserService.getUserById(dbUserData.id)
            const permissions = userWithRoles?.permissions.map(p => p.name) || []
            
            const isAdmin = await UserService.isAdmin(dbUserData.id)
            const isSuperAdmin = await UserService.isSuperAdmin(dbUserData.id)
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || dbUserData.name,
              photoURL: firebaseUser.photoURL,
              role: dbUserData.role,
              isAdmin,
              isSuperAdmin,
              permissions,
              isActive: dbUserData.isActive
            })
            
            setDbUser(dbUserData)
          } else {
            // Si l'utilisateur n'existe pas dans la base de données, le créer
            try {
              const newUser = await UserService.createUser({
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || '',
                role: UserRole.USER,
                isActive: true
              })
              
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: UserRole.USER,
                isAdmin: false,
                isSuperAdmin: false,
                permissions: [],
                isActive: true
              })
              
              setDbUser(newUser)
            } catch (error) {
              console.error('Erreur lors de la création de l\'utilisateur:', error)
              // Fallback: créer un utilisateur minimal
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                role: UserRole.USER,
                isAdmin: false,
                isSuperAdmin: false,
                permissions: [],
                isActive: true
              })
            }
          }

          // Sauvegarder l'email si "se souvenir de moi" est coché
          if (savedRemember && savedEmail) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('savedEmail', firebaseUser.email || '')
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error)
          // Fallback: utiliser uniquement les données Firebase
          const isAdmin = firebaseUser.email?.includes('admin') || false
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: isAdmin ? UserRole.ADMIN : UserRole.USER,
            isAdmin,
            isSuperAdmin: false,
            permissions: [],
            isActive: true
          })
        }
      } else {
        setUser(null)
        setDbUser(null)
=======
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
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
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

<<<<<<< HEAD
  const hasPermission = async (resource: string, action: string) => {
    if (!user || !dbUser) return false
    
    // Les super administrateurs ont toutes les permissions
    if (user.isSuperAdmin) return true
    
    return await UserService.hasPermission(dbUser.id, resource, action)
  }

  const refreshUser = async () => {
    if (!user || !dbUser) return
    
    try {
      const userWithRoles = await UserService.getUserById(dbUser.id)
      if (userWithRoles) {
        const permissions = userWithRoles.permissions.map(p => p.name) || []
        const isAdmin = await UserService.isAdmin(dbUser.id)
        const isSuperAdmin = await UserService.isSuperAdmin(dbUser.id)
        
        setUser({
          ...user,
          role: userWithRoles.role,
          isAdmin,
          isSuperAdmin,
          permissions,
          isActive: userWithRoles.isActive
        })
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de l\'utilisateur:', error)
    }
  }

  return {
    user,
    dbUser,
=======
  return {
    user,
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
    loading,
    signIn,
    signUp,
    resetPasswordRequest,
    logout,
    saveCredentials,
    getSavedEmail,
<<<<<<< HEAD
    getRememberMe,
    hasPermission,
    refreshUser
=======
    getRememberMe
>>>>>>> 3e66dbf5a30fb990a204ddd025e1904725ab65a0
  }
}