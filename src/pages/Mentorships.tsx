import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { mockEvents } from '@/lib/data'
import { useState } from 'react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Video, Calendar as CalendarIcon, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { Label } from '@/components/ui/label'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function Mentorships() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { user, token } = useAuth()
  const [subject, setSubject] = useState('')
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Mentorias e Eventos</h1>
        <p className="text-muted-foreground">
          Participe em direto e tire as suas dúvidas com especialistas.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Sessões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEvents
                .filter((e) => e.type === 'Em Direto')
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-card hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Video className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{event.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(event.date), "dd 'de' MMMM, HH:mm", {
                            locale: pt,
                          })}
                        </p>
                      </div>
                    </div>
                    <Button className="w-full sm:w-auto">Participar</Button>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gravações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockEvents
                  .filter((e) => e.type === 'Gravação')
                  .map((replay) => (
                    <div key={replay.id} className="group cursor-pointer">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden relative mb-2">
                        <img
                          src={`https://img.usecurling.com/p/400/225?q=meeting&seed=${replay.id}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
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
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
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
