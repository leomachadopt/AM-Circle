import { Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { mockUser, mockEvents } from '@/lib/data'
import {
  Bot,
  Calendar,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Olá, {mockUser.name}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta ao seu hub de excelência odontológica.
          </p>
        </div>
        <Button
          asChild
          className="bg-secondary text-primary hover:bg-secondary/90 font-semibold shadow-sm"
        >
          <Link to="/ai-assistant">
            <Bot className="mr-2 h-5 w-5" />
            Pergunte à IA
          </Link>
        </Button>
      </div>

      {/* Progress & Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Progresso Geral
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUser.progress}%</div>
            <Progress
              value={mockUser.progress}
              className="h-2 mt-2 bg-muted"
              indicatorClassName="bg-primary"
            />
            <p className="text-xs text-muted-foreground mt-2">
              +2% desde a semana passada
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos HBM</CardTitle>
            <div className="h-4 w-4 rounded-full bg-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUser.points}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nível:{' '}
              <span className="font-medium text-primary">{mockUser.level}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aulas Assistidas
            </CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 aulas pendentes no módulo atual
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próxima Mentoria
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">Vendas Avançadas</div>
            <p className="text-xs text-muted-foreground mt-1">15 Jun, 19:00</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Tasks */}
        <Card className="col-span-4 shadow-subtle">
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
            <CardDescription>
              Suas prioridades para esta semana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  text: 'Assistir aula: Precificação Estratégica',
                  link: '/academy',
                },
                { id: 2, text: 'Preencher KPIs mensais', link: '/kpis' },
                { id: 3, text: 'Baixar checklist de abertura', link: '/tools' },
              ].map((task) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <Checkbox id={`task-${task.id}`} />
                  <label
                    htmlFor={`task-${task.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer"
                  >
                    {task.text}
                  </label>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={task.link}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="col-span-3 shadow-subtle">
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Atualizações importantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Nova aula disponível
                  </p>
                  <p className="text-xs text-blue-700">
                    Módulo de Marketing atualizado com aula sobre Instagram Ads.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <Calendar className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Lembrete de Mentoria
                  </p>
                  <p className="text-xs text-yellow-700">
                    Sessão ao vivo amanhã às 19h.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Events */}
      <Card className="shadow-subtle">
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {mockEvents
              .filter((e) => e.type === 'Live')
              .map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <span className="text-xs font-semibold text-secondary-foreground bg-secondary/20 px-2 py-1 rounded w-fit mb-2">
                    {event.type}
                  </span>
                  <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(event.date), "dd 'de' MMMM, HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                  <Button variant="outline" className="mt-auto w-full">
                    Ver Detalhes
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
