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
import { Plus, Pencil, Trash2, Search, BookOpen, Eye, Download, Upload, X, File, Tag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format } from 'date-fns'

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

type Category = {
  id: number
  name: string
  slug: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles')
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
  })
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
  const [categoriesError, setCategoriesError] = useState(false)

  useEffect(() => {
    fetchArticles()
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchArticles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/articles?published=all`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data)
      } else {
        console.error('Erro ao carregar artigos:', response.status, response.statusText)
        setArticles([])
      }
    } catch (error) {
      console.error('Erro ao buscar artigos:', error)
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }

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
          console.error('Erro ao carregar categorias:', response.status, response.statusText)
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

  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryFormData({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setEditingCategory(null)
      setCategoryFormData({
        name: '',
        description: '',
      })
    }
    setIsCategoryDialogOpen(true)
  }

  const handleCloseCategoryDialog = () => {
    setIsCategoryDialogOpen(false)
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
    })
  }

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoryFormData.name.trim()) {
      toast.error('Nome da categoria é obrigatório')
      return
    }

    try {
      if (editingCategory) {
        const response = await fetch(`${API_URL}/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: categoryFormData.name,
            description: categoryFormData.description,
          }),
        })

        if (response.ok) {
          toast.success('Categoria atualizada com sucesso!')
          fetchCategories()
          handleCloseCategoryDialog()
        } else {
          const error = await response.json().catch(() => ({}))
          toast.error(error.error || 'Erro ao atualizar categoria')
        }
      } else {
        const response = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: categoryFormData.name,
            description: categoryFormData.description,
          }),
        })

        if (response.ok) {
          toast.success('Categoria criada com sucesso!')
          fetchCategories()
          handleCloseCategoryDialog()
        } else {
          const error = await response.json().catch(() => ({}))
          toast.error(error.error || 'Erro ao criar categoria')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Categoria excluída com sucesso!')
        fetchCategories()
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao excluir categoria')
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article)
      setFormData({
        title: article.title,
        slug: article.slug,
        category: article.category || '',
        description: article.description || '',
        fileUrl: article.fileUrl || '',
        published: article.published,
        tags: article.tags?.join(', ') || '',
      })
      setUploadedFileUrl(article.fileUrl || '')
      setSelectedFile(null)
    } else {
      setEditingArticle(null)
      setFormData({
        title: '',
        slug: '',
        category: '',
        description: '',
        fileUrl: '',
        published: false,
        tags: '',
      })
      setUploadedFileUrl('')
      setSelectedFile(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingArticle(null)
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
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar se é PDF
      if (file.type !== 'application/pdf') {
        toast.error('Apenas arquivos PDF são permitidos')
        return
      }
      // Validar tamanho (10MB)
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
        // Construir URL completa do arquivo
          const baseUrl = API_URL.replace('/api', '')
          finalFileUrl = data.fileUrl || `${baseUrl}/uploads/${data.filename}`
          setUploadedFileUrl(finalFileUrl)
          setFormData((prev) => ({ ...prev, fileUrl: finalFileUrl }))
          setSelectedFile(null)
        toast.success('Arquivo enviado com sucesso!')
      } else {
        const error = await response.json()
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

  const handleEnterUrlManually = () => {
    const url = prompt('Digite a URL do arquivo PDF:')
    if (url) {
      setUploadedFileUrl(url)
      setFormData((prev) => ({ ...prev, fileUrl: url }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title) {
      toast.error('Preencha o título do artigo')
      return
    }

    // Se há um arquivo selecionado mas não foi enviado, fazer upload primeiro
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
          const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
          console.error('Erro no upload:', error)
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
      const tagsArray = formData.tags
        ? formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []

      console.log('Enviando artigo:', {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        fileUrl: finalFileUrl,
        hasFileUrl: !!finalFileUrl
      })

      if (editingArticle) {
        // Atualizar artigo existente
        const response = await fetch(`${API_URL}/articles/${editingArticle.id}`, {
          method: 'PUT',
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
          toast.success('Artigo atualizado com sucesso!')
          fetchArticles()
          handleCloseDialog()
        } else {
          toast.error('Erro ao atualizar artigo')
        }
      } else {
        // Criar novo artigo
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
          fetchArticles()
          handleCloseDialog()
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Erro ao criar artigo:', errorData)
          toast.error(errorData.details || errorData.error || 'Erro ao criar artigo')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar artigo:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/articles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Artigo excluído com sucesso!')
        fetchArticles()
      } else {
        toast.error('Erro ao excluir artigo')
      }
    } catch (error) {
      console.error('Erro ao excluir artigo:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          Painel Administrativo - Biblioteca de Artigos
        </h1>
        <p className="text-muted-foreground">
          Gerencie os artigos e categorias da biblioteca
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'articles' | 'categories')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="articles">
            <BookOpen className="h-4 w-4 mr-2" />
            Artigos
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="h-4 w-4 mr-2" />
            Categorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Artigos Cadastrados</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[300px]"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Artigo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingArticle ? 'Editar Artigo' : 'Novo Artigo'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingArticle
                        ? 'Atualize as informações do artigo'
                        : 'Preencha os dados para criar um novo artigo'}
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
                          onChange={(e) => {
                            setFormData({ ...formData, title: e.target.value })
                            if (!editingArticle && !formData.slug) {
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
                          <p className="text-xs text-muted-foreground">
                            URL amigável do artigo (gerado automaticamente se vazio)
                          </p>
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
                                onClick={handleEnterUrlManually}
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
                          Publicar artigo
                        </Label>
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
                        {editingArticle ? 'Atualizar' : 'Criar'}
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
              Carregando artigos...
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Nenhum artigo encontrado com o termo pesquisado'
                : 'Nenhum artigo cadastrado. Clique em "Novo Artigo" para começar.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visualizações</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-[300px] truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      {article.category ? (
                        <Badge variant="outline">{article.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={article.published ? 'default' : 'secondary'}
                      >
                        {article.published ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        <span>{article.views || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3 text-muted-foreground" />
                        <span>{article.downloads || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(article)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(article.id)}
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Categorias Cadastradas</CardTitle>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenCategoryDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCategory
                          ? 'Atualize as informações da categoria'
                          : 'Preencha os dados para criar uma nova categoria'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCategory}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="categoryName">
                            Nome <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="categoryName"
                            value={categoryFormData.name}
                            onChange={(e) =>
                              setCategoryFormData({ ...categoryFormData, name: e.target.value })
                            }
                            placeholder="Ex: Gestão"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="categoryDescription">Descrição</Label>
                          <Textarea
                            id="categoryDescription"
                            value={categoryFormData.description}
                            onChange={(e) =>
                              setCategoryFormData({
                                ...categoryFormData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Descrição opcional da categoria..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseCategoryDialog}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingCategory ? 'Atualizar' : 'Criar'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma categoria cadastrada. Clique em "Nova Categoria" para começar.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {category.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenCategoryDialog(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

