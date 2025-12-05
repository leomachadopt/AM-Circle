import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { mockUser } from '@/lib/data'
import { useAuth } from '@/contexts/AuthContext'
import { Heart, MessageCircle, Share2, Users, Tag, Image as ImageIcon, File, X, Download, Upload, Edit, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type PostCategory = {
  id: number
  name: string
  slug: string
  description?: string
}

type PostFile = {
  url: string
  name: string
  filename: string
  size: number
  type: string
}

type Post = {
  id: number
  author: string
  avatar?: string
  content: string
  topic?: string
  images?: string[]
  files?: PostFile[]
  likes: number
  comments: number
  time: string
  userId?: number
  isLiked?: boolean
}

type Comment = {
  id: number
  postId: number
  userId: number | null
  content: string
  author?: string
  avatar?: string
  createdAt: string
  time?: string
}

export default function Community() {
  const { user, token } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostTopic, setNewPostTopic] = useState('')
  const [activeFilter, setActiveFilter] = useState('Todos')
  const [categories, setCategories] = useState<PostCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<PostFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [commentsOpen, setCommentsOpen] = useState<number | null>(null)
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<number, string>>({})
  const [isLoadingComments, setIsLoadingComments] = useState<Record<number, boolean>>({})
  const [editingPost, setEditingPost] = useState<number | null>(null)
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editPostContent, setEditPostContent] = useState('')
  const [editCommentContent, setEditCommentContent] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Agora mesmo'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`
    return date.toLocaleDateString('pt-PT')
  }

  const fetchPosts = async () => {
    try {
      setIsLoadingPosts(true)
      const response = await fetch(`${API_URL}/posts`, {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      })
      if (response.ok) {
        const data = await response.json()
        // Formatar posts do backend para o formato esperado
        const formattedPosts: Post[] = data.map((post: any) => {
          // Garantir que images seja um array
          let images = post.images
          if (images && !Array.isArray(images)) {
            try {
              images = typeof images === 'string' ? JSON.parse(images) : [images]
            } catch (e) {
              console.error('Erro ao processar images do post:', e, images)
              images = undefined
            }
          }
          
          // Garantir que files seja um array
          let files = post.files
          if (files && !Array.isArray(files)) {
            try {
              files = typeof files === 'string' ? JSON.parse(files) : [files]
            } catch (e) {
              console.error('Erro ao processar files do post:', e, files)
              files = undefined
            }
          }

          return {
            id: post.id,
            author: post.author,
            avatar: post.avatar,
            content: post.content,
            topic: post.topic,
            images: images && images.length > 0 ? images : undefined,
            files: files && files.length > 0 ? files : undefined,
            likes: post.likes || 0,
            comments: post.comments || 0,
            time: formatTimeAgo(post.createdAt || post.created_at),
            userId: post.userId || post.user_id,
            isLiked: post.isLiked || false,
          }
        })
        setPosts(formattedPosts)
        
        // Atualizar o Set de posts curtidos baseado nos dados do servidor
        const likedPostIds = formattedPosts
          .filter((post) => post.isLiked)
          .map((post) => post.id)
        setLikedPosts(new Set(likedPostIds))
      } else {
        console.error('Erro ao carregar posts:', response.status, response.statusText)
        setPosts([])
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error)
      setPosts([])
    } finally {
      setIsLoadingPosts(false)
    }
  }

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await fetch(`${API_URL}/post-categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Erro ao carregar categorias:', response.status, response.statusText)
        // Fallback para categorias padrão se a API falhar
        setCategories([
          { id: 1, name: 'Perguntas', slug: 'perguntas' },
          { id: 2, name: 'Links Interessantes', slug: 'links-interessantes' },
          { id: 3, name: 'Ficheiros', slug: 'ficheiros' },
        ])
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      // Fallback para categorias padrão se a API falhar
      setCategories([
        { id: 1, name: 'Perguntas', slug: 'perguntas' },
        { id: 2, name: 'Links Interessantes', slug: 'links-interessantes' },
        { id: 3, name: 'Ficheiros', slug: 'ficheiros' },
      ])
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const topics = categories.map((cat) => cat.name)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validar tamanho e tipo
    const maxImageSize = 5 * 1024 * 1024 // 5MB para imagens
    const maxFileSize = 20 * 1024 * 1024 // 20MB para arquivos
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    const allowedFileTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
    ]

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith('image/')
      const isAllowed = isImage
        ? allowedImageTypes.includes(file.type)
        : allowedFileTypes.includes(file.type)

      if (!isAllowed) {
        toast.error(`Tipo de arquivo não permitido: ${file.name}`)
        return false
      }

      const maxSize = isImage ? maxImageSize : maxFileSize
      const maxSizeMB = isImage ? 5 : 20
      
      if (file.size > maxSize) {
        toast.error(`Arquivo muito grande: ${file.name} (máximo ${maxSizeMB}MB)`)
        return false
      }

      return true
    })

    setSelectedFiles((prev) => [...prev, ...validFiles])
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUploadMedia = async (): Promise<{ images: string[]; files: PostFile[] } | null> => {
    if (selectedFiles.length === 0) {
      return null
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append('media', file)
      })

      const response = await fetch(`${API_URL}/posts/upload`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const newImages = data.images || []
        const newFiles = data.files || []
        
        setUploadedImages((prev) => [...prev, ...newImages])
        setUploadedFiles((prev) => [...prev, ...newFiles])
        setSelectedFiles([])
        
        return { images: newImages, files: newFiles }
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao fazer upload dos arquivos')
        return null
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao conectar com o servidor')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Por favor, escreva algo para publicar.')
      return
    }

    if (!newPostTopic) {
      toast.error('Por favor, selecione um tópico para a sua publicação.')
      return
    }

    if (!user) {
      toast.error('Por favor, faça login para criar uma publicação.')
      return
    }

    try {
      // Se houver arquivos selecionados mas não enviados, fazer upload primeiro
      let newUploadedImages = [...uploadedImages]
      let newUploadedFiles = [...uploadedFiles]
      
      if (selectedFiles.length > 0) {
        const uploadResult = await handleUploadMedia()
        if (uploadResult) {
          newUploadedImages = [...uploadedImages, ...uploadResult.images]
          newUploadedFiles = [...uploadedFiles, ...uploadResult.files]
        } else {
          // Se o upload falhou, não criar o post
          return
        }
      }

      // Preparar dados do post
      const postData = {
        author: user.name,
        avatar: user.avatar,
        content: newPostContent,
        topic: newPostTopic,
        images: newUploadedImages.length > 0 ? newUploadedImages : null,
        files: newUploadedFiles.length > 0 ? newUploadedFiles : null,
        userId: user.id,
      }

      console.log('Criando post com dados:', {
        ...postData,
        imagesCount: newUploadedImages.length,
        filesCount: newUploadedFiles.length,
      })

      // Enviar post para o backend
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      })

      if (response.ok) {
        const newPostData = await response.json()
        
        // Garantir que images seja um array
        let images = newPostData.images
        if (images && !Array.isArray(images)) {
          try {
            images = typeof images === 'string' ? JSON.parse(images) : [images]
          } catch (e) {
            console.error('Erro ao processar images do novo post:', e, images)
            images = undefined
          }
        }
        
        // Garantir que files seja um array
        let files = newPostData.files
        if (files && !Array.isArray(files)) {
          try {
            files = typeof files === 'string' ? JSON.parse(files) : [files]
          } catch (e) {
            console.error('Erro ao processar files do novo post:', e, files)
            files = undefined
          }
        }
        
        console.log('Post criado com sucesso:', {
          id: newPostData.id,
          imagesCount: images?.length || 0,
          filesCount: files?.length || 0,
          images,
        })
        
        // Formatar o post retornado
        const formattedPost: Post = {
          id: newPostData.id,
          author: newPostData.author,
          avatar: newPostData.avatar,
          content: newPostData.content,
          topic: newPostData.topic,
          images: images && images.length > 0 ? images : undefined,
          files: files && files.length > 0 ? files : undefined,
          likes: newPostData.likes || 0,
          comments: newPostData.comments || 0,
          time: formatTimeAgo(newPostData.createdAt || newPostData.created_at || new Date().toISOString()),
        }

        // Adicionar o novo post no início da lista
        setPosts([formattedPost, ...posts])
        
        // Limpar formulário
        setNewPostContent('')
        setNewPostTopic('')
        setSelectedFiles([])
        setUploadedImages([])
        setUploadedFiles([])
        
        toast.success('Publicação criada com sucesso!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao criar publicação')
      }
    } catch (error) {
      console.error('Erro ao criar post:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const filteredPosts =
    activeFilter === 'Todos'
      ? posts
      : posts.filter((post) => post.topic === activeFilter)

  const getTopicBadgeVariant = (topic: string) => {
    switch (topic) {
      case 'Perguntas':
        return 'default'
      case 'Links Interessantes':
        return 'secondary'
      case 'Ficheiros':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const handleLikePost = async (postId: number) => {
    if (!token) {
      toast.error('Por favor, faça login para curtir posts')
      return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const updatedPost = await response.json()
        
        // Atualizar o post na lista
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { 
                  ...post, 
                  likes: updatedPost.likes || post.likes,
                  isLiked: updatedPost.isLiked !== undefined ? updatedPost.isLiked : !post.isLiked,
                }
              : post
          )
        )

        // Atualizar o Set de posts curtidos
        if (updatedPost.isLiked) {
          setLikedPosts((prev) => new Set(prev).add(postId))
        } else {
          setLikedPosts((prev) => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }

        toast.success(updatedPost.isLiked ? 'Post curtido!' : 'Post descurtido!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao curtir/descurtir post')
      }
    } catch (error) {
      console.error('Erro ao curtir/descurtir post:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const fetchComments = async (postId: number) => {
    if (comments[postId]) {
      // Comentários já carregados
      return
    }

    try {
      setIsLoadingComments((prev) => ({ ...prev, [postId]: true }))
      const response = await fetch(`${API_URL}/posts/${postId}/comments`)
      
      if (response.ok) {
        const data = await response.json()
        const formattedComments: Comment[] = data.map((comment: any) => ({
          id: comment.id,
          postId: comment.postId || comment.post_id,
          userId: comment.userId || comment.user_id,
          content: comment.content,
          author: comment.author || 'Usuário',
          avatar: comment.avatar,
          createdAt: comment.createdAt || comment.created_at,
          time: formatTimeAgo(comment.createdAt || comment.created_at),
        }))
        
        setComments((prev) => ({ ...prev, [postId]: formattedComments }))
      } else {
        console.error('Erro ao carregar comentários:', response.status)
        setComments((prev) => ({ ...prev, [postId]: [] }))
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
      setComments((prev) => ({ ...prev, [postId]: [] }))
    } finally {
      setIsLoadingComments((prev) => ({ ...prev, [postId]: false }))
    }
  }

  const handleAddComment = async (postId: number) => {
    const commentContent = newComment[postId]?.trim()
    
    if (!commentContent) {
      toast.error('Por favor, escreva um comentário')
      return
    }

    if (!user?.id) {
      toast.error('Por favor, faça login para comentar')
      return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || null,
          content: commentContent,
        }),
      })

      if (response.ok) {
        const newCommentData = await response.json()
        
        // Formatar o novo comentário
        const formattedComment: Comment = {
          id: newCommentData.id,
          postId: newCommentData.postId || newCommentData.post_id,
          userId: newCommentData.userId || newCommentData.user_id,
          content: newCommentData.content,
          author: user?.name || 'Você',
          avatar: user?.avatar,
          createdAt: newCommentData.createdAt || newCommentData.created_at,
          time: 'Agora mesmo',
        }

        // Adicionar comentário à lista
        setComments((prev) => ({
          ...prev,
          [postId]: [formattedComment, ...(prev[postId] || [])],
        }))

        // Atualizar contador de comentários no post
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, comments: post.comments + 1 }
              : post
          )
        )

        // Limpar campo de comentário
        setNewComment((prev) => ({ ...prev, [postId]: '' }))
        toast.success('Comentário adicionado!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao adicionar comentário')
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleEditPost = async (postId: number) => {
    const post = posts.find((p) => p.id === postId)
    if (!post) return

    setEditingPost(postId)
    setEditPostContent(post.content)
  }

  const handleSavePost = async (postId: number) => {
    if (!editPostContent.trim()) {
      toast.error('O conteúdo do post não pode estar vazio')
      return
    }

    if (!token) {
      toast.error('Por favor, faça login para editar posts')
      return
    }

    try {
      const post = posts.find((p) => p.id === postId)
      if (!post) return

      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editPostContent.trim(),
          topic: post.topic,
          images: post.images || null,
          files: post.files || null,
        }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  content: updatedPost.content,
                  topic: updatedPost.topic,
                  images: updatedPost.images || undefined,
                  files: updatedPost.files || undefined,
                }
              : p
          )
        )
        setEditingPost(null)
        setEditPostContent('')
        toast.success('Post editado com sucesso!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao editar post')
      }
    } catch (error) {
      console.error('Erro ao editar post:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
      return
    }

    if (!token) {
      toast.error('Por favor, faça login para excluir posts')
      return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId))
        setComments((prev) => {
          const newComments = { ...prev }
          delete newComments[postId]
          return newComments
        })
        toast.success('Post excluído com sucesso!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao excluir post')
      }
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleEditComment = (commentId: number, postId: number) => {
    const comment = comments[postId]?.find((c) => c.id === commentId)
    if (!comment) return

    setEditingComment(commentId)
    setEditCommentContent(comment.content)
  }

  const handleSaveComment = async (commentId: number, postId: number) => {
    if (!editCommentContent.trim()) {
      toast.error('O conteúdo do comentário não pode estar vazio')
      return
    }

    if (!token) {
      toast.error('Por favor, faça login para editar comentários')
      return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editCommentContent.trim(),
        }),
      })

      if (response.ok) {
        const updatedComment = await response.json()
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  content: updatedComment.content,
                  time: 'Editado',
                }
              : c
          ),
        }))
        setEditingComment(null)
        setEditCommentContent('')
        toast.success('Comentário editado com sucesso!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao editar comentário')
      }
    } catch (error) {
      console.error('Erro ao editar comentário:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDeleteComment = async (commentId: number, postId: number) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) {
      return
    }

    if (!token) {
      toast.error('Por favor, faça login para excluir comentários')
      return
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
        }))
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, comments: Math.max(0, post.comments - 1) }
              : post
          )
        )
        toast.success('Comentário excluído com sucesso!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao excluir comentário')
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleOpenComments = (postId: number) => {
    if (commentsOpen === postId) {
      // Se já está aberto, fecha
      setCommentsOpen(null)
    } else {
      // Abre e carrega comentários se necessário
      setCommentsOpen(postId)
      fetchComments(postId)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-shadow-gold animate-slide-in-left">
            Comunidade Airlign Mastery Circle
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl animate-slide-up">
            Conecte-se com dentistas de alta performance e compartilhe experiências.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Create Post */}
          <Card className="bg-card border border-border/40 shadow-netflix">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar className="border-2 border-primary/30">
                  {user?.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback className="bg-gradient-gold text-primary-foreground font-bold">
                    {user?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'EU'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <Textarea
                    placeholder="Partilhe uma experiência, dúvida ou ficheiro..."
                    className="min-h-[100px] bg-muted/30 border-border/50 focus:border-primary transition-colors"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  
                  {/* Preview de imagens enviadas */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border/50 cursor-pointer"
                            onClick={() => setImagePreview(imageUrl)}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveUploadedImage(index)
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview de arquivos enviados */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border/50"
                        >
                          <File className="h-4 w-4 text-primary" />
                          <span className="flex-1 text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveUploadedFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview de arquivos selecionados (ainda não enviados) */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {selectedFiles.length} arquivo(s) selecionado(s)
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUploadMedia}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Enviando...' : 'Enviar Arquivos'}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/30"
                          >
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="h-4 w-4 text-primary" />
                            ) : (
                              <File className="h-4 w-4 text-primary" />
                            )}
                            <span className="flex-1 text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleRemoveFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="file-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          asChild
                        >
                          <span>
                            <Upload className="h-4 w-4" />
                            Anexar
                          </span>
                        </Button>
                      </label>
                      <div className="w-full sm:w-[240px]">
                        <Select
                          value={newPostTopic}
                          onValueChange={setNewPostTopic}
                        >
                          <SelectTrigger className="border-border/50 focus:ring-primary">
                            <SelectValue placeholder="Selecione um tópico *" />
                          </SelectTrigger>
                          <SelectContent>
                            {isLoadingCategories ? (
                              <SelectItem value="loading" disabled>
                                Carregando categorias...
                              </SelectItem>
                            ) : (
                              topics.map((topic) => (
                                <SelectItem key={topic} value={topic}>
                                  {topic}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreatePost}
                      className="w-full sm:w-auto bg-gradient-gold hover:bg-primary text-background font-semibold shadow-lg hover:shadow-gold transition-all duration-300"
                    >
                      Publicar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Tabs
            defaultValue="Todos"
            value={activeFilter}
            onValueChange={setActiveFilter}
            className="w-full"
          >
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-2 bg-card/50 backdrop-blur-sm gap-3 border border-border/50 rounded-xl">
              <TabsTrigger
                value="Todos"
                className="text-foreground/80 data-[state=active]:bg-gradient-gold data-[state=active]:text-background data-[state=active]:shadow-gold rounded-lg px-6 py-2.5 border border-border/30 bg-muted/30 hover:bg-primary/10 hover:text-foreground transition-all duration-300 font-medium"
              >
                Todos
              </TabsTrigger>
              {topics.map((topic) => (
                <TabsTrigger
                  key={topic}
                  value={topic}
                  className="text-foreground/80 data-[state=active]:bg-gradient-gold data-[state=active]:text-background data-[state=active]:shadow-gold rounded-lg px-6 py-2.5 border border-border/30 bg-muted/30 hover:bg-primary/10 hover:text-foreground transition-all duration-300 font-medium"
                >
                  {topic}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeFilter} className="mt-6 space-y-4">
              {isLoadingPosts ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Tag className="h-16 w-16 mx-auto mb-4 opacity-20 text-primary animate-pulse" />
                  <p className="text-lg">Carregando publicações...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <Card key={post.id} className="animate-fade-in bg-card border border-border/40 shadow-netflix hover:shadow-gold hover:border-primary/30 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                      <div className="flex items-center gap-4">
                        <Avatar className="border-2 border-primary/30">
                          <AvatarImage src={post.avatar} />
                          <AvatarFallback className="bg-muted">{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-foreground">
                            {post.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {post.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.topic && (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            {post.topic}
                          </Badge>
                        )}
                        {user && post.userId === user.id && (
                          <div className="flex items-center gap-1">
                            {editingPost === post.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-primary/10"
                                  onClick={() => handleSavePost(post.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-primary/10"
                                  onClick={() => handleEditPost(post.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingPost === post.id ? (
                        <div className="mb-4 space-y-2">
                          <Textarea
                            className="min-h-[100px] bg-muted/30 border-border/50 focus:border-primary transition-colors"
                            value={editPostContent}
                            onChange={(e) => setEditPostContent(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSavePost(post.id)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingPost(null)
                                setEditPostContent('')
                              }}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm mb-4 whitespace-pre-wrap text-foreground/90">
                          {post.content}
                        </p>
                      )}
                      
                      {/* Galeria de imagens */}
                      {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                        <div className="mb-4">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {post.images.map((imageUrl: string, index: number) => (
                              <Dialog key={index}>
                                <DialogTrigger asChild>
                                  <div className="relative group cursor-pointer">
                                    <img
                                      src={imageUrl}
                                      alt={`Imagem ${index + 1}`}
                                      className="w-full h-32 object-cover rounded-lg border border-border/50 hover:border-primary transition-colors"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                      <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <img
                                    src={imageUrl}
                                    alt={`Imagem ${index + 1}`}
                                    className="w-full h-auto rounded-lg"
                                  />
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Arquivos para download */}
                      {post.files && post.files.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {post.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                            >
                              <File className="h-5 w-5 text-primary" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = file.url
                                  link.download = file.name
                                  link.target = '_blank'
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                }}
                              >
                                <Download className="h-4 w-4" />
                                Baixar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-muted-foreground">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-2 px-2 hover:bg-primary/10 hover:text-primary transition-all ${
                            (post.isLiked || likedPosts.has(post.id)) ? 'text-primary' : ''
                          }`}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${(post.isLiked || likedPosts.has(post.id)) ? 'fill-current' : ''}`} 
                          /> 
                          {post.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`gap-2 px-2 hover:bg-primary/10 hover:text-primary transition-all ${
                            commentsOpen === post.id ? 'text-primary' : ''
                          }`}
                          onClick={() => handleOpenComments(post.id)}
                        >
                          <MessageCircle className="h-4 w-4" /> {post.comments}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 px-2 ml-auto hover:bg-primary/10 hover:text-primary transition-all"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Seção de comentários inline */}
                      {commentsOpen === post.id && (
                        <div className="mt-4 pt-4 border-t border-border/50 space-y-4 animate-fade-in">
                          {/* Lista de comentários */}
                          <div className="space-y-4">
                            {isLoadingComments[post.id] ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>Carregando comentários...</p>
                              </div>
                            ) : comments[post.id] && comments[post.id].length > 0 ? (
                              comments[post.id].map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                  <Avatar className="border-2 border-primary/30 h-8 w-8">
                                    <AvatarImage src={comment.avatar} />
                                    <AvatarFallback className="bg-muted text-xs">
                                      {comment.author?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-sm text-foreground">
                                        {comment.author || 'Usuário'}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {comment.time || formatTimeAgo(comment.createdAt)}
                                      </span>
                                      {user && comment.userId === user.id && (
                                        <div className="flex items-center gap-1 ml-auto">
                                          {editingComment === comment.id ? (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-primary/10"
                                                onClick={() => handleSaveComment(comment.id, post.id)}
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            </>
                                          ) : (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-primary/10"
                                                onClick={() => handleEditComment(comment.id, post.id)}
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleDeleteComment(comment.id, post.id)}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {editingComment === comment.id ? (
                                      <div className="space-y-2">
                                        <Textarea
                                          className="min-h-[60px] bg-muted/30 border-border/50 focus:border-primary transition-colors text-sm"
                                          value={editCommentContent}
                                          onChange={(e) => setEditCommentContent(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleSaveComment(comment.id, post.id)}
                                            className="bg-primary hover:bg-primary/90 h-7 text-xs"
                                          >
                                            Salvar
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              setEditingComment(null)
                                              setEditCommentContent('')
                                            }}
                                            className="h-7 text-xs"
                                          >
                                            Cancelar
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                                        {comment.content}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-muted-foreground">
                                <p className="text-sm">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
                              </div>
                            )}
                          </div>

                          {/* Formulário para adicionar comentário */}
                          <div className="pt-4 border-t border-border/30 space-y-3">
                            <div className="flex gap-3">
                              <Avatar className="border-2 border-primary/30 h-8 w-8">
                                <AvatarImage src={user?.avatar || mockUser.avatar} />
                                <AvatarFallback className="bg-muted text-xs">
                                  {user?.name?.[0] || mockUser.name[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <Textarea
                                  placeholder="Escreva um comentário..."
                                  className="min-h-[80px] bg-muted/30 border-border/50 focus:border-primary transition-colors"
                                  value={newComment[post.id] || ''}
                                  onChange={(e) =>
                                    setNewComment((prev) => ({
                                      ...prev,
                                      [post.id]: e.target.value,
                                    }))
                                  }
                                />
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => handleAddComment(post.id)}
                                    className="bg-gradient-gold hover:bg-primary text-background font-semibold"
                                  >
                                    Comentar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Tag className="h-16 w-16 mx-auto mb-4 opacity-20 text-primary" />
                  <p className="text-lg">Nenhuma publicação encontrada neste tópico.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Dialog para preview de imagem em tela cheia */}
          {imagePreview && (
            <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
              <DialogContent className="max-w-4xl">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto rounded-lg"
                />
              </DialogContent>
            </Dialog>
          )}
          <Card className="bg-card border border-border/40 shadow-netflix sticky top-20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" /> Grupos Populares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Gestão de Clínica',
                'Marketing Dentário',
                'Ortodontia',
                'Implantes',
              ].map((group) => (
                <Button
                  key={group}
                  variant="ghost"
                  className="w-full justify-start font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <span className="text-primary mr-2">#</span> {group}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
