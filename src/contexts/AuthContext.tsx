import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type User = {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
  progress?: number
}

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      verifyToken(savedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Construir URL completa do avatar se existir
        const avatarUrl = data.user.avatar
          ? data.user.avatar.startsWith('http')
            ? data.user.avatar
            : `${API_URL.replace('/api', '')}${data.user.avatar}`
          : undefined
        const userData = {
          ...data.user,
          avatar: avatarUrl,
        }
        setUser(userData)
        setToken(tokenToVerify)
      } else {
        // Token inválido, remover
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        // Construir URL completa do avatar se existir
        const avatarUrl = data.user.avatar
          ? data.user.avatar.startsWith('http')
            ? data.user.avatar
            : `${API_URL.replace('/api', '')}${data.user.avatar}`
          : undefined
        const userData = {
          ...data.user,
          avatar: avatarUrl,
        }
        setUser(userData)
        setToken(data.token)
        localStorage.setItem('token', data.token)
        return true
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao fazer login')
        return false
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      toast.error('Erro ao conectar com o servidor')
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    toast.success('Logout realizado com sucesso')
  }

  const updateUser = (userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null
      // Construir URL completa do avatar se existir
      const updatedAvatar = userData.avatar
        ? userData.avatar.startsWith('http')
          ? userData.avatar
          : `${API_URL.replace('/api', '')}${userData.avatar}`
        : prev.avatar
      return {
        ...prev,
        ...userData,
        avatar: updatedAvatar,
      }
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

