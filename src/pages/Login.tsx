import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(email, password)
    setIsLoading(false)

    if (success) {
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-background to-black p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920')] bg-cover bg-center opacity-5" />
      <div className="absolute top-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <Card className="w-full max-w-md shadow-gold border border-primary/30 bg-card/95 backdrop-blur-lg animate-scale-in relative z-10">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-xl bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-gold animate-glow">
              A
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-primary text-shadow-gold">
            AMC Dental Hub
          </CardTitle>
          <CardDescription className="text-foreground/70">
            Introduza as suas credenciais para aceder à plataforma
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/30 border-border/50 focus:border-primary transition-colors h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">Palavra-passe</Label>
                <a href="#" className="text-sm text-primary hover:text-secondary transition-colors">
                  Esqueceu-se?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/30 border-border/50 focus:border-primary transition-colors h-11"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-gold hover:bg-primary text-primary-foreground font-bold h-11 shadow-lg hover:shadow-gold transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'A entrar...' : 'Entrar'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Ao entrar, concorda com os nossos{' '}
              <a href="#" className="text-primary hover:underline">Termos de Serviço</a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
