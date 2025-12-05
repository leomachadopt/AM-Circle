import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart } from 'recharts'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const chartConfig = {
  revenue: {
    label: 'Faturação (€)',
    color: 'hsl(var(--chart-1))',
  },
  casesPresented: {
    label: 'Casos apresentados',
    color: 'hsl(var(--chart-2))',
  },
}

export default function KPIs() {
  const { user, token } = useAuth()
  const [kpiData, setKpiData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(new Date().getMonth() + 1).padStart(2, '0')
  )
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear())
  )
  const [formData, setFormData] = useState({
    revenue: '',
    casesPresented: '',
    casesClosed: '',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Carregar KPIs mensais
  useEffect(() => {
    if (user && token) {
      fetchKPIs()
    }
  }, [user, token])

  // Carregar dados do mês selecionado
  useEffect(() => {
    if (user && token && selectedMonth && selectedYear) {
      loadMonthData()
    }
  }, [selectedMonth, selectedYear, user, token])

  const fetchKPIs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/kpis/monthly`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        // Transformar dados para o formato dos gráficos
        const formattedData = data.map((kpi: any) => {
          const date = new Date(kpi.date)
          const metadata = kpi.metadata || {}
          
          return {
            month: format(date, 'MMM', { locale: ptBR }),
            fullMonth: format(date, 'MMMM yyyy', { locale: ptBR }),
            revenue: metadata.revenue || 0,
            casesPresented: metadata.casesPresented || 0,
            casesClosed: metadata.casesClosed || 0,
            date: date,
          }
        })

        // Ordenar por data
        formattedData.sort((a: any, b: any) => 
          a.date.getTime() - b.date.getTime()
        )

        // Preencher meses faltantes com zeros (últimos 6 meses)
        const last6Months = getLast6Months()
        const completeData = last6Months.map(monthDate => {
          const existing = formattedData.find(
            (d: any) => 
              d.date.getMonth() === monthDate.getMonth() &&
              d.date.getFullYear() === monthDate.getFullYear()
          )
          
          return existing || {
            month: format(monthDate, 'MMM', { locale: ptBR }),
            fullMonth: format(monthDate, 'MMMM yyyy', { locale: ptBR }),
            revenue: 0,
            casesPresented: 0,
            casesClosed: 0,
            date: monthDate,
          }
        })

        setKpiData(completeData)
      }
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMonthData = async () => {
    if (!selectedMonth || !selectedYear) return
    
    try {
      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)

      const response = await fetch(`${API_URL}/kpis/month/${year}/${month}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const metadata = data.metadata || {}
        
        setFormData({
          revenue: metadata.revenue?.toString() || '',
          casesPresented: metadata.casesPresented?.toString() || '',
          casesClosed: metadata.casesClosed?.toString() || '',
        })
        setIsEditing(true)
      } else if (response.status === 404) {
        // Mês sem dados
        setFormData({
          revenue: '',
          casesPresented: '',
          casesClosed: '',
        })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do mês:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMonth || !selectedYear) {
      toast.error('Por favor, selecione um mês e ano')
      return
    }
    
    if (!formData.revenue || !formData.casesPresented || !formData.casesClosed) {
      toast.error('Por favor, preencha todos os campos')
      return
    }

    try {
      setIsSaving(true)
      const year = parseInt(selectedYear)
      const month = parseInt(selectedMonth)

      const response = await fetch(`${API_URL}/kpis/monthly`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          year,
          month,
          revenue: parseFloat(formData.revenue),
          casesPresented: parseInt(formData.casesPresented),
          casesClosed: parseInt(formData.casesClosed),
        }),
      })

      if (response.ok) {
        toast.success('KPIs salvos com sucesso!')
        await fetchKPIs()
        await loadMonthData()
      } else {
        const error = await response.json().catch(() => ({}))
        toast.error(error.error || 'Erro ao salvar KPIs')
      }
    } catch (error) {
      console.error('Erro ao salvar KPIs:', error)
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setIsSaving(false)
    }
  }

  const getLast6Months = () => {
    const months = []
    const today = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push(date)
    }
    
    return months
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-black via-card to-black border border-primary/20 shadow-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 text-shadow-gold animate-slide-in-left">
            KPIs e Evolução
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl animate-slide-up">
            Acompanhe os números que realmente importam para o seu crescimento.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Faturação</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Carregando...</p>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Casos Apresentados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>Carregando...</p>
                </div>
              ) : (
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
                      dataKey="casesPresented"
                      stroke="var(--color-casesPresented)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Editar Dados' : 'Registar Novos Dados'}
              </CardTitle>
              <CardDescription>
                Selecione o mês de referência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mês</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Mês" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const monthNumber = String(i + 1).padStart(2, '0')
                          const monthDate = new Date(2000, i, 1)
                          const monthName = format(monthDate, 'MMMM', { locale: ptBR })
                          return (
                            <SelectItem key={monthNumber} value={monthNumber}>
                              {monthName}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Ano</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - 5 + i
                          return (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Faturação Total (€)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.revenue}
                    onChange={(e) =>
                      setFormData({ ...formData, revenue: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Casos apresentados</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.casesPresented}
                    onChange={(e) =>
                      setFormData({ ...formData, casesPresented: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Casos fechados</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.casesClosed}
                    onChange={(e) =>
                      setFormData({ ...formData, casesClosed: e.target.value })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving
                    ? 'Guardando...'
                    : isEditing
                    ? 'Atualizar KPIs'
                    : 'Guardar KPIs'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
