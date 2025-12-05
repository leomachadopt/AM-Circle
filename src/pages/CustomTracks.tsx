import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Route, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CustomTracks() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          Trilhas Personalizadas
        </h1>
        <p className="text-muted-foreground">
          Caminhos de aprendizagem desenhados para o seu momento atual.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center mb-2 text-primary">
              <Route className="h-6 w-6" />
            </div>
            <CardTitle>Aceleração de Vendas</CardTitle>
            <CardDescription>
              Foco em aumentar a taxa de conversão e o ticket médio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progresso</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Guião de
                Vendas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Aula:
                Objeções
              </li>
              <li className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border border-muted-foreground" />{' '}
                Aula: Fecho
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link to="/tracks/1">Continuar Percurso</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="opacity-75 hover:opacity-100 transition-opacity">
          <CardHeader>
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center mb-2 text-muted-foreground">
              <Route className="h-6 w-6" />
            </div>
            <CardTitle>Organização Financeira</CardTitle>
            <CardDescription>
              Estruture o fluxo de caixa e a definição de preços.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progresso</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              Inicie este percurso para dominar as finanças da sua clínica.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Iniciar Percurso
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
