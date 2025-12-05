import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Download, MessageSquare, PlayCircle, Heart, Reply, Edit, Trash2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Função para converter URLs do YouTube/Vimeo para formato embed
const getEmbedUrl = (url: string): string | null => {
  if (!url || !url.trim()) return null

  const cleanUrl = url.trim()

  // YouTube - vários formatos (melhorado para lidar com parâmetros extras)
  // Suporta: watch?v=, /v/, /embed/, youtu.be/
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=)([^"&?\/\s]{11})/, // watch?v=VIDEO_ID
    /(?:youtube\.com\/v\/)([^"&?\/\s]{11})/, // /v/VIDEO_ID
    /(?:youtube\.com\/embed\/)([^"&?\/\s]{11})/, // /embed/VIDEO_ID
    /(?:youtu\.be\/)([^"&?\/\s]{11})/, // youtu.be/VIDEO_ID
  ]

  for (const pattern of youtubePatterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1]) {
      // Extrair timestamp se houver (t=)
      const timeMatch = cleanUrl.match(/[?&]t=(\d+)/)
      const timeParam = timeMatch ? `?start=${timeMatch[1]}` : ''
      return `https://www.youtube.com/embed/${match[1]}${timeParam}`
    }
  }

  // Vimeo
  const vimeoPatterns = [
    /(?:vimeo\.com\/)(\d+)/, // vimeo.com/VIDEO_ID
    /(?:player\.vimeo\.com\/video\/)(\d+)/, // player.vimeo.com/video/VIDEO_ID
  ]

  for (const pattern of vimeoPatterns) {
    const match = cleanUrl.match(pattern)
    if (match && match[1]) {
      return `https://player.vimeo.com/video/${match[1]}`
    }
  }

  // Se já for uma URL de embed, retornar como está
  if (cleanUrl.includes('embed') || cleanUrl.includes('player.vimeo.com')) {
    return cleanUrl
  }

  // Para outros formatos, tentar usar diretamente
  return cleanUrl
}

type ActivationTask = {
  id: number
  lessonId: number
  title: string
  order: number
  completed?: boolean
  completedAt?: string
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

type LessonComment = {
  id: number
  lessonId: number
  userId: number
  parentId?: number
  author: string
  avatar?: string
  content: string
  likes: number
  createdAt: string
  updatedAt: string
  replies?: LessonComment[]
}

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
  activationTasks?: ActivationTask[]
  materials?: Material[]
}

export default function LessonDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [allLessons, setAllLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [comments, setComments] = useState<LessonComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({})
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editContent, setEditContent] = useState<{ [key: number]: string }>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: number]: boolean }>({})
  const [isEditingComment, setIsEditingComment] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    fetchLesson()
    fetchAllLessons()
  }, [id])

  useEffect(() => {
    if (lesson?.id) {
      fetchComments()
    }
  }, [lesson?.id])


  const fetchLesson = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/lessons/${id}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Aula carregada:', data)
        console.log('Video URL:', data.videoUrl)
        console.log('Video URL existe?', !!data.videoUrl)
        console.log('Video URL tipo:', typeof data.videoUrl)
        setLesson(data)
        
        // Debug: verificar se a URL está sendo detectada
        if (data.videoUrl) {
          console.log('✅ URL de vídeo detectada:', data.videoUrl)
        } else {
          console.warn('⚠️ Nenhuma URL de vídeo encontrada na aula')
        }
        
        // Se houver usuário, buscar progresso nas tarefas
        if (user?.id && data.activationTasks) {
          fetchUserTasksProgress()
        }
      } else {
        console.error('Erro ao buscar aula:', response.status, response.statusText)
        toast.error('Erro ao carregar aula')
      }
    } catch (error) {
      console.error('Erro ao buscar aula:', error)
      toast.error('Erro ao carregar aula')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserTasksProgress = async () => {
    if (!user?.id || !id) return
    
    try {
      const response = await fetch(`${API_URL}/lessons/${id}/activation-tasks/user/${user.id}`)
      if (response.ok) {
        const tasks = await response.json()
        setLesson((prev) => {
          if (!prev) return null
          return {
            ...prev,
            activationTasks: tasks,
          }
        })
      }
    } catch (error) {
      console.error('Erro ao buscar progresso das tarefas:', error)
    }
  }

  const handleTaskToggle = async (taskId: number, completed: boolean) => {
    if (!user?.id) {
      toast.error('Por favor, faça login para marcar tarefas')
      return
    }

    try {
      const response = await fetch(`${API_URL}/lessons/activation-tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          completed: !completed,
        }),
      })

      if (response.ok) {
        fetchUserTasksProgress()
        toast.success(completed ? 'Tarefa desmarcada' : 'Tarefa concluída!')
      } else {
        toast.error('Erro ao atualizar tarefa')
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const fetchComments = async () => {
    if (!lesson?.id) return
    try {
      const response = await fetch(`${API_URL}/lessons/${lesson.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      } else {
        // Se a tabela não existir, retornar array vazio silenciosamente
        const errorData = await response.json().catch(() => ({}))
        if (errorData.error?.includes('Tabela de comentários não encontrada')) {
          console.log('Tabela de comentários ainda não foi criada')
          setComments([])
        }
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
      // Em caso de erro, definir array vazio para não quebrar a interface
      setComments([])
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !lesson?.id) return
    if (!user) {
      toast.error('Por favor, faça login para comentar')
      return
    }

    try {
      setIsSubmittingComment(true)
      const response = await fetch(`${API_URL}/lessons/${lesson.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          author: user.name || 'Usuário',
          avatar: user.avatar,
          content: newComment.trim(),
        }),
      })

      if (response.ok) {
        setNewComment('')
        toast.success('Comentário publicado!')
        fetchComments()
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Erro ao publicar comentário'
        
        if (errorMessage.includes('Tabela de comentários não encontrada')) {
          toast.error('Tabela de comentários não encontrada. Execute: npm run db:create-lesson-tasks no servidor', {
            duration: 5000,
          })
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error('Erro ao criar comentário:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReply = async (parentId: number) => {
    const content = replyContent[parentId]
    if (!content?.trim() || !lesson?.id) {
      toast.error('Digite uma resposta')
      return
    }
    if (!user) {
      toast.error('Por favor, faça login para responder')
      return
    }

    try {
      setIsSubmittingReply({ ...isSubmittingReply, [parentId]: true })
      const response = await fetch(`${API_URL}/lessons/${lesson.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          author: user.name || 'Usuário',
          avatar: user.avatar,
          content: content.trim(),
          parentId: parentId,
        }),
      })

      if (response.ok) {
        setReplyContent({ ...replyContent, [parentId]: '' })
        setReplyingTo(null)
        toast.success('Resposta publicada!')
        fetchComments()
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Erro ao publicar resposta'
        
        if (errorMessage.includes('Tabela de comentários não encontrada')) {
          toast.error('Tabela de comentários não encontrada. Execute: npm run db:create-lesson-tasks no servidor', {
            duration: 5000,
          })
        } else {
          toast.error(errorMessage)
        }
      }
    } catch (error) {
      console.error('Erro ao criar resposta:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsSubmittingReply({ ...isSubmittingReply, [parentId]: false })
    }
  }

  const handleEditComment = async (commentId: number) => {
    const content = editContent[commentId]
    if (!content?.trim()) {
      toast.error('O comentário não pode estar vazio')
      return
    }

    try {
      setIsEditingComment({ ...isEditingComment, [commentId]: true })
      const response = await fetch(`${API_URL}/lessons/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      })

      if (response.ok) {
        setEditingComment(null)
        setEditContent({ ...editContent, [commentId]: '' })
        toast.success('Comentário atualizado!')
        fetchComments()
      } else {
        toast.error('Erro ao atualizar comentário')
      }
    } catch (error) {
      console.error('Erro ao editar comentário:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsEditingComment({ ...isEditingComment, [commentId]: false })
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/lessons/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Comentário excluído!')
        fetchComments()
      } else {
        toast.error('Erro ao excluir comentário')
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleLikeComment = async (commentId: number) => {
    if (!user) {
      toast.error('Por favor, faça login para curtir comentários')
      return
    }

    try {
      const response = await fetch(`${API_URL}/lessons/comments/${commentId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error)
    }
  }

  const fetchAllLessons = async () => {
    try {
      const response = await fetch(`${API_URL}/lessons`)
      if (response.ok) {
        const data = await response.json()
        setAllLessons(data)
      }
    } catch (error) {
      console.error('Erro ao buscar aulas:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">
          <p>Carregando aula...</p>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
          <Link to="/academy">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Academia
          </Link>
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          <p>Aula não encontrada.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        asChild
        className="pl-0 hover:pl-2 transition-all"
      >
        <Link to="/academy">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Academia
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="w-full bg-black rounded-lg relative overflow-hidden shadow-lg" style={{ 
            aspectRatio: '16/9', 
            minHeight: '500px',
            width: '100%',
            position: 'relative'
          }}>
            {(() => {
              // Verificar se há URL de vídeo válida
              const hasVideoUrl = lesson.videoUrl && lesson.videoUrl.trim().length > 0
              
              console.log('=== DEBUG PLAYER ===')
              console.log('lesson.videoUrl:', lesson.videoUrl)
              console.log('hasVideoUrl:', hasVideoUrl)
              
              // Se há URL, mostrar o iframe diretamente (carregamento automático)
              if (hasVideoUrl) {
                const embedUrl = getEmbedUrl(lesson.videoUrl)
                console.log('URL original:', lesson.videoUrl)
                console.log('URL convertida:', embedUrl)
                
                const finalUrl = embedUrl || lesson.videoUrl
                
                return (
                  <iframe
                    src={finalUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={lesson.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                )
              }

              // Thumbnail quando não há vídeo
              return (
                <div className="relative w-full h-full bg-black" style={{ minHeight: '500px' }}>
                  <img
                    src={
                      imageError
                        ? `https://via.placeholder.com/800x450/1a1a1a/FFD700?text=${encodeURIComponent(lesson.title)}`
                        : lesson.imageUrl || `https://img.usecurling.com/p/800/450?q=dental%20class&color=blue`
                    }
                    alt="Video Thumbnail"
                    onError={() => setImageError(true)}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center text-white">
                      <PlayCircle className="h-20 w-20 mx-auto mb-2 opacity-50" />
                      <p className="text-sm opacity-75">Vídeo não disponível</p>
                      <p className="text-xs opacity-50 mt-1">Adicione uma URL de vídeo na área administrativa</p>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-primary">
                {lesson.title}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {lesson.description ||
                'Nesta aula, vamos explorar os conceitos fundamentais para transformar a sua clínica num negócio rentável e organizado. Aprenda as estratégias que o top 1% dos dentistas utiliza.'}
            </p>
          </div>

          <Tabs defaultValue="activation" className="w-full">
            <TabsList>
              <TabsTrigger value="activation">Ativação</TabsTrigger>
              <TabsTrigger value="materials">Materiais</TabsTrigger>
              <TabsTrigger value="comments">Dúvidas</TabsTrigger>
            </TabsList>
            <TabsContent value="activation" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tarefas de Ativação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lesson.activationTasks && lesson.activationTasks.length > 0 ? (
                    lesson.activationTasks.map((task) => (
                      <div key={task.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={task.completed || false}
                          onCheckedChange={() => handleTaskToggle(task.id, task.completed || false)}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className={`text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma tarefa de ativação cadastrada para esta aula.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="materials" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {lesson.materials && lesson.materials.length > 0 ? (
                    lesson.materials.map((material) => {
                      const getFileIcon = (fileType?: string) => {
                        const type = fileType?.toLowerCase() || ''
                        if (type.includes('pdf')) return { bg: 'bg-red-100', text: 'text-red-600', label: 'PDF' }
                        if (type.includes('xls') || type.includes('excel')) return { bg: 'bg-green-100', text: 'text-green-600', label: 'XLS' }
                        if (type.includes('doc') || type.includes('word')) return { bg: 'bg-blue-100', text: 'text-blue-600', label: 'DOC' }
                        return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'FILE' }
                      }
                      const icon = getFileIcon(material.fileType)
                      const fileSizeMB = material.fileSize ? (material.fileSize / 1024 / 1024).toFixed(1) : null

                      return (
                        <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 ${icon.bg} ${icon.text} rounded flex items-center justify-center text-xs font-semibold`}>
                              {icon.label}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{material.title}</p>
                              {fileSizeMB && (
                                <p className="text-xs text-muted-foreground">{fileSizeMB} MB</p>
                              )}
                            </div>
                          </div>
                          {material.fileUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum material disponível para esta aula.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Dúvidas e Discussão ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Formulário de Comentário */}
                  {user ? (
                    <div className="flex gap-4">
                      <Avatar className="border-2 border-primary/30">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-gradient-gold text-primary-foreground font-bold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Faça uma pergunta ou compartilhe seus pensamentos sobre esta aula..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={handleSubmitComment}
                            disabled={isSubmittingComment || !newComment.trim()}
                            className="bg-gradient-gold hover:bg-primary text-black font-semibold"
                          >
                            {isSubmittingComment ? 'Publicando...' : 'Publicar'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">
                        <Link to="/login" className="text-primary hover:underline">
                          Faça login
                        </Link> para participar da discussão
                      </p>
                    </div>
                  )}

                  {/* Lista de Comentários */}
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Seja o primeiro a fazer uma pergunta ou comentar!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="space-y-4">
                          {/* Comentário Principal */}
                          <div className="flex gap-4 pb-4 border-b">
                            <Avatar className="border-2 border-primary/30">
                              <AvatarImage src={comment.avatar} />
                              <AvatarFallback className="bg-gradient-gold text-primary-foreground font-bold">
                                {comment.author.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(comment.createdAt), "dd 'de' MMM 'às' HH:mm", {
                                    locale: pt,
                                  })}
                                </span>
                                {comment.updatedAt !== comment.createdAt && (
                                  <span className="text-xs text-muted-foreground italic">
                                    (editado)
                                  </span>
                                )}
                              </div>
                              {editingComment === comment.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editContent[comment.id] || comment.content}
                                    onChange={(e) =>
                                      setEditContent({ ...editContent, [comment.id]: e.target.value })
                                    }
                                    rows={3}
                                    className="bg-muted/50"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleEditComment(comment.id)}
                                      disabled={isEditingComment[comment.id] || !editContent[comment.id]?.trim()}
                                      className="bg-primary hover:bg-primary/90"
                                    >
                                      {isEditingComment[comment.id] ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingComment(null)
                                        setEditContent({ ...editContent, [comment.id]: '' })
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm whitespace-pre-wrap text-foreground/90">
                                    {comment.content}
                                  </p>
                                  <div className="flex items-center gap-4">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleLikeComment(comment.id)}
                                      className="gap-2 px-2 hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                      <Heart className="h-4 w-4" />
                                      {comment.likes || 0}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                      className="gap-2 px-2 hover:bg-primary/10 hover:text-primary transition-all"
                                    >
                                      <Reply className="h-4 w-4" />
                                      Responder
                                    </Button>
                                    {comment.userId === user?.id && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingComment(comment.id)
                                            setEditContent({ ...editContent, [comment.id]: comment.content })
                                          }}
                                          className="gap-2 px-2 hover:bg-primary/10 hover:text-primary transition-all"
                                        >
                                          <Edit className="h-4 w-4" />
                                          Editar
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteComment(comment.id)}
                                          className="gap-2 px-2 hover:bg-destructive/10 hover:text-destructive transition-all"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                          Excluir
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Formulário de Resposta */}
                          {replyingTo === comment.id && (
                            <div className="ml-12 flex gap-4">
                              <Avatar className="border-2 border-primary/30 h-8 w-8">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-gradient-gold text-primary-foreground font-bold text-xs">
                                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <Textarea
                                  placeholder="Escreva sua resposta..."
                                  value={replyContent[comment.id] || ''}
                                  onChange={(e) =>
                                    setReplyContent({ ...replyContent, [comment.id]: e.target.value })
                                  }
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleReply(comment.id)}
                                    disabled={isSubmittingReply[comment.id] || !replyContent[comment.id]?.trim()}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    {isSubmittingReply[comment.id] ? 'Publicando...' : 'Responder'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setReplyingTo(null)
                                      setReplyContent({ ...replyContent, [comment.id]: '' })
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Respostas */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-12 space-y-4 border-l-2 border-primary/20 pl-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-4">
                                  <Avatar className="border-2 border-primary/30 h-8 w-8">
                                    <AvatarImage src={reply.avatar} />
                                    <AvatarFallback className="bg-gradient-gold text-primary-foreground font-bold text-xs">
                                      {reply.author.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm">{reply.author}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(reply.createdAt), "dd 'de' MMM 'às' HH:mm", {
                                          locale: pt,
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap text-foreground/90">
                                      {reply.content}
                                    </p>
                                    <div className="flex items-center gap-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleLikeComment(reply.id)}
                                        className="gap-2 px-2 hover:bg-primary/10 hover:text-primary transition-all"
                                      >
                                        <Heart className="h-3 w-3" />
                                        {reply.likes || 0}
                                      </Button>
                                      {reply.userId === user?.id && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteComment(reply.id)}
                                          className="gap-2 px-2 hover:bg-destructive/10 hover:text-destructive transition-all text-xs"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          Excluir
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Próximas Aulas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allLessons
                .filter((l) => l.id !== lesson.id)
                .slice(0, 3)
                .map((nextLesson) => (
                  <div
                    key={nextLesson.id}
                    className="flex gap-3 items-start group cursor-pointer"
                  >
                    <div className="h-16 w-24 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img
                        src={
                          nextLesson.imageUrl ||
                          `https://img.usecurling.com/p/200/150?q=dental&seed=${nextLesson.id}`
                        }
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://via.placeholder.com/200x150/1a1a1a/FFD700?text=${encodeURIComponent(nextLesson.title.substring(0, 10))}`
                        }}
                        className="w-full h-full object-cover"
                        alt={nextLesson.title}
                      />
                    </div>
                    <div>
                      <Link to={`/academy/lesson/${nextLesson.id}`}>
                        <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                          {nextLesson.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {nextLesson.duration}
                        </p>
                      </Link>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

