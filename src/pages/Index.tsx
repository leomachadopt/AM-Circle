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
import { pt } from 'date-fns/locale'

export default function Index() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-primary text-shadow-gold animate-slide-in-left">
              Olá, {mockUser.name}!
            </h1>
            <p className="text-lg text-foreground/90 animate-slide-up">
              Bem-vindo de volta ao seu hub de excelência dentária.
            </p>
          </div>
          <Button
            asChild
            className="bg-gradient-gold hover:bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-gold transition-all duration-300 px-8 h-12 animate-scale-in"
          >
            <Link to="/ai-assistant">
              <Bot className="mr-2 h-5 w-5" />
              Pergunte à IA
            </Link>
          </Button>
        </div>
      </div>

      {/* Progress & Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border border-border/40 shadow-netflix hover:shadow-gold hover:border-primary/30 transition-all duration-300 animate-scale-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Progresso Geral
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{mockUser.progress}%</div>
            <Progress
              value={mockUser.progress}
              className="h-2 mt-3 bg-muted"
              indicatorClassName="bg-gradient-gold"
            />
            <p className="text-xs text-muted-foreground mt-2">
              <span className="text-primary font-semibold">+2%</span> desde a semana passada
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border/40 shadow-netflix hover:shadow-gold hover:border-primary/30 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Aulas Assistidas
            </CardTitle>
            <PlayCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12</div>
            <p className="text-xs text-muted-foreground mt-3">
              <span className="text-foreground font-semibold">3 aulas</span> pendentes no módulo atual
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border/40 shadow-netflix hover:shadow-gold hover:border-primary/30 transition-all duration-300 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Próxima Mentoria
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground truncate">Vendas Avançadas</div>
            <p className="text-xs text-muted-foreground mt-1">15 Jun, 19:00</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Tasks */}
        <Card className="col-span-4 bg-card border border-border/40 shadow-netflix">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Tarefas Pendentes</CardTitle>
            <CardDescription className="text-muted-foreground">
              As suas prioridades para esta semana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  id: 1,
                  text: 'Assistir à aula: Definição Estratégica de Preços',
                  link: '/academy',
                },
                { id: 2, text: 'Preencher KPIs mensais', link: '/kpis' },
                {
                  id: 3,
                  text: 'Descarregar lista de verificação de abertura',
                  link: '/tools',
                },
              ].map((task) => (
                <div
                  key={task.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/5 border border-border/30 hover:border-primary/30 transition-all duration-300"
                >
                  <Checkbox id={`task-${task.id}`} className="border-primary data-[state=checked]:bg-gradient-gold" />
                  <label
                    htmlFor={`task-${task.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1 cursor-pointer text-foreground"
                  >
                    {task.text}
                  </label>
                  <Button variant="ghost" size="sm" asChild className="hover:text-primary hover:bg-primary/10">
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
        <Card className="col-span-3 bg-card border border-border/40 shadow-netflix">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Alertas</CardTitle>
            <CardDescription className="text-muted-foreground">Atualizações importantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30 hover:border-primary/50 transition-colors">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Nova aula disponível
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Módulo de Marketing atualizado com aula sobre Instagram Ads.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-secondary/10 rounded-lg border border-secondary/30 hover:border-secondary/50 transition-colors">
                <Calendar className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Lembrete de Mentoria
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sessão em direto amanhã às 19h.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Events */}
      <Card className="bg-card border border-border/40 shadow-netflix">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {mockEvents
              .filter((e) => e.type === 'Em Direto')
              .map((event, index) => (
                <div
                  key={event.id}
                  className="flex flex-col p-5 border border-border/40 rounded-xl hover:border-primary/50 bg-muted/20 hover:bg-muted/30 transition-all duration-300 hover:shadow-gold netflix-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-xs font-bold text-primary-foreground bg-gradient-gold px-3 py-1.5 rounded-lg w-fit mb-3 shadow-sm">
                    {event.type}
                  </span>
                  <h3 className="font-bold text-lg mb-2 text-foreground">{event.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    {format(new Date(event.date), "dd 'de' MMMM, HH:mm", {
                      locale: pt,
                    })}
                  </div>
                  <Button className="mt-auto w-full bg-primary/20 hover:bg-gradient-gold text-foreground hover:text-primary-foreground border border-primary/30 font-semibold transition-all duration-300">
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
