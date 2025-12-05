import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useState, useEffect } from 'react'
import { format, isSameDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Video, Calendar as CalendarIcon, Send, MapPin, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Label } from '@/components/ui/label'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type Event = {
  id: number
  title: string
  date: string
  type: string
  description?: string
  imageUrl?: string
  videoUrl?: string
  meetingUrl?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export default function Mentorships() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { user, token } = useAuth()
  const [subject, setSubject] = useState('')
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)
  const [registeredEvents, setRegisteredEvents] = useState<Set<number>>(new Set())
  const [isRegistering, setIsRegistering] = useState<number | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    if (user && token && events.length > 0) {
      checkRegisteredEvents()
    }
  }, [user, token, events])

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true)
      const response = await fetch(`${API_URL}/events`)
      if (response.ok) {
        const data = await response.json()
        // Mapear campos do backend (snake_case) para o formato esperado (camelCase)
        const formattedEvents = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          type: event.type,
          description: event.description,
          imageUrl: event.imageUrl || event.image_url,
          videoUrl: event.videoUrl || event.video_url,
          meetingUrl: event.meetingUrl || event.meeting_url,
          address: event.address,
          createdAt: event.createdAt || event.created_at,
          updatedAt: event.updatedAt || event.updated_at,
        }))
        setEvents(formattedEvents)
      } else {
        console.error('Erro ao carregar eventos:', response.status, response.statusText)
        setEvents([])
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      setEvents([])
    } finally {
      setIsLoadingEvents(false)
    }
  }

  const checkRegisteredEvents = async () => {
    if (!user || !token || events.length === 0) return

    try {
      const checks = events
        .filter((e) => e.type === 'Em Direto' || e.type === 'Presencial')
        .map(async (event) => {
          const response = await fetch(`${API_URL}/events/${event.id}/register/status`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const { isRegistered } = await response.json()
            return { eventId: event.id, isRegistered }
          }
          return { eventId: event.id, isRegistered: false }
        })

      const results = await Promise.all(checks)
      const registered = new Set(
        results.filter((r) => r.isRegistered).map((r) => r.eventId)
      )
      setRegisteredEvents(registered)
    } catch (error) {
      console.error('Erro ao verificar registros:', error)
    }
  }

  const handleRegisterEvent = async (eventId: number) => {
    if (!user || !token) {
      toast.error('Por favor, faça login para confirmar participação')
      return
    }

    try {
      setIsRegistering(eventId)
      const response = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Participação confirmada com sucesso!')
        setRegisteredEvents((prev) => new Set([...prev, eventId]))
        fetchEvents() // Atualizar lista de eventos
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao confirmar participação')
      }
    } catch (error) {
      console.error('Erro ao confirmar participação:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsRegistering(null)
    }
  }

  const handleUnregisterEvent = async (eventId: number) => {
    if (!user || !token) {
      return
    }

    try {
      setIsRegistering(eventId)
      const response = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Participação cancelada')
        setRegisteredEvents((prev) => {
          const newSet = new Set(prev)
          newSet.delete(eventId)
          return newSet
        })
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao cancelar participação')
      }
    } catch (error) {
      console.error('Erro ao cancelar participação:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsRegistering(null)
    }
  }

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !question.trim()) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    if (!user?.id) {
      toast.error('Por favor, faça login para enviar uma pergunta')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          subject: subject.trim(),
          question: question.trim(),
        }),
      })

      if (response.ok) {
        toast.success('Pergunta enviada com sucesso!')
        setSubject('')
        setQuestion('')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao enviar pergunta')
      }
    } catch (error) {
      console.error('Erro ao enviar pergunta:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-shadow-gold animate-slide-in-left">
            Mentorias e Eventos
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl animate-slide-up">
            Participe em direto e tire as suas dúvidas com especialistas.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Sessões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingEvents ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Carregando eventos...</p>
                </div>
              ) : events.filter((e) => e.type === 'Em Direto' || e.type === 'Presencial').length > 0 ? (
                events
                  .filter((e) => e.type === 'Em Direto' || e.type === 'Presencial')
                  .map((event) => {
                    const isRegistered = registeredEvents.has(event.id)
                    return (
                      <div
                        key={event.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card hover:shadow-md transition-all gap-4"
                      >
                        {event.imageUrl && (
                          <div className="w-full sm:w-32 h-32 sm:h-auto flex-shrink-0">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-4 mb-4 sm:mb-0 flex-1">
                          {!event.imageUrl && (
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                              {event.type === 'Presencial' ? (
                                <MapPin className="h-6 w-6" />
                              ) : (
                                <Video className="h-6 w-6" />
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{event.title}</h3>
                              {isRegistered && (
                                <CheckCircle2 className="h-5 w-5 text-green-500" title="Participação confirmada" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(event.date), "dd 'de' MMMM, HH:mm", {
                                locale: pt,
                              })}
                            </p>
                            {event.type === 'Presencial' && event.address && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {event.address}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          className="w-full sm:w-auto"
                          variant={isRegistered ? 'outline' : 'default'}
                          disabled={isRegistering === event.id}
                          onClick={() => {
                            if (isRegistered) {
                              if (event.type === 'Em Direto' && event.meetingUrl) {
                                window.open(event.meetingUrl, '_blank')
                              } else {
                                handleUnregisterEvent(event.id)
                              }
                            } else {
                              if (event.type === 'Em Direto' && event.meetingUrl) {
                                handleRegisterEvent(event.id)
                                setTimeout(() => {
                                  window.open(event.meetingUrl, '_blank')
                                }, 500)
                              } else {
                                handleRegisterEvent(event.id)
                              }
                            }
                          }}
                        >
                          {isRegistering === event.id
                            ? 'Processando...'
                            : isRegistered
                            ? event.type === 'Em Direto' && event.meetingUrl
                              ? 'Participar'
                              : 'Participação Confirmada'
                            : 'Confirmar Participação'}
                        </Button>
                      </div>
                    )
                  })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma sessão agendada no momento.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gravações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEvents ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Carregando gravações...</p>
                </div>
              ) : events.filter((e) => e.type === 'Gravação').length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {events
                    .filter((e) => e.type === 'Gravação')
                    .map((replay) => (
                      <div 
                        key={replay.id} 
                        className="group cursor-pointer"
                        onClick={() => {
                          if (replay.videoUrl) {
                            window.open(replay.videoUrl, '_blank')
                          } else {
                            toast.info('Vídeo não disponível')
                          }
                        }}
                      >
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden relative mb-2">
                          {replay.imageUrl ? (
                            <img
                              src={replay.imageUrl}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              alt={replay.title}
                            />
                          ) : replay.videoUrl ? (
                            <img
                              src={`https://img.usecurling.com/p/400/225?q=meeting&seed=${replay.id}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              alt={replay.title}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Video className="h-12 w-12 text-primary/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Video className="h-10 w-10 text-white" />
                          </div>
                        </div>
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {replay.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(replay.date), 'dd/MM/yyyy')}
                        </p>
                        {replay.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {replay.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma gravação disponível no momento.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  hasEvent: (date) => {
                    return events.some((event) => {
                      const eventDate = new Date(event.date)
                      return isSameDay(eventDate, date)
                    })
                  },
                  hasLiveEvent: (date) => {
                    return events.some((event) => {
                      const eventDate = new Date(event.date)
                      return event.type === 'Em Direto' && isSameDay(eventDate, date)
                    })
                  },
                  hasPresentialEvent: (date) => {
                    return events.some((event) => {
                      const eventDate = new Date(event.date)
                      return event.type === 'Presencial' && isSameDay(eventDate, date)
                    })
                  },
                  hasRecordingEvent: (date) => {
                    return events.some((event) => {
                      const eventDate = new Date(event.date)
                      return event.type === 'Gravação' && isSameDay(eventDate, date)
                    })
                  },
                }}
                modifiersClassNames={{
                  hasEvent: 'has-event',
                  hasLiveEvent: 'has-live-event',
                  hasPresentialEvent: 'has-presential-event',
                  hasRecordingEvent: 'has-recording-event',
                }}
              />
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Em Direto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Presencial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>Gravação</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border/40 shadow-netflix">
            <CardHeader>
              <CardTitle>Envie a sua Pergunta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Assunto</Label>
                  <Input
                    id="subject"
                    placeholder="Assunto"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">A sua dúvida para a próxima mentoria...</Label>
                  <Textarea
                    id="question"
                    placeholder="A sua dúvida para a próxima mentoria..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="bg-background min-h-[100px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-gold hover:bg-primary text-background font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Enviar
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
