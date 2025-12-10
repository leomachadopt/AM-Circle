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
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Route,
  BookOpen,
  GraduationCap,
  Wrench,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type TrackItem = {
  id?: number
  type: 'article' | 'lesson' | 'tool'
  itemId: number
  order: number
  details?: any
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

type Article = {
  id: number
  title: string
  slug: string
}

type Lesson = {
  id: number
  title: string
  duration?: string
}

type Tool = {
  id: number
  title: string
  category: string
}

export default function AdminTracks() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    published: false,
  })
  const [trackItems, setTrackItems] = useState<TrackItem[]>([])
  const [addingItem, setAddingItem] = useState(false)
  const [newItem, setNewItem] = useState<{
    type: 'article' | 'lesson' | 'tool' | ''
    itemId: number | ''
  }>({ type: '', itemId: '' })

  useEffect(() => {
    fetchTracks()
    fetchArticles()
    fetchLessons()
    fetchTools()
  }, [])

  const fetchTracks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/tracks`)
      if (response.ok) {
        const data = await response.json()
        setTracks(data)
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

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_URL}/articles?published=all`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      }
    } catch (error) {
      console.error('Erro ao buscar artigos:', error)
    }
  }

  const fetchLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/lessons`)
      if (response.ok) {
        const data = await response.json()
        setLessons(data)
      }
    } catch (error) {
      console.error('Erro ao buscar aulas:', error)
    }
  }

  const fetchTools = async () => {
    try {
      const response = await fetch(`${API_URL}/tools`)
      if (response.ok) {
        const data = await response.json()
        setTools(data)
      }
    } catch (error) {
      console.error('Erro ao buscar ferramentas:', error)
    }
  }

  const handleOpenDialog = (track?: Track) => {
    if (track) {
      setEditingTrack(track)
      setFormData({
        title: track.title,
        description: track.description || '',
        published: track.published,
      })
      setTrackItems(track.items || [])
    } else {
      setEditingTrack(null)
      setFormData({
        title: '',
        description: '',
        published: false,
      })
      setTrackItems([])
    }
    setNewItem({ type: '', itemId: '' })
    setAddingItem(false)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTrack(null)
    setFormData({
      title: '',
      description: '',
      published: false,
    })
    setTrackItems([])
    setNewItem({ type: '', itemId: '' })
    setAddingItem(false)
  }

  const handleAddItem = () => {
    if (!newItem.type || !newItem.itemId) {
      toast.error('Selecione o tipo e o item')
      return
    }

    // Verificar se o item já existe
    const exists = trackItems.some(
      (item) => item.type === newItem.type && item.itemId === Number(newItem.itemId)
    )

    if (exists) {
      toast.error('Este item já foi adicionado à trilha')
      return
    }

    const newTrackItem: TrackItem = {
      type: newItem.type as 'article' | 'lesson' | 'tool',
      itemId: Number(newItem.itemId),
      order: trackItems.length,
    }

    setTrackItems([...trackItems, newTrackItem])
    setNewItem({ type: '', itemId: '' })
    setAddingItem(false)
    toast.success('Item adicionado à trilha')
  }

  const handleRemoveItem = (index: number) => {
    const newItems = trackItems.filter((_, i) => i !== index)
    // Reordenar
    const reorderedItems = newItems.map((item, i) => ({ ...item, order: i }))
    setTrackItems(reorderedItems)
    toast.success('Item removido da trilha')
  }

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === trackItems.length - 1)
    ) {
      return
    }

    const newItems = [...trackItems]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

    // Reordenar
    const reorderedItems = newItems.map((item, i) => ({ ...item, order: i }))
    setTrackItems(reorderedItems)
  }

  const getItemTitle = (item: TrackItem) => {
    if (item.details) {
      return item.details.title || 'Sem título'
    }
    if (item.type === 'article') {
      const article = articles.find((a) => a.id === item.itemId)
      return article?.title || 'Artigo não encontrado'
    }
    if (item.type === 'lesson') {
      const lesson = lessons.find((l) => l.id === item.itemId)
      return lesson?.title || 'Aula não encontrada'
    }
    if (item.type === 'tool') {
      const tool = tools.find((t) => t.id === item.itemId)
      return tool?.title || 'Ferramenta não encontrada'
    }
    return 'Item desconhecido'
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

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'article':
        return 'Artigo'
      case 'lesson':
        return 'Vídeo/Aula'
      case 'tool':
        return 'Ferramenta'
      default:
        return type
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Preencha o título da trilha')
      return
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        published: formData.published,
        items: trackItems.map((item) => ({
          type: item.type,
          itemId: item.itemId,
          order: item.order,
        })),
      }

      if (editingTrack) {
        const response = await fetch(`${API_URL}/tracks/${editingTrack.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          toast.success('Trilha atualizada com sucesso!')
          fetchTracks()
          handleCloseDialog()
        } else {
          const error = await response.json().catch(() => ({}))
          toast.error(error.error || 'Erro ao atualizar trilha')
        }
      } else {
        const response = await fetch(`${API_URL}/tracks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          toast.success('Trilha criada com sucesso!')
          fetchTracks()
          handleCloseDialog()
        } else {
          const error = await response.json().catch(() => ({}))
          toast.error(error.error || 'Erro ao criar trilha')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar trilha:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta trilha?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/tracks/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Trilha excluída com sucesso!')
        fetchTracks()
      } else {
        toast.error('Erro ao excluir trilha')
      }
    } catch (error) {
      console.error('Erro ao excluir trilha:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const filteredTracks = tracks.filter((track) =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          Painel Administrativo - Trilhas
        </h1>
        <p className="text-muted-foreground">
          Gerencie as trilhas de aprendizagem com artigos, vídeos e ferramentas
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Trilhas Cadastradas</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar trilhas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[300px]"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Trilha
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTrack ? 'Editar Trilha' : 'Nova Trilha'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTrack
                        ? 'Atualize as informações da trilha'
                        : 'Preencha os dados para criar uma nova trilha'}
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
                          placeholder="Ex: Aceleração de Vendas"
                          required
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Descrição da trilha..."
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="published"
                          checked={formData.published}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, published: checked })
                          }
                        />
                        <Label htmlFor="published">Publicar trilha</Label>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-base font-semibold">
                            Itens da Trilha ({trackItems.length})
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setAddingItem(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Item
                          </Button>
                        </div>

                        {addingItem && (
                          <Card className="mb-4 p-4">
                            <div className="grid gap-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Tipo de Item</Label>
                                  <Select
                                    value={newItem.type}
                                    onValueChange={(value: 'article' | 'lesson' | 'tool') =>
                                      setNewItem({ ...newItem, type: value, itemId: '' })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="article">
                                        <div className="flex items-center gap-2">
                                          <BookOpen className="h-4 w-4" />
                                          Artigo
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="lesson">
                                        <div className="flex items-center gap-2">
                                          <GraduationCap className="h-4 w-4" />
                                          Vídeo/Aula
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="tool">
                                        <div className="flex items-center gap-2">
                                          <Wrench className="h-4 w-4" />
                                          Ferramenta
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="grid gap-2">
                                  <Label>Item</Label>
                                  <Select
                                    value={String(newItem.itemId)}
                                    onValueChange={(value) =>
                                      setNewItem({ ...newItem, itemId: Number(value) })
                                    }
                                    disabled={!newItem.type}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {newItem.type === 'article' &&
                                        articles.map((article) => (
                                          <SelectItem key={article.id} value={String(article.id)}>
                                            {article.title}
                                          </SelectItem>
                                        ))}
                                      {newItem.type === 'lesson' &&
                                        lessons.map((lesson) => (
                                          <SelectItem key={lesson.id} value={String(lesson.id)}>
                                            {lesson.title}
                                          </SelectItem>
                                        ))}
                                      {newItem.type === 'tool' &&
                                        tools.map((tool) => (
                                          <SelectItem key={tool.id} value={String(tool.id)}>
                                            {tool.title}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  onClick={handleAddItem}
                                  disabled={!newItem.type || !newItem.itemId}
                                >
                                  Adicionar
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setAddingItem(false)
                                    setNewItem({ type: '', itemId: '' })
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )}

                        {trackItems.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {trackItems.map((item, index) => (
                              <Card key={index} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <span className="text-sm font-medium w-6">
                                        {index + 1}
                                      </span>
                                      {getItemIcon(item.type)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                          {getItemTypeLabel(item.type)}
                                        </Badge>
                                        <span className="font-medium">
                                          {getItemTitle(item)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveItem(index, 'up')}
                                      disabled={index === 0}
                                    >
                                      <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveItem(index, 'down')}
                                      disabled={index === trackItems.length - 1}
                                    >
                                      <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveItem(index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancelar
                      </Button>
                      <Button type="submit">Salvar Trilha</Button>
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
              Carregando trilhas...
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Nenhuma trilha encontrada com esse termo'
                : 'Nenhuma trilha cadastrada ainda'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTracks.map((track) => (
                  <TableRow key={track.id}>
                    <TableCell className="font-medium">{track.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {track.items?.length || 0} itens
                        </Badge>
                        {track.items && track.items.length > 0 && (
                          <div className="flex gap-1">
                            {track.items.slice(0, 3).map((item, idx) => (
                              <span key={idx} className="text-xs text-muted-foreground">
                                {getItemIcon(item.type)}
                              </span>
                            ))}
                            {track.items.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{track.items.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={track.published ? 'default' : 'secondary'}>
                        {track.published ? 'Publicada' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {track.createdAt
                        ? new Date(track.createdAt).toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(track)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(track.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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


