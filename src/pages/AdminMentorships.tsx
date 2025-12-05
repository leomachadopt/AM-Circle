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
import { Plus, Pencil, Trash2, Search, Calendar, Users, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

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

const eventTypes = ['Em Direto', 'Gravação', 'Presencial']

type Participant = {
  id: number
  userId: number
  userName: string
  userEmail: string
  userAvatar?: string
  registeredAt: string
}

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
    imageUrl: '',
    videoUrl: '',
    meetingUrl: '',
    address: '',
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isParticipantsDialogOpen, setIsParticipantsDialogOpen] = useState(false)
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
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
            imageUrl: event.imageUrl || event.image_url,
        videoUrl: event.videoUrl || event.video_url || '',
        meetingUrl: event.meetingUrl || event.meeting_url || '',
        address: event.address || '',
      })
      setImagePreview(event.imageUrl || event.image_url || null)
    } else {
      setEditingEvent(null)
      setFormData({
        title: '',
        date: '',
        time: '',
        type: '',
        description: '',
        imageUrl: '',
        videoUrl: '',
        meetingUrl: '',
        address: '',
      })
      setImagePreview(null)
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
      imageUrl: '',
      videoUrl: '',
      meetingUrl: '',
      address: '',
    })
    setImagePreview(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/events/upload-image`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }))
        setImagePreview(data.imageUrl)
        toast.success('Imagem enviada com sucesso!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao enviar imagem')
      }
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
    setImagePreview(null)
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
            imageUrl: formData.imageUrl || null,
            videoUrl: formData.videoUrl,
            meetingUrl: formData.meetingUrl,
            address: formData.address,
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
            imageUrl: formData.imageUrl || null,
            videoUrl: formData.videoUrl,
            meetingUrl: formData.meetingUrl,
            address: formData.address,
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

  const fetchParticipants = async (eventId: number) => {
    try {
      setIsLoadingParticipants(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setParticipants(data)
        setSelectedEventId(eventId)
        setIsParticipantsDialogOpen(true)
      } else {
        toast.error('Erro ao carregar participantes')
      }
    } catch (error) {
      console.error('Erro ao buscar participantes:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsLoadingParticipants(false)
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
                        <Label htmlFor="image">Imagem do Evento</Label>
                        <div className="space-y-2">
                          {imagePreview || formData.imageUrl ? (
                            <div className="relative">
                              <img
                                src={imagePreview || formData.imageUrl}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={handleRemoveImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <Label
                                htmlFor="image-upload"
                                className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
                              >
                                Clique para fazer upload de uma imagem
                              </Label>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                className="hidden"
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                PNG, JPEG, JPG, WEBP ou GIF (máx. 5MB)
                              </p>
                            </div>
                          )}
                          {!imagePreview && !formData.imageUrl && (
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                          )}
                          {uploadingImage && (
                            <p className="text-sm text-muted-foreground">
                              Enviando imagem...
                            </p>
                          )}
                        </div>
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

                      {formData.type === 'Presencial' && (
                        <div className="grid gap-2">
                          <Label htmlFor="address">
                            Endereço <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                address: e.target.value,
                              })
                            }
                            placeholder="Ex: Rua das Flores, 123 - Lisboa, Portugal"
                            rows={3}
                            required={formData.type === 'Presencial'}
                          />
                          <p className="text-xs text-muted-foreground">
                            Endereço completo do local do evento presencial
                          </p>
                        </div>
                      )}

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
                          onClick={() => fetchParticipants(event.id)}
                          title="Ver participantes"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
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

      {/* Dialog de Participantes */}
      <Dialog open={isParticipantsDialogOpen} onOpenChange={setIsParticipantsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Participantes Confirmados
              {selectedEventId && (
                <span className="text-muted-foreground font-normal ml-2">
                  - {events.find((e) => e.id === selectedEventId)?.title}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Lista de usuários que confirmaram participação neste evento
            </DialogDescription>
          </DialogHeader>
          {isLoadingParticipants ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando participantes...
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum participante confirmado ainda.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Total: {participants.length} participante(s)
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Confirmação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {participant.userAvatar ? (
                            <img
                              src={participant.userAvatar}
                              alt={participant.userName}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                              {participant.userName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          {participant.userName}
                        </div>
                      </TableCell>
                      <TableCell>{participant.userEmail}</TableCell>
                      <TableCell>
                        {format(new Date(participant.registeredAt), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

