import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, BookOpen, GraduationCap, Wrench, Download, ExternalLink, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type TrackItem = {
  id: number
  type: 'article' | 'lesson' | 'tool'
  itemId: number
  order: number
  completed?: boolean
  details?: {
    title: string
    slug?: string
    fileUrl?: string
    videoUrl?: string
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

export default function TrackDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [track, setTrack] = useState<Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [markingComplete, setMarkingComplete] = useState<number | null>(null)

  useEffect(() => {
    if (id) {
      fetchTrack(parseInt(id))
    }
  }, [id, user])

  const fetchTrack = async (trackId: number) => {
    try {
      setIsLoading(true)
      const url = user?.id 
        ? `${API_URL}/tracks/${trackId}?userId=${user.id}`
        : `${API_URL}/tracks/${trackId}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTrack(data)
      } else {
        if (response.status === 404) {
          navigate('/tracks')
        }
        console.error('Erro ao carregar trilha:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erro ao buscar trilha:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkComplete = async (itemId: number, trackId: number) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para marcar itens como concluídos')
      return
    }

    try {
      setMarkingComplete(itemId)
      const response = await fetch(`${API_URL}/tracks/${trackId}/items/${itemId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        toast.success('Item marcado como concluído!')
        // Atualizar o estado local
        if (track) {
          const updatedItems = track.items?.map((item) =>
            item.id === itemId ? { ...item, completed: true } : item
          )
          setTrack({ ...track, items: updatedItems })
        }
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao marcar item como concluído')
      }
    } catch (error) {
      console.error('Erro ao marcar item como concluído:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setMarkingComplete(null)
    }
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'article':
        return 'Artigo'
      case 'lesson':
        return 'Aula em Vídeo'
      case 'tool':
        return 'Ferramenta'
      default:
        return type
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

  const handleItemAction = (item: TrackItem) => {
    if (item.type === 'article') {
      // Navegar para o artigo
      if (item.details?.slug) {
        navigate(`/articles/${item.details.slug}`)
      } else {
        toast.error('Artigo não encontrado')
      }
    } else if (item.type === 'lesson') {
      // Navegar para a aula
      navigate(`/academy/lesson/${item.itemId}`)
    } else if (item.type === 'tool') {
      // Abrir ferramenta ou download
      if (item.details?.fileUrl) {
        window.open(item.details.fileUrl, '_blank')
      } else {
        navigate(`/tools`)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/tracks">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Percursos
          </Link>
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          Carregando trilha...
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/tracks">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Percursos
          </Link>
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          Trilha não encontrada.
        </div>
      </div>
    )
  }

  const sortedItems = track.items?.sort((a, b) => a.order - b.order) || []

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="pl-0">
        <Link to="/tracks">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Percursos
        </Link>
      </Button>

      <div className="bg-primary text-primary-foreground p-8 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">{track.title}</h1>
        <p className="opacity-90 max-w-2xl">
          {track.description || 'Trilha de aprendizagem personalizada.'}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Etapas do Percurso</h2>

        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Esta trilha ainda não possui itens.
          </div>
        ) : (
          sortedItems.map((item, index) => {
            const isCompleted = item.completed || false
            const previousItem = index > 0 ? sortedItems[index - 1] : null
            const previousCompleted = previousItem?.completed || false
            const canMarkComplete = index === 0 || previousCompleted || isCompleted

            const getActionButtonLabel = () => {
              switch (item.type) {
                case 'article':
                  return 'Ler Artigo'
                case 'lesson':
                  return 'Assistir Vídeo'
                case 'tool':
                  return 'Baixar Ferramenta'
                default:
                  return 'Acessar'
              }
            }

            const getActionButtonIcon = () => {
              switch (item.type) {
                case 'article':
                  return <BookOpen className="h-4 w-4" />
                case 'lesson':
                  return <GraduationCap className="h-4 w-4" />
                case 'tool':
                  return <Download className="h-4 w-4" />
                default:
                  return <ExternalLink className="h-4 w-4" />
              }
            }

            return (
              <Card
                key={item.id}
                className={`transition-all hover:border-primary/50 ${
                  isCompleted ? 'border-green-200 bg-green-50/50' : ''
                } ${!canMarkComplete && !isCompleted ? 'opacity-75' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${
                        isCompleted
                          ? 'bg-green-100 text-green-600'
                          : canMarkComplete
                            ? 'bg-secondary text-primary'
                            : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-1">{getItemTitle(item)}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                        {getItemIcon(item.type)}
                        {getItemTypeLabel(item.type)}
                      </p>
                      {!canMarkComplete && !isCompleted && (
                        <p className="text-xs text-amber-600 mb-2">
                          Complete a etapa anterior para desbloquear
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemAction(item)}
                          className="flex items-center gap-2"
                        >
                          {getActionButtonIcon()}
                          {getActionButtonLabel()}
                        </Button>
                        {!isCompleted && canMarkComplete && user && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkComplete(item.id, parseInt(id!))}
                            disabled={markingComplete === item.id}
                            className="flex items-center gap-2"
                          >
                            {markingComplete === item.id ? (
                              <>Carregando...</>
                            ) : (
                              <>
                                <Check className="h-4 w-4" />
                                Marcar como Concluído
                              </>
                            )}
                          </Button>
                        )}
                        {isCompleted && user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleItemAction(item)}
                            className="text-muted-foreground"
                          >
                            Revisar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
