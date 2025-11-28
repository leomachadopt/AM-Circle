import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, AlertTriangle } from 'lucide-react'

const kpiData = [
  { month: 'Jan', revenue: 45000, patients: 120 },
  { month: 'Fev', revenue: 52000, patients: 135 },
  { month: 'Mar', revenue: 48000, patients: 125 },
  { month: 'Abr', revenue: 61000, patients: 150 },
  { month: 'Mai', revenue: 55000, patients: 140 },
  { month: 'Jun', revenue: 67000, patients: 165 },
]

const chartConfig = {
  revenue: {
    label: 'Faturamento (R$)',
    color: 'hsl(var(--chart-1))',
  },
  patients: {
    label: 'Pacientes',
    color: 'hsl(var(--chart-2))',
  },
}

export default function KPIs() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">KPIs & Evolução</h1>
        <p className="text-muted-foreground">
          Acompanhe os números que realmente importam para o seu crescimento.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Faturamento</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={kpiData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Volume de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={kpiData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="patients"
                    stroke="var(--color-patients)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" /> Análise da IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Seu faturamento cresceu{' '}
                <span className="font-bold text-green-600">22%</span> em Junho
                comparado a Maio. Ótimo trabalho!
              </p>
              <p>
                A taxa de conversão de pacientes novos está estável. Sugiro
                revisar o script de primeira consulta para tentar aumentar esse
                número no próximo mês.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registrar Novos Dados</CardTitle>
              <CardDescription>Mês de Referência: Julho</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label>Faturamento Total (R$)</Label>
                  <Input type="number" placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label>Número de Pacientes</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Ticket Médio (R$)</Label>
                  <Input type="number" placeholder="0,00" />
                </div>
                <Button className="w-full">Salvar KPIs</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
