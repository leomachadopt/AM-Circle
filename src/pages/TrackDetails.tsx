import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle } from 'lucide-react'

export default function TrackDetails() {
  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="pl-0">
        <Link to="/tracks">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Percursos
        </Link>
      </Button>

      <div className="bg-primary text-primary-foreground p-8 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">Aceleração de Vendas</h1>
        <p className="opacity-90 max-w-2xl">
          Uma jornada intensiva para transformar a forma como apresenta os seus
          tratamentos e aumentar significativamente a sua taxa de aceitação.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Etapas do Percurso</h2>

        {[
          {
            id: 1,
            type: 'video',
            title: 'Fundamentos da Venda em Medicina Dentária',
            status: 'completed',
          },
          {
            id: 2,
            type: 'tool',
            title: 'Guião de Primeira Consulta',
            status: 'completed',
          },
          {
            id: 3,
            type: 'video',
            title: 'Ultrapassar Objeções de Preço',
            status: 'current',
          },
          {
            id: 4,
            type: 'task',
            title: 'Aplicar guião em 5 pacientes',
            status: 'locked',
          },
          {
            id: 5,
            type: 'video',
            title: 'Fecho e Negociação',
            status: 'locked',
          },
        ].map((step, index) => (
          <Card
            key={step.id}
            className={`transition-all ${step.status === 'locked' ? 'opacity-50 bg-muted' : 'hover:border-primary/50'}`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm
                ${
                  step.status === 'completed'
                    ? 'bg-green-100 text-green-600'
                    : step.status === 'current'
                      ? 'bg-secondary text-primary'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-xs text-muted-foreground capitalize">
                  {step.type === 'video'
                    ? 'Aula em Vídeo'
                    : step.type === 'tool'
                      ? 'Ferramenta'
                      : 'Tarefa Prática'}
                </p>
              </div>
              <Button
                variant={step.status === 'current' ? 'default' : 'outline'}
                disabled={step.status === 'locked'}
              >
                {step.status === 'completed'
                  ? 'Rever'
                  : step.status === 'current'
                    ? 'Continuar'
                    : 'Bloqueado'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
