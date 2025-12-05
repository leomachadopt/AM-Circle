import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Search, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type Event = {
  id: number
  title: string
  date: string
  type: string
  description?: string
  videoUrl?: string
  meetingUrl?: string
  createdAt?: string
  updatedAt?: string
}

const eventTypes = ['Em Direto', 'Gravação']

export default function AdminMentorships() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    type: '',
    description: '',
    videoUrl: '',
    meetingUrl: '',
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/events`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      } else {
        console.error('Erro ao carregar eventos:', response.status, response.statusText)
        // Não mostrar toast em caso de erro, apenas log
        setEvents([])
      }
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      // Não mostrar toast em caso de erro de conexão, apenas log
      // O usuário verá a mensagem "Nenhum evento cadastrado" se não houver dados
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event)
      const eventDate = new Date(event.date)
      setFormData({
        title: event.title,
        date: format(eventDate, 'yyyy-MM-dd'),
        time: format(eventDate, 'HH:mm'),
        type: event.type,
        description: event.description || '',
        videoUrl: event.videoUrl || '',
        meetingUrl: event.meetingUrl || '',
      })
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        date: '',
        time: '',
        type: '',
        description: '',
        videoUrl: '',
        meetingUrl: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingEvent(null)
    setFormData({
      title: '',
      date: '',
      time: '',
      type: '',
      description: '',
      videoUrl: '',
      meetingUrl: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.date || !formData.time || !formData.type) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      // Combinar data e hora
      const dateTime = new Date(`${formData.date}T${formData.time}`)

      if (editingEvent) {
        // Atualizar evento existente
        const response = await fetch(`${API_URL}/events/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            date: dateTime.toISOString(),
            type: formData.type,
            description: formData.description,
            videoUrl: formData.videoUrl,
            meetingUrl: formData.meetingUrl,
          }),
        })

        if (response.ok) {
          toast.success('Evento atualizado com sucesso!')
          fetchEvents()
          handleCloseDialog()
        } else {
          toast.error('Erro ao atualizar evento')
        }
      } else {
        // Criar novo evento
        const response = await fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            date: dateTime.toISOString(),
            type: formData.type,
            description: formData.description,
            videoUrl: formData.videoUrl,
            meetingUrl: formData.meetingUrl,
          }),
        })

        if (response.ok) {
          toast.success('Evento criado com sucesso!')
          fetchEvents()
          handleCloseDialog()
        } else {
          toast.error('Erro ao criar evento')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Evento excluído com sucesso!')
        fetchEvents()
      } else {
        toast.error('Erro ao excluir evento')
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          Painel Administrativo - Mentorias e Eventos
        </h1>
        <p className="text-muted-foreground">
          Gerencie as mentorias e eventos da plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Eventos Cadastrados</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[300px]"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEvent
                        ? 'Atualize as informações do evento'
                        : 'Preencha os dados para criar um novo evento'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">
                          Título <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Ex: Mentoria de Vendas Avançadas"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">
                            Data <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="time">
                            Hora <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="time"
                            type="time"
                            value={formData.time}
                            onChange={(e) =>
                              setFormData({ ...formData, time: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="type">
                          Tipo <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, type: value })
                          }
                          required
                        >
                          <SelectTrigger id="type">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="meetingUrl">URL da Reunião (Zoom/Meet)</Label>
                        <Input
                          id="meetingUrl"
                          type="url"
                          value={formData.meetingUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              meetingUrl: e.target.value,
                            })
                          }
                          placeholder="https://zoom.us/j/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          URL para eventos "Em Direto"
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="videoUrl">URL do Vídeo (Gravação)</Label>
                        <Input
                          id="videoUrl"
                          type="url"
                          value={formData.videoUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              videoUrl: e.target.value,
                            })
                          }
                          placeholder="https://youtube.com/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          URL para eventos tipo "Gravação"
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Descrição do evento..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingEvent ? 'Atualizar' : 'Criar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando eventos...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Nenhum evento encontrado com o termo pesquisado'
                : 'Nenhum evento cadastrado. Clique em "Novo Evento" para começar.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(event.date), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          event.type === 'Em Direto' ? 'default' : 'secondary'
                        }
                      >
                        {event.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(event)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(event.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

