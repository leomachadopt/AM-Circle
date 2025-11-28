import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockLessons } from '@/lib/data'
import { PlayCircle, CheckCircle2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Academy() {
  const [activeModule, setActiveModule] = useState('Todos')
  const modules = [
    'Todos',
    'Gestão',
    'Marketing',
    'Atendimento',
    'Liderança',
    'Financeiro',
  ]

  const filteredLessons =
    activeModule === 'Todos'
      ? mockLessons
      : mockLessons.filter((l) => l.module === activeModule)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Academia HBM</h1>
        <p className="text-muted-foreground">
          Domine os pilares do sucesso na odontologia.
        </p>
      </div>

      <Tabs
        defaultValue="Todos"
        className="w-full"
        onValueChange={setActiveModule}
      >
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2">
          {modules.map((module) => (
            <TabsTrigger
              key={module}
              value={module}
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4 py-2 border border-border bg-white"
            >
              {module}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeModule} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <Card
                key={lesson.id}
                className="group hover:shadow-lg transition-all duration-300 border-border/60"
              >
                <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                  <img
                    src={`https://img.usecurling.com/p/400/225?q=dental%20${lesson.module}&color=blue`}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                  {lesson.completed && (
                    <Badge className="absolute top-2 right-2 bg-green-500 hover:bg-green-600">
                      Concluído
                    </Badge>
                  )}
                </div>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="text-xs">
                      {lesson.module}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" /> {lesson.duration}
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {lesson.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button
                    asChild
                    className="w-full mt-2"
                    variant={lesson.completed ? 'secondary' : 'default'}
                  >
                    <Link to={`/academy/lesson/${lesson.id}`}>
                      {lesson.completed ? 'Rever Aula' : 'Assistir Agora'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
