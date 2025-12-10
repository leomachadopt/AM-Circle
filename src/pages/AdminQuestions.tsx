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
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search, CheckCircle2, XCircle, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

type Question = {
  id: number
  userId: number
  subject: string
  question: string
  eventId: number | null
  answered: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    name: string
    email: string
  }
}

export default function AdminQuestions() {
  const { token } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/questions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Buscar informações dos usuários para cada pergunta
        const questionsWithUsers = await Promise.all(
          data.map(async (q: Question) => {
            try {
              const userResponse = await fetch(`${API_URL}/users/${q.userId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              if (userResponse.ok) {
                const userData = await userResponse.json()
                return { ...q, user: userData }
              }
              return q
            } catch (error) {
              console.error('Erro ao buscar usuário:', error)
              return q
            }
          })
        )
        setQuestions(questionsWithUsers)
      } else {
        toast.error('Erro ao carregar perguntas')
      }
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsAnswered = async (questionId: number) => {
    try {
      setIsUpdating(true)
      const response = await fetch(`${API_URL}/questions/${questionId}/answer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success('Pergunta marcada como respondida!')
        fetchQuestions()
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao atualizar pergunta')
      }
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question)
    setIsDialogOpen(true)
  }

  const filteredQuestions = questions.filter((q) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      q.subject.toLowerCase().includes(searchLower) ||
      q.question.toLowerCase().includes(searchLower) ||
      q.user?.name.toLowerCase().includes(searchLower) ||
      q.user?.email.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Perguntas de Mentorias</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as perguntas enviadas pelos usuários.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Perguntas</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar perguntas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">
                        {format(new Date(question.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{question.user?.name || 'Usuário'}</span>
                          <span className="text-xs text-muted-foreground">
                            {question.user?.email || ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={question.subject}>
                          {question.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={question.answered ? 'default' : 'secondary'}
                          className={
                            question.answered
                              ? 'bg-green-500/20 text-green-600 border-green-500/30'
                              : ''
                          }
                        >
                          {question.answered ? (
                            <>
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Respondida
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Pendente
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewQuestion(question)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          {!question.answered && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkAsAnswered(question.id)}
                              disabled={isUpdating}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Marcar como Respondida
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma pergunta encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Pergunta</DialogTitle>
            <DialogDescription>
              Informações completas da pergunta enviada
            </DialogDescription>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Usuário</label>
                <p className="text-sm font-medium">
                  {selectedQuestion.user?.name || 'Usuário'} ({selectedQuestion.user?.email || ''})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Envio</label>
                <p className="text-sm">
                  {format(new Date(selectedQuestion.createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Assunto</label>
                <p className="text-sm font-medium">{selectedQuestion.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Pergunta</label>
                <div className="mt-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-sm whitespace-pre-wrap">{selectedQuestion.question}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-2">
                  <Badge
                    variant={selectedQuestion.answered ? 'default' : 'secondary'}
                    className={
                      selectedQuestion.answered
                        ? 'bg-green-500/20 text-green-600 border-green-500/30'
                        : ''
                    }
                  >
                    {selectedQuestion.answered ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Respondida
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 h-3 w-3" />
                        Pendente
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedQuestion && !selectedQuestion.answered && (
              <Button
                onClick={() => {
                  handleMarkAsAnswered(selectedQuestion.id)
                  setIsDialogOpen(false)
                }}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Marcar como Respondida
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


