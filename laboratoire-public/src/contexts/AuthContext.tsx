import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface User {
  id: string
  email: string
  raison_sociale: string
  type: 'PREMIUM' | 'STANDARD' | 'OCCASIONNEL'
  role: 'CLIENT' | 'ADMIN' | 'TECHNICIEN' | 'RESPONSABLE'
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si un token existe dans localStorage
    const token = localStorage.getItem('lanema_token')
    const savedUser = localStorage.getItem('lanema_user')
    
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        // Optionnel: Vérifier que le token est encore valide
        verifyToken(token).catch(() => {
          // Token invalide, nettoyer
          localStorage.removeItem('lanema_token')
          localStorage.removeItem('lanema_user')
          setUser(null)
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('lanema_token')
        localStorage.removeItem('lanema_user')
      }
    }
    setIsLoading(false)
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/auth/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Token invalid')
      }
      const data = await response.json()
      return data
    } catch (error) {
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/clients/auth/login/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Email ou mot de passe incorrect')
      }

      const data = await response.json()
      
      // Construire l'objet user
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        role: data.user.role,
        raison_sociale: data.user.client_profile?.raison_sociale || data.user.email,
        type: (data.user.client_profile?.type || 'STANDARD') as 'PREMIUM' | 'STANDARD' | 'OCCASIONNEL',
      }

      // Sauvegarder le token et l'utilisateur
      localStorage.setItem('lanema_token', data.tokens.access)
      localStorage.setItem('lanema_refresh_token', data.tokens.refresh)
      localStorage.setItem('lanema_user', JSON.stringify(userData))
      
      setUser(userData)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('lanema_token')
      if (token) {
        // Optionnel: Appeler l'endpoint de logout
        await fetch(`${API_BASE_URL}/clients/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {
          // Ignorer les erreurs de logout
        })
      }
    } finally {
      localStorage.removeItem('lanema_token')
      localStorage.removeItem('lanema_refresh_token')
      localStorage.removeItem('lanema_user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
