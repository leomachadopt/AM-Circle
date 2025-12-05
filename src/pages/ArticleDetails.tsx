import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Calendar, Eye, Share2, Download, MessageCircle, Heart, Reply, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type Article = {
  id: number
  title: string
  slug: string
  category?: string
  description?: string
  fileUrl?: string
  published: boolean
  publishedAt?: string
  views?: number
  downloads?: number
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

type ArticleComment = {
  id: number
  articleId: number
  userId: number
  parentId?: number
  author: string
  avatar?: string
  content: string
  likes: number
  replies?: ArticleComment[]
  createdAt: string
  updatedAt: string
}

export default function ArticleDetails() {
  const { slug } = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comments, setComments] = useState<ArticleComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({})
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editContent, setEditContent] = useState<{ [key: number]: string }>({})
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: number]: boolean }>({})
  const [isEditingComment, setIsEditingComment] = useState<{ [key: number]: boolean }>({})
  const [currentUser] = useState({ id: 1, name: 'Usuário', avatar: '' }) // Mock user - substituir por auth real

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  useEffect(() => {
    if (article?.id) {
      fetchComments()
    }
  }, [article?.id])

  const fetchArticle = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/articles/slug/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data)
      } else {
        console.error('Erro ao carregar artigo')
      }
    } catch (error) {
      console.error('Erro ao buscar artigo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!article?.id) return
    try {
      const response = await fetch(`${API_URL}/articles/${article.id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error)
    }
  }

  const handleDownload = async () => {
    if (!article?.fileUrl) {
      toast.error('Arquivo não disponível')
      return
    }

    try {
      // Incrementar contador de downloads
      await fetch(`${API_URL}/articles/${article.id}/download`, {
        method: 'POST',
      })

      // Abrir PDF em nova aba ou fazer download
      window.open(article.fileUrl, '_blank')
      toast.success('Download iniciado!')
    } catch (error) {
      console.error('Erro ao fazer download:', error)
      // Mesmo assim, tentar abrir o arquivo
      window.open(article.fileUrl, '_blank')
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !article?.id) {
      toast.error('Digite um comentário')
      return
    }

    try {
      setIsSubmittingComment(true)
      const response = await fetch(`${API_URL}/articles/${article.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          author: currentUser.name,
          avatar: currentUser.avatar,
          content: newComment,
        }),
      })

      if (response.ok) {
        setNewComment('')
        toast.success('Comentário publicado!')
        fetchComments() // Recarregar para ter a estrutura correta
      } else {
        toast.error('Erro ao publicar comentário')
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
    if (!content?.trim() || !article?.id) {
      toast.error('Digite uma resposta')
      return
    }

    try {
      setIsSubmittingReply({ ...isSubmittingReply, [parentId]: true })
      const response = await fetch(`${API_URL}/articles/${article.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          author: currentUser.name,
          avatar: currentUser.avatar,
          content: content,
          parentId: parentId,
        }),
      })

      if (response.ok) {
        setReplyContent({ ...replyContent, [parentId]: '' })
        setReplyingTo(null)
        toast.success('Resposta publicada!')
        fetchComments() // Recarregar para mostrar a nova resposta
      } else {
        toast.error('Erro ao publicar resposta')
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
      const response = await fetch(`${API_URL}/articles/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
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
      const response = await fetch(`${API_URL}/articles/comments/${commentId}`, {
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
    try {
      const response = await fetch(`${API_URL}/articles/comments/${commentId}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        // Recarregar comentários para ter a estrutura atualizada
        fetchComments()
      }
    } catch (error) {
      console.error('Erro ao curtir comentário:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.description || article?.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para a área de transferência!')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
          <p className="text-lg">Carregando artigo...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
          <Link to="/articles">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Biblioteca
          </Link>
        </Button>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Artigo não encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
        <Link to="/articles">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Biblioteca
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-8">
          {article.category && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {article.category}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            {article.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {article.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(article.publishedAt), "dd 'de' MMMM 'de' yyyy", {
                    locale: pt,
                  })}
                </span>
              </div>
            )}
            {article.views !== undefined && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{article.views} visualizações</span>
              </div>
            )}
            {article.downloads !== undefined && (
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{article.downloads} downloads</span>
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md hover:shadow-gold transition-all duration-300 border-2 border-primary/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partilhar
              </Button>
            </div>
          </div>
        </div>


        {/* Description */}
        {article.description && (
          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {article.description}
            </div>
          </div>
        )}

        {/* Download Section */}
        {article.fileUrl && (
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Arquivo PDF Disponível</h3>
                  <p className="text-sm text-muted-foreground">
                    Baixe o artigo completo em formato PDF para ler offline
                  </p>
                </div>
                <Button
                  onClick={handleDownload}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-gold transition-all duration-300 border-2 border-primary/50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </article>

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Discussão ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Comment Form */}
            <div className="flex gap-4">
              <Avatar className="border-2 border-primary/30">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-gradient-gold text-primary-foreground font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Partilhe seus pensamentos sobre este artigo..."
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
                    {isSubmittingComment ? 'Publicando...' : 'Publicar Comentário'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Seja o primeiro a comentar!</p>
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
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
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
                              {comment.userId === currentUser.id && (
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

                        {/* Formulário de Resposta */}
                        {replyingTo === comment.id && (
                          <div className="mt-4 pl-4 border-l-2 border-primary/30 space-y-2">
                            <Textarea
                              placeholder="Escreva sua resposta..."
                              value={replyContent[comment.id] || ''}
                              onChange={(e) =>
                                setReplyContent({ ...replyContent, [comment.id]: e.target.value })
                              }
                              rows={2}
                              className="bg-muted/50"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReply(comment.id)}
                                disabled={isSubmittingReply[comment.id] || !replyContent[comment.id]?.trim()}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                              >
                                {isSubmittingReply[comment.id] ? 'Publicando...' : 'Publicar Resposta'}
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
                        )}

                        {/* Respostas */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-3 pl-4 border-l-2 border-primary/20">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar className="border-2 border-primary/20 h-8 w-8">
                                  <AvatarImage src={reply.avatar} />
                                  <AvatarFallback className="bg-primary/20 text-primary-foreground text-xs font-bold">
                                    {reply.author.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{reply.author}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(reply.createdAt), "dd 'de' MMM 'às' HH:mm", {
                                        locale: pt,
                                      })}
                                    </span>
                                    {reply.updatedAt !== reply.createdAt && (
                                      <span className="text-xs text-muted-foreground italic">
                                        (editado)
                                      </span>
                                    )}
                                  </div>
                                  {editingComment === reply.id ? (
                                    <div className="space-y-2">
                                      <Textarea
                                        value={editContent[reply.id] || reply.content}
                                        onChange={(e) =>
                                          setEditContent({ ...editContent, [reply.id]: e.target.value })
                                        }
                                        rows={2}
                                        className="bg-muted/50 text-sm"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleEditComment(reply.id)}
                                          disabled={isEditingComment[reply.id] || !editContent[reply.id]?.trim()}
                                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-7 text-xs"
                                        >
                                          {isEditingComment[reply.id] ? 'Salvando...' : 'Salvar'}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingComment(null)
                                            setEditContent({ ...editContent, [reply.id]: '' })
                                          }}
                                          className="h-7 text-xs"
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm whitespace-pre-wrap text-foreground/80">
                                        {reply.content}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleLikeComment(reply.id)}
                                          className="gap-2 px-2 h-7 text-xs hover:bg-primary/10 hover:text-primary transition-all"
                                        >
                                          <Heart className="h-3 w-3" />
                                          {reply.likes || 0}
                                        </Button>
                                        {reply.userId === currentUser.id && (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setEditingComment(reply.id)
                                                setEditContent({ ...editContent, [reply.id]: reply.content })
                                              }}
                                              className="gap-2 px-2 h-7 text-xs hover:bg-primary/10 hover:text-primary transition-all"
                                            >
                                              <Edit className="h-3 w-3" />
                                              Editar
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteComment(reply.id)}
                                              className="gap-2 px-2 h-7 text-xs hover:bg-destructive/10 hover:text-destructive transition-all"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                              Excluir
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

