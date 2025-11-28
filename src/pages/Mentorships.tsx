import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { mockEvents } from '@/lib/data'
import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Video, Calendar as CalendarIcon, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function Mentorships() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Pergunta enviada com sucesso!')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Mentorias & Eventos</h1>
        <p className="text-muted-foreground">
          Participe ao vivo e tire suas dúvidas com especialistas.
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
                .filter((e) => e.type === 'Live')
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
                            locale: ptBR,
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
              <CardTitle>Replays Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {mockEvents
                  .filter((e) => e.type === 'Replay')
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

          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-white">Envie sua Pergunta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendQuestion} className="space-y-4">
                <Input
                  placeholder="Assunto"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
                <Textarea
                  placeholder="Sua dúvida para a próxima mentoria..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[100px]"
                />
                <Button type="submit" variant="secondary" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Enviar
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
