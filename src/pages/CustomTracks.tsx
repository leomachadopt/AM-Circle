import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Route, CheckCircle, BookOpen, GraduationCap, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type TrackItem = {
  id: number
  type: 'article' | 'lesson' | 'tool'
  itemId: number
  order: number
  completed?: boolean
  details?: {
    title: string
    [key: string]: any
  }
}

type Track = {
  id: number
  title: string
  description?: string
  published: boolean
  items?: TrackItem[]
  createdAt?: string
  updatedAt?: string
}

export default function CustomTracks() {
  const { user } = useAuth()
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTracks()
  }, [user])

  const fetchTracks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/tracks?published=true`)
      if (response.ok) {
        const data = await response.json()
        // Buscar progresso do usuário para cada trilha
        if (user?.id) {
          const tracksWithProgress = await Promise.all(
            data.map(async (track: Track) => {
              try {
                const trackResponse = await fetch(`${API_URL}/tracks/${track.id}?userId=${user.id}`)
                if (trackResponse.ok) {
                  return await trackResponse.json()
                }
              } catch (error) {
                console.error(`Erro ao buscar progresso da trilha ${track.id}:`, error)
              }
              return track
            })
          )
          setTracks(tracksWithProgress)
        } else {
          setTracks(data)
        }
      } else {
        console.error('Erro ao carregar trilhas:', response.status, response.statusText)
        setTracks([])
      }
    } catch (error) {
      console.error('Erro ao buscar trilhas:', error)
      setTracks([])
    } finally {
      setIsLoading(false)
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <BookOpen className="h-4 w-4" />
      case 'lesson':
        return <GraduationCap className="h-4 w-4" />
      case 'tool':
        return <Wrench className="h-4 w-4" />
      default:
        return null
    }
  }

  const getItemTitle = (item: TrackItem) => {
    if (item.details) {
      return item.details.title || 'Sem título'
    }
    return 'Item'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-shadow-gold animate-slide-in-left">
            Trilhas Personalizadas
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl animate-slide-up">
            Caminhos de aprendizagem desenhados para o seu momento atual.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Carregando trilhas...
        </div>
      ) : tracks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma trilha disponível no momento.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => {
            const itemsCount = track.items?.length || 0
            const completedItems = track.items?.filter((item) => item.completed).length || 0
            const progress = itemsCount > 0 ? Math.round((completedItems / itemsCount) * 100) : 0

            return (
              <Card
                key={track.id}
                className={`border-2 transition-colors ${
                  progress > 0
                    ? 'border-primary/10 hover:border-primary/30'
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <CardHeader>
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center mb-2 text-primary">
                    <Route className="h-6 w-6" />
                  </div>
                  <CardTitle>{track.title}</CardTitle>
                  <CardDescription>
                    {track.description || 'Trilha de aprendizagem personalizada.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {itemsCount > 0 && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progresso</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        {track.items?.slice(0, 3).map((item, index) => (
                          <li key={item.id} className="flex items-center gap-2">
                            {completedItems > index ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-muted-foreground flex items-center justify-center">
                                {getItemIcon(item.type)}
                              </div>
                            )}
                            {getItemTitle(item)}
                          </li>
                        ))}
                        {itemsCount > 3 && (
                          <li className="text-xs text-muted-foreground pl-6">
                            +{itemsCount - 3} {itemsCount - 3 === 1 ? 'item' : 'itens'} mais
                          </li>
                        )}
                      </ul>
                    </>
                  )}
                  {itemsCount === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Esta trilha ainda não possui itens.
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={progress > 0 ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={`/tracks/${track.id}`}>
                      {progress > 0 ? 'Continuar Percurso' : 'Iniciar Percurso'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
