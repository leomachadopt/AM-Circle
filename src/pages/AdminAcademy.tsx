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
import { Plus, Pencil, Trash2, Search, ListTodo, FileText, X } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type Lesson = {
  id: number
  title: string
  duration: string
  module: string
  moduleId?: number
  videoUrl?: string
  imageUrl?: string
  description?: string
  order: number
}

type ActivationTask = {
  id: number
  lessonId: number
  title: string
  order: number
}

type Material = {
  id: number
  lessonId: number
  title: string
  fileUrl?: string
  fileType?: string
  fileSize?: number
  order: number
}

const modules = ['Gestão', 'Marketing', 'Atendimento', 'Liderança', 'Financeiro']

export default function AdminAcademy() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false)
  const [isMaterialsDialogOpen, setIsMaterialsDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null)
  const [activationTasks, setActivationTasks] = useState<ActivationTask[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newMaterial, setNewMaterial] = useState({ title: '', fileUrl: '', fileType: '', fileSize: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    module: '',
    videoUrl: '',
    imageUrl: '',
    description: '',
    order: 0,
  })

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      setIsLoading(true)
      console.log('Buscando aulas de:', `${API_URL}/lessons`)
      const response = await fetch(`${API_URL}/lessons`)
      console.log('Resposta recebida:', response.status, response.statusText)
      if (response.ok) {
        const data = await response.json()
        console.log('Aulas carregadas:', data.length)
        setLessons(data)
      } else {
        console.error('Erro ao carregar aulas:', response.status, response.statusText)
        toast.error('Erro ao carregar aulas. Verifique se o servidor está rodando.')
      }
    } catch (error) {
      console.error('Erro ao buscar aulas:', error)
      toast.error('Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3001')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (lesson?: Lesson) => {
    if (lesson) {
      setEditingLesson(lesson)
      setFormData({
        title: lesson.title,
        duration: lesson.duration || '',
        module: lesson.module || '',
        videoUrl: lesson.videoUrl || '',
        imageUrl: lesson.imageUrl || '',
        description: lesson.description || '',
        order: lesson.order || 0,
      })
    } else {
      setEditingLesson(null)
      setFormData({
        title: '',
        duration: '',
        module: '',
        videoUrl: '',
        imageUrl: '',
        description: '',
        order: 0,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingLesson(null)
    setFormData({
      title: '',
      duration: '',
      module: '',
      videoUrl: '',
      description: '',
      order: 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.duration || !formData.module) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      if (editingLesson) {
        // Atualizar aula existente
        const response = await fetch(`${API_URL}/lessons/${editingLesson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success('Aula atualizada com sucesso!')
          fetchLessons()
          handleCloseDialog()
        } else {
          toast.error('Erro ao atualizar aula')
        }
      } else {
        // Criar nova aula
        const response = await fetch(`${API_URL}/lessons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success('Aula criada com sucesso!')
          fetchLessons()
          handleCloseDialog()
        } else {
          toast.error('Erro ao criar aula')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar aula:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/lessons/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Aula excluída com sucesso!')
        fetchLessons()
      } else {
        toast.error('Erro ao excluir aula')
      }
    } catch (error) {
      console.error('Erro ao excluir aula:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleOpenTasksDialog = async (lessonId: number) => {
    setCurrentLessonId(lessonId)
    setIsTasksDialogOpen(true)
    await fetchActivationTasks(lessonId)
  }

  const handleOpenMaterialsDialog = async (lessonId: number) => {
    setCurrentLessonId(lessonId)
    setIsMaterialsDialogOpen(true)
    await fetchMaterials(lessonId)
  }

  const fetchActivationTasks = async (lessonId: number) => {
    try {
      const response = await fetch(`${API_URL}/lessons/${lessonId}/activation-tasks`)
      if (response.ok) {
        const data = await response.json()
        setActivationTasks(data)
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    }
  }

  const fetchMaterials = async (lessonId: number) => {
    try {
      const response = await fetch(`${API_URL}/lessons/${lessonId}/materials`)
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Erro ao buscar materiais:', error)
    }
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !currentLessonId) return

    try {
      const response = await fetch(`${API_URL}/lessons/${currentLessonId}/activation-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          order: activationTasks.length,
        }),
      })

      if (response.ok) {
        toast.success('Tarefa adicionada!')
        setNewTaskTitle('')
        fetchActivationTasks(currentLessonId)
      } else {
        toast.error('Erro ao adicionar tarefa')
      }
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      const response = await fetch(`${API_URL}/lessons/activation-tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Tarefa excluída!')
        if (currentLessonId) fetchActivationTasks(currentLessonId)
      } else {
        toast.error('Erro ao excluir tarefa')
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleAddMaterial = async () => {
    if (!newMaterial.title.trim() || !currentLessonId) return

    try {
      const response = await fetch(`${API_URL}/lessons/${currentLessonId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMaterial.title.trim(),
          fileUrl: newMaterial.fileUrl || null,
          fileType: newMaterial.fileType || null,
          fileSize: newMaterial.fileSize ? parseInt(newMaterial.fileSize) : null,
          order: materials.length,
        }),
      })

      if (response.ok) {
        toast.success('Material adicionado!')
        setNewMaterial({ title: '', fileUrl: '', fileType: '', fileSize: '' })
        fetchMaterials(currentLessonId)
      } else {
        toast.error('Erro ao adicionar material')
      }
    } catch (error) {
      console.error('Erro ao adicionar material:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDeleteMaterial = async (materialId: number) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return

    try {
      const response = await fetch(`${API_URL}/lessons/materials/${materialId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Material excluído!')
        if (currentLessonId) fetchMaterials(currentLessonId)
      } else {
        toast.error('Erro ao excluir material')
      }
    } catch (error) {
      console.error('Erro ao excluir material:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const filteredLessons = lessons.filter(
    (lesson) =>
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.module?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          Painel Administrativo - Academia Airlign Mastery Circle
        </h1>
        <p className="text-muted-foreground">
          Gerencie as aulas da Academia Airlign Mastery Circle. Use os botões <strong>Tarefas</strong> e <strong>Materiais</strong> na tabela para adicionar conteúdo específico de cada aula.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Aulas Cadastradas</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar aulas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[300px]"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Aula
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingLesson ? 'Editar Aula' : 'Nova Aula'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingLesson
                        ? 'Atualize as informações da aula'
                        : 'Preencha os dados para criar uma nova aula'}
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
                          placeholder="Ex: Fundamentos da Gestão Dentária"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="duration">
                            Duração <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="duration"
                            value={formData.duration}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: e.target.value,
                              })
                            }
                            placeholder="Ex: 45 min"
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="module">
                            Módulo <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.module}
                            onValueChange={(value) =>
                              setFormData({ ...formData, module: value })
                            }
                            required
                          >
                            <SelectTrigger id="module">
                              <SelectValue placeholder="Selecione o módulo" />
                            </SelectTrigger>
                            <SelectContent>
                              {modules.map((module) => (
                                <SelectItem key={module} value={module}>
                                  {module}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="videoUrl">URL do Vídeo</Label>
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
                          placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Suporta URLs do YouTube e Vimeo. Exemplos:
                          <br />
                          • YouTube: https://youtube.com/watch?v=VIDEO_ID
                          <br />
                          • Vimeo: https://vimeo.com/VIDEO_ID
                          <br />
                          • Embed direto: https://youtube.com/embed/VIDEO_ID
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="imageUrl">URL da Imagem do Card</Label>
                        <Input
                          id="imageUrl"
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              imageUrl: e.target.value,
                            })
                          }
                          placeholder="https://... ou deixe vazio para usar imagem padrão"
                        />
                        <p className="text-xs text-muted-foreground">
                          URL da imagem que aparecerá no card da aula. Se não preenchido, será usada uma imagem padrão baseada no módulo.
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
                          placeholder="Descrição da aula..."
                          rows={4}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="order">Ordem</Label>
                        <Input
                          id="order"
                          type="number"
                          min="0"
                          value={formData.order}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              order: parseInt(e.target.value) || 0,
                            })
                          }
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
                        {editingLesson ? 'Atualizar' : 'Criar'}
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
              Carregando aulas...
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Nenhuma aula encontrada com o termo pesquisado'
                : 'Nenhuma aula cadastrada. Clique em "Nova Aula" para começar.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Vídeo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">
                      {lesson.order}
                    </TableCell>
                    <TableCell className="font-medium">
                      {lesson.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lesson.module}</Badge>
                    </TableCell>
                    <TableCell>{lesson.duration}</TableCell>
                    <TableCell>
                      {lesson.videoUrl ? (
                        <Badge variant="default" className="bg-green-500">
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTasksDialog(lesson.id)}
                          className="text-xs"
                        >
                          <ListTodo className="h-3 w-3 mr-1" />
                          Tarefas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMaterialsDialog(lesson.id)}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Materiais
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(lesson)}
                          title="Editar Aula"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lesson.id)}
                          className="text-destructive hover:text-destructive"
                          title="Excluir Aula"
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

      {/* Dialog de Tarefas de Ativação */}
      <Dialog open={isTasksDialogOpen} onOpenChange={setIsTasksDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Tarefas de Ativação</DialogTitle>
            <DialogDescription>
              Adicione e gerencie as tarefas de ativação desta aula
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nova tarefa de ativação..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTask()
                  }
                }}
              />
              <Button onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {activationTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma tarefa cadastrada. Adicione uma nova tarefa acima.
                </p>
              ) : (
                activationTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-sm">{task.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTasksDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Materiais */}
      <Dialog open={isMaterialsDialogOpen} onOpenChange={setIsMaterialsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Materiais</DialogTitle>
            <DialogDescription>
              Adicione e gerencie os materiais desta aula
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2 p-4 border rounded-lg">
              <Label>Título do Material</Label>
              <Input
                placeholder="Ex: Diapositivos da Aula"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
              />
              <Label>URL do Arquivo</Label>
              <Input
                placeholder="https://..."
                value={newMaterial.fileUrl}
                onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tipo (opcional)</Label>
                  <Input
                    placeholder="Ex: pdf, xls, doc"
                    value={newMaterial.fileType}
                    onChange={(e) => setNewMaterial({ ...newMaterial, fileType: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tamanho em bytes (opcional)</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 2516582"
                    value={newMaterial.fileSize}
                    onChange={(e) => setNewMaterial({ ...newMaterial, fileSize: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleAddMaterial} disabled={!newMaterial.title.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Material
              </Button>
            </div>
            <div className="space-y-2">
              {materials.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum material cadastrado. Adicione um novo material acima.
                </p>
              ) : (
                materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium">{material.title}</span>
                      {material.fileType && (
                        <Badge variant="outline" className="ml-2">
                          {material.fileType.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaterialsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

