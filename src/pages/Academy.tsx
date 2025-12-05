import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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

export default function Academy() {
  const [activeModule, setActiveModule] = useState('Todos')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const modules = [
    'Todos',
    'Gestão',
    'Marketing',
    'Atendimento',
    'Liderança',
    'Financeiro',
  ]

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
        toast.error('Erro ao carregar aulas do servidor')
        setLessons([])
      }
    } catch (error) {
      console.error('Erro ao buscar aulas:', error)
      toast.error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
      setLessons([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLessons =
    activeModule === 'Todos'
      ? lessons
      : lessons.filter((l) => l.module === activeModule)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-shadow-gold animate-slide-in-left">
            Academia AMC
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl animate-slide-up">
            Domine os pilares do sucesso na medicina dentária com conteúdo exclusivo e de alta qualidade.
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <Tabs
        defaultValue="Todos"
        className="w-full"
        onValueChange={setActiveModule}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Categorias</h2>
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-2 bg-card/50 backdrop-blur-sm gap-3 border border-border/50 rounded-xl">
            {modules.map((module) => (
              <TabsTrigger
                key={module}
                value={module}
                className="text-foreground/80 data-[state=active]:bg-gradient-gold data-[state=active]:text-background data-[state=active]:shadow-gold rounded-lg px-6 py-2.5 border border-border/30 bg-muted/30 hover:bg-primary/10 hover:text-foreground transition-all duration-300 font-medium"
              >
                {module}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeModule} className="mt-8">
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4" />
              <p className="text-lg">Carregando aulas...</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">Nenhuma aula disponível no momento.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                {activeModule === 'Todos' ? 'Todas as Aulas' : `Aulas de ${activeModule}`}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredLessons.map((lesson, index) => (
                  <Card
                    key={lesson.id}
                    className="group netflix-card bg-card border border-border/40 overflow-hidden shadow-netflix hover:shadow-gold hover:border-primary/50"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="aspect-video bg-black relative overflow-hidden">
                      <img
                        src={
                          lesson.imageUrl ||
                          `https://img.usecurling.com/p/400/225?q=dental%20${lesson.module}&color=gold`
                        }
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-netflix"
                      />
                      <div className="absolute inset-0 bg-gradient-overlay opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircle className="h-16 w-16 text-primary drop-shadow-2xl animate-scale-in" />
                      </div>
                      <Badge className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border-primary/30 text-primary font-semibold">
                        {lesson.module}
                      </Badge>
                    </div>
                    <CardHeader className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          <span className="font-medium">{lesson.duration}</span>
                        </div>
                      </div>
                      <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Button
                        asChild
                        className="w-full bg-gradient-gold hover:bg-primary text-primary-foreground font-semibold shadow-lg hover:shadow-gold transition-all duration-300"
                      >
                        <Link to={`/academy/lesson/${lesson.id}`}>
                          Assistir Agora
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
  )
}
