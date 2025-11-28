import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Download, MessageSquare } from 'lucide-react'
import { mockLessons } from '@/lib/data'

export default function LessonDetails() {
  const { id } = useParams()
  const lesson = mockLessons.find((l) => l.id === Number(id)) || mockLessons[0]

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
          {/* Video Player Placeholder */}
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg">
            <img
              src={`https://img.usecurling.com/p/800/450?q=dental%20class&color=blue`}
              alt="Video Thumbnail"
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <PlayCircleIcon className="h-20 w-20 text-white relative z-10 cursor-pointer hover:scale-110 transition-transform" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground">
              Nesta aula, vamos explorar os conceitos fundamentais para
              transformar a sua clínica num negócio rentável e organizado.
              Aprenda as estratégias que o top 1% dos dentistas utiliza.
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
                  <div className="flex items-start space-x-3">
                    <Checkbox id="task1" />
                    <label
                      htmlFor="task1"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Fazer o diagnóstico inicial da clínica usando a ferramenta
                      SWOT.
                    </label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="task2" />
                    <label
                      htmlFor="task2"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Definir 3 metas principais para o próximo trimestre.
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="materials" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red-100 text-red-600 rounded flex items-center justify-center">
                        PDF
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Diapositivos da Aula
                        </p>
                        <p className="text-xs text-muted-foreground">2.4 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 text-green-600 rounded flex items-center justify-center">
                        XLS
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          Folha de Cálculo de Exercícios
                        </p>
                        <p className="text-xs text-muted-foreground">1.1 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comments" className="mt-4">
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Ainda sem comentários. Seja o primeiro a perguntar!</p>
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
              {mockLessons
                .filter((l) => l.id !== lesson.id)
                .slice(0, 3)
                .map((nextLesson) => (
                  <div
                    key={nextLesson.id}
                    className="flex gap-3 items-start group cursor-pointer"
                  >
                    <div className="h-16 w-24 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img
                        src={`https://img.usecurling.com/p/200/150?q=dental&seed=${nextLesson.id}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                        {nextLesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {nextLesson.duration}
                      </p>
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

function PlayCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
        clipRule="evenodd"
      />
    </svg>
  )
}
