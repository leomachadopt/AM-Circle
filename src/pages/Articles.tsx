import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Search, Eye, Calendar, ArrowRight, Download, Plus, Upload, X, File, MessageCircle, ArrowUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

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
  commentsCount?: number
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

// Categorias serão buscadas da API, mas mantemos "Todos" para filtro

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'downloads' | 'comments'>('recent')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    description: '',
    fileUrl: '',
    published: false,
    tags: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoriesError, setCategoriesError] = useState(false)

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        setCategoriesError(false)
      } else {
        // Não fazer log de erro 400 repetidamente para evitar spam no console
        if (response.status !== 400) {
          console.error('Erro ao buscar categorias:', response.status, response.statusText)
        } else {
          // Se for erro 400, marcar como erro para evitar requisições repetidas
          setCategoriesError(true)
        }
        setCategories([])
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      setCategories([])
      setCategoriesError(true)
    }
  }

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (sortBy !== 'recent') {
        params.append('sortBy', sortBy)
      }
      const response = await fetch(`${API_URL}/articles?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      } else {
        // Não fazer log de erro 400 repetidamente para evitar spam no console
        if (response.status !== 400) {
          console.error('Erro ao carregar artigos:', response.status, response.statusText)
        }
        setArticles([])
      }
    } catch (error) {
      console.error('Erro ao buscar artigos:', error)
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são permitidos')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Tamanho máximo: 10MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo primeiro')
      return
    }

    try {
      setUploading(true)
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)

      const response = await fetch(`${API_URL}/articles/upload`, {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        const baseUrl = API_URL.replace('/api', '')
        const fullUrl = data.fileUrl || `${baseUrl}/uploads/${data.filename}`
        setUploadedFileUrl(fullUrl)
        setFormData((prev) => ({ ...prev, fileUrl: fullUrl }))
        setSelectedFile(null)
        toast.success('Arquivo enviado com sucesso!')
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao fazer upload do arquivo')
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadedFileUrl('')
    setFormData((prev) => ({ ...prev, fileUrl: '' }))
  }

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      toast.error('Preencha o título do artigo')
      return
    }

    let finalFileUrl = uploadedFileUrl || formData.fileUrl

    if (selectedFile && !finalFileUrl) {
      try {
        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append('file', selectedFile)

        const response = await fetch(`${API_URL}/articles/upload`, {
          method: 'POST',
          body: formDataUpload,
        })

        if (response.ok) {
          const data = await response.json()
          const baseUrl = API_URL.replace('/api', '')
          finalFileUrl = data.fileUrl || `${baseUrl}/uploads/${data.filename}`
          setUploadedFileUrl(finalFileUrl)
          setFormData((prev) => ({ ...prev, fileUrl: finalFileUrl }))
          setSelectedFile(null)
        } else {
          const error = await response.json().catch(() => ({}))
          toast.error(error.error || 'Erro ao fazer upload do arquivo')
          setUploading(false)
          return
        }
      } catch (error) {
        console.error('Erro ao fazer upload:', error)
        toast.error('Erro ao conectar com o servidor para fazer upload')
        setUploading(false)
        return
      } finally {
        setUploading(false)
      }
    }

    if (!finalFileUrl) {
      toast.error('Selecione e faça upload do arquivo PDF ou insira uma URL')
      return
    }

    try {
      setIsSubmitting(true)
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []

      const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug || generateSlug(formData.title),
          category: formData.category || null,
          description: formData.description || null,
          fileUrl: finalFileUrl,
          published: formData.published || false,
          tags: tagsArray,
        }),
      })

      if (response.ok) {
        toast.success('Artigo criado com sucesso!')
        setIsDialogOpen(false)
        setFormData({
          title: '',
          slug: '',
          category: '',
          description: '',
          fileUrl: '',
          published: false,
          tags: '',
        })
        setSelectedFile(null)
        setUploadedFileUrl('')
        fetchArticles()
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Erro ao criar artigo')
      }
    } catch (error) {
      console.error('Erro ao criar artigo:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      activeCategory === 'Todos' || article.category === activeCategory
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-shadow-gold animate-slide-in-left">
            Biblioteca de Artigos
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl animate-slide-up">
            Conhecimento especializado para transformar a sua prática clínica.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 items-center">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="views">Mais Vistos</SelectItem>
                <SelectItem value="downloads">Mais Baixados</SelectItem>
                <SelectItem value="comments">Mais Comentados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-gold transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Artigo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Artigo</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar um novo artigo
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitArticle}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">
                      Título <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value })
                        if (!formData.slug) {
                          setFormData((prev) => ({
                            ...prev,
                            slug: generateSlug(e.target.value),
                          }))
                        }
                      }}
                      placeholder="Ex: Como aumentar a produtividade da clínica"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="slug">Slug (URL)</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        placeholder="sera-gerado-automaticamente"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição do Artigo</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      placeholder="Descrição completa do artigo..."
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="file">
                      Arquivo PDF <span className="text-destructive">*</span>
                    </Label>
                    {uploadedFileUrl ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted">
                        <File className="h-5 w-5 text-primary" />
                        <span className="flex-1 text-sm truncate">
                          {uploadedFileUrl.split('/').pop() || 'Arquivo carregado'}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={handleRemoveFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          id="file"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="cursor-pointer"
                        />
                        {selectedFile && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {selectedFile.name}
                            </span>
                            <Button
                              type="button"
                              onClick={handleFileUpload}
                              disabled={uploading}
                              size="sm"
                            >
                              {uploading ? (
                                'Enviando...'
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Enviar Arquivo
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">ou</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const url = prompt('Digite a URL do arquivo PDF:')
                              if (url) {
                                setUploadedFileUrl(url)
                                setFormData((prev) => ({ ...prev, fileUrl: url }))
                              }
                            }}
                          >
                            Inserir URL manualmente
                          </Button>
                        </div>
                        {formData.fileUrl && !uploadedFileUrl && (
                          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                            <span className="text-sm truncate flex-1">
                              {formData.fileUrl}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setFormData({ ...formData, fileUrl: '' })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Faça upload do arquivo PDF do artigo (máximo 10MB)
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="gestão, produtividade, clínica"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, published: checked })
                      }
                    />
                    <Label htmlFor="published" className="cursor-pointer">
                      Publicar artigo imediatamente
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormData({
                        title: '',
                        slug: '',
                        category: '',
                        description: '',
                        fileUrl: '',
                        published: false,
                        tags: '',
                      })
                      setSelectedFile(null)
                      setUploadedFileUrl('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || uploading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                  >
                    {isSubmitting ? 'Criando...' : 'Criar Artigo'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs
          defaultValue="Todos"
          className="w-full"
          onValueChange={setActiveCategory}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Categorias</h2>
            <TabsList className="w-full justify-start overflow-x-auto h-auto p-2 bg-card/50 backdrop-blur-sm gap-3 border border-border/50 rounded-xl">
              <TabsTrigger
                value="Todos"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold rounded-lg px-6 py-2.5 border border-border/30 bg-muted/30 hover:bg-muted/50 transition-all duration-300 font-medium font-semibold"
              >
                Todos
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.name}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-gold rounded-lg px-6 py-2.5 border border-border/30 bg-muted/30 hover:bg-muted/50 transition-all duration-300 font-medium font-semibold"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategory} className="mt-8">
            {isLoading ? (
              <div className="text-center py-20 text-muted-foreground">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
                <p className="text-lg">Carregando artigos...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-lg text-muted-foreground">
                  Nenhum artigo disponível no momento.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  {activeCategory === 'Todos'
                    ? 'Todos os Artigos'
                    : `Artigos de ${activeCategory}`}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredArticles.map((article, index) => (
                    <Card
                      key={article.id}
                      className="group netflix-card bg-card border border-border/40 overflow-hidden shadow-netflix hover:shadow-gold hover:border-primary/50"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader className="p-4 space-y-2">
                        {article.category && (
                          <Badge className="w-fit bg-primary/40 text-primary border-primary/50 font-semibold">
                            {article.category}
                          </Badge>
                        )}
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {article.title}
                        </CardTitle>
                        {article.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                          {article.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(new Date(article.publishedAt), 'dd/MM/yyyy', {
                                  locale: pt,
                                })}
                              </span>
                            </div>
                          )}
                          {article.views !== undefined && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{article.views}</span>
                            </div>
                          )}
                          {article.downloads !== undefined && (
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              <span>{article.downloads}</span>
                            </div>
                          )}
                          {article.commentsCount !== undefined && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{article.commentsCount}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button
                          asChild
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg hover:shadow-gold transition-all duration-300 border-2 border-primary/50"
                        >
                          <Link to={`/articles/${article.slug}`}>
                            Ver Artigo
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

