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
import { Plus, Pencil, Trash2, Search, Wrench, Upload, X, File } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type Tool = {
  id: number
  title: string
  category: string
  icon?: string
  description?: string
  fileUrl?: string
  createdAt?: string
  updatedAt?: string
}

const categories = [
  'Calculadoras',
  'Guiões',
  'Listas de Verificação',
  'Folhas de Cálculo',
  'PNOs',
]

const icons = [
  'Calculator',
  'FileText',
  'CheckSquare',
  'Table',
  'File',
  'Download',
  'Settings',
  'BarChart',
]

export default function AdminTools() {
  const [tools, setTools] = useState<Tool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    icon: '',
    description: '',
    fileUrl: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>('')

  useEffect(() => {
    fetchTools()
  }, [])

  const fetchTools = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/tools`)
      if (response.ok) {
        const data = await response.json()
        setTools(data)
      } else {
        console.error('Erro ao carregar ferramentas:', response.status, response.statusText)
        setTools([])
      }
    } catch (error) {
      console.error('Erro ao buscar ferramentas:', error)
      setTools([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (tool?: Tool) => {
    if (tool) {
      setEditingTool(tool)
      setFormData({
        title: tool.title,
        category: tool.category,
        icon: tool.icon || '',
        description: tool.description || '',
        fileUrl: tool.fileUrl || '',
      })
      setUploadedFileUrl(tool.fileUrl || '')
      setSelectedFile(null)
    } else {
      setEditingTool(null)
      setFormData({
        title: '',
        category: '',
        icon: '',
        description: '',
        fileUrl: '',
      })
      setUploadedFileUrl('')
      setSelectedFile(null)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingTool(null)
    setFormData({
      title: '',
      category: '',
      icon: '',
      description: '',
      fileUrl: '',
    })
    setSelectedFile(null)
    setUploadedFileUrl('')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

      const response = await fetch(`${API_URL}/tools/upload`, {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        // Construir URL completa do arquivo
        const baseUrl = API_URL.replace('/api', '')
        const fullUrl = `${baseUrl}${data.fileUrl}`
        setUploadedFileUrl(fullUrl)
        setFormData({ ...formData, fileUrl: fullUrl })
        toast.success('Arquivo enviado com sucesso!')
        setSelectedFile(null)
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
    setFormData({ ...formData, fileUrl: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      if (editingTool) {
        // Atualizar ferramenta existente
        const response = await fetch(`${API_URL}/tools/${editingTool.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success('Ferramenta atualizada com sucesso!')
          fetchTools()
          handleCloseDialog()
        } else {
          toast.error('Erro ao atualizar ferramenta')
        }
      } else {
        // Criar nova ferramenta
        const response = await fetch(`${API_URL}/tools`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          toast.success('Ferramenta criada com sucesso!')
          fetchTools()
          handleCloseDialog()
        } else {
          toast.error('Erro ao criar ferramenta')
        }
      }
    } catch (error) {
      console.error('Erro ao salvar ferramenta:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/tools/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Ferramenta excluída com sucesso!')
        fetchTools()
      } else {
        toast.error('Erro ao excluir ferramenta')
      }
    } catch (error) {
      console.error('Erro ao excluir ferramenta:', error)
      toast.error('Erro ao conectar com o servidor')
    }
  }

  const filteredTools = tools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          Painel Administrativo - Ferramentas de Gestão
        </h1>
        <p className="text-muted-foreground">
          Gerencie as ferramentas disponíveis na plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Ferramentas Cadastradas</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar ferramentas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full sm:w-[300px]"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Ferramenta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTool
                        ? 'Atualize as informações da ferramenta'
                        : 'Preencha os dados para criar uma nova ferramenta'}
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
                          placeholder="Ex: Calculadora de ROI"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="category">
                            Categoria <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) =>
                              setFormData({ ...formData, category: value })
                            }
                            required
                          >
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="icon">Ícone</Label>
                          <Select
                            value={formData.icon}
                            onValueChange={(value) =>
                              setFormData({ ...formData, icon: value })
                            }
                          >
                            <SelectTrigger id="icon">
                              <SelectValue placeholder="Selecione o ícone" />
                            </SelectTrigger>
                            <SelectContent>
                              {icons.map((icon) => (
                                <SelectItem key={icon} value={icon}>
                                  {icon}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="file">Arquivo da Ferramenta</Label>
                        <div className="space-y-3">
                          {uploadedFileUrl ? (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium truncate">
                                  {uploadedFileUrl.split('/').pop()}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveFile}
                                className="h-8 w-8"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : selectedFile ? (
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2">
                                <File className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium truncate">
                                  {selectedFile.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </span>
                              </div>
                              <div className="flex gap-2">
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
                                      Enviar
                                    </>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setSelectedFile(null)}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                id="file"
                                type="file"
                                onChange={handleFileSelect}
                                accept=".pdf,.xlsx,.xls,.doc,.docx,.csv,.png,.jpg,.jpeg"
                                className="flex-1"
                              />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Faça upload de um arquivo (PDF, Excel, Word, CSV, imagens) ou{' '}
                            <button
                              type="button"
                              onClick={() => {
                                const url = prompt('Cole a URL do arquivo:')
                                if (url) {
                                  setFormData({ ...formData, fileUrl: url })
                                  setUploadedFileUrl(url)
                                }
                              }}
                              className="text-primary hover:underline"
                            >
                              insira uma URL
                            </button>
                          </p>
                        </div>
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
                          placeholder="Descrição da ferramenta..."
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
                        {editingTool ? 'Atualizar' : 'Criar'}
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
              Carregando ferramentas...
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? 'Nenhuma ferramenta encontrada com o termo pesquisado'
                : 'Nenhuma ferramenta cadastrada. Clique em "Nova Ferramenta" para começar.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Ícone</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools.map((tool) => (
                  <TableRow key={tool.id}>
                    <TableCell className="font-medium">
                      {tool.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tool.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {tool.icon ? (
                        <Badge variant="secondary">{tool.icon}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(tool)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(tool.id)}
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

