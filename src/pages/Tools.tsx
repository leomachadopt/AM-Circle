import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockTools } from '@/lib/data'
import {
  Calculator,
  FileText,
  CheckSquare,
  Table,
  File,
  Download,
  ArrowRight,
} from 'lucide-react'

export default function Tools() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const categories = [
    'Todos',
    'Calculadoras',
    'Guiões',
    'Listas de Verificação',
    'Folhas de Cálculo',
    'PNOs',
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="h-6 w-6" />
      case 'FileText':
        return <FileText className="h-6 w-6" />
      case 'CheckSquare':
        return <CheckSquare className="h-6 w-6" />
      case 'Table':
        return <Table className="h-6 w-6" />
      default:
        return <File className="h-6 w-6" />
    }
  }

  const filteredTools =
    activeCategory === 'Todos'
      ? mockTools
      : mockTools.filter((t) => t.category === activeCategory)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">
          Ferramentas de Gestão
        </h1>
        <p className="text-muted-foreground">
          Recursos práticos para otimizar o dia a dia da sua clínica.
        </p>
      </div>

      <Tabs
        defaultValue="Todos"
        className="w-full"
        onValueChange={setActiveCategory}
      >
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4 py-2 border border-border bg-white"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="p-2 bg-muted rounded-lg text-primary">
                    {getIcon(tool.icon)}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-lg mb-2">{tool.title}</CardTitle>
                  <CardDescription className="mb-4">
                    {tool.category}
                  </CardDescription>
                  <Button variant="outline" className="w-full group">
                    Aceder à Ferramenta{' '}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
